

//== Song ======================================================================

//-- Dependencies --------------------------------
import {
    RATE_SAMPLE,
    BPS_MAX,
    TPB_MAX,
    CHANNELS_NUMBER,
    MASK_CELL_NOTE_STOP,
    MASK_CELL_VOLUME_WIDTH,
    RESPONSE_PATTERN_ROW,
    RESPONSE_SONG_END,
} from './constants.js';
import {
    cellParse,
} from './pattern_building.js';
import AudioProcessor from './audio_processor.js';
import Instrument from './instrument.js';
import handleEffect from './effects.js';

//-- Song Playing --------------------------------
export default class Song extends AudioProcessor {
    playing = false
    indexPattern = 0
    indexRow = 0
    indexSample = 0
    volume = 1
    beatsPerSecond = 1
    ticksPerBeat = 1
    samplesPerRow = 1
    samplesPerTick = 1
    constructor(apu, dataSong) {
        // Ensure parent behavior
        super();
        //
        this.apu = apu;
        // Configure basic settings
        if(dataSong.volume !== undefined) {
            this.volumeSet(dataSong.volume);
        }
        // Populate instruments and patterns
        this.pattern = dataSong.patterns;
        this.instrument = dataSong.instruments.map(function (data) {
            return new Instrument(data);
        });
        // Calculate metrics
        if(dataSong.bps) {
            this.bpsSet(dataSong.bps);
        }
        if(dataSong.tpb) {
            this.tpbSet(dataSong.tpb);
        }
    }
    sample() {
        if(!this.playing) { return 0;}
        let jump = false;
        if(!(this.indexSample%this.samplesPerRow)) {
            this.indexSample = 0;
            jump = this.playRow();
            if(jump) {
                this.indexSample = 0;
                this.playRow();
                this.tickAdvance(0);
            }
        }
        if(!jump && !(this.indexSample%this.samplesPerTick)) {
            const indexTick = this.indexSample/this.samplesPerTick;
            this.tickAdvance(indexTick);
        }
        this.indexSample++;
    }
    tickAdvance(indexTick) {
        this.apu.channels[0].tickAdvance(indexTick);
        this.apu.channels[1].tickAdvance(indexTick);
        this.apu.channels[2].tickAdvance(indexTick);
        this.apu.channels[3].tickAdvance(indexTick);
        this.apu.channels[4].tickAdvance(indexTick);
    }
    playRow() {
        let jump = false;
        let patternCurrent = this.pattern[this.indexPattern];
        if(this.indexRow >= patternCurrent.length / CHANNELS_NUMBER) {
            this.indexPattern++;
            patternCurrent = this.pattern[this.indexPattern];
            this.indexRow = 0;
        }
        if(!patternCurrent) {
            this.end();
            return;
        }
        this.apu.messageSend(RESPONSE_PATTERN_ROW, {
            patternId: this.indexPattern,
            row: this.indexRow,
        });
        const dataPattern = this.pattern[this.indexPattern]
        const offsetCell = this.indexRow*CHANNELS_NUMBER;
        for(let indexChannel = 0; indexChannel < CHANNELS_NUMBER; indexChannel++) {
            const cell = dataPattern[offsetCell+indexChannel];
            if(!cell) { continue;}
            const [note, indexInstrument, volume, effect] = cellParse(cell);
            let instrument = null;
            if(indexInstrument !== undefined) {
                instrument = this.instrument[indexInstrument];
            }
            if(volume !== undefined) {
                this.apu.channels[indexChannel].volumeSet(
                    volume / (Math.pow(2, MASK_CELL_VOLUME_WIDTH)-1)
                );
            }
            if(note === MASK_CELL_NOTE_STOP) {
                this.apu.channels[indexChannel].noteEnd();
            } else if(note !== undefined && instrument) {
                this.apu.channels[indexChannel].notePlay(note, instrument);
            }
            if(effect !== undefined) {
                const channelJump = handleEffect(this.apu, effect, indexChannel);
                jump = channelJump || jump;
            }
        }
        if(!jump) {
            this.indexRow++;
        }
        return jump;
    }
    play() {
        this.playing = true;
    }
    pause() {
        this.playing = false;
        for(let indexChannel = 0; indexChannel < CHANNELS_NUMBER; indexChannel++) {
            this.apu.channels[indexChannel].noteEnd();
        }
    }
    end() {
        this.playing = false;
        this.indexPattern = 0;
        this.indexRow = 0;
        this.apu.messageSend(RESPONSE_SONG_END, {});
        for(let aChannel of this.apu.channels) {
            aChannel.reset();
        }
    }
    volumeSet(volumeNew) {
        this.volume = volumeNew / ((1 << MASK_CELL_VOLUME_WIDTH)-1);
    }
    bpsSet(bpsNew) {
        bpsNew = Math.min(BPS_MAX, bpsNew);
        this.beatsPerSecond = bpsNew;
        this.samplesPerRow = Math.ceil(RATE_SAMPLE/this.beatsPerSecond);
        this.samplesPerTick = Math.ceil(this.samplesPerRow/this.ticksPerRow);
    }
    tpbSet(tpbNew) {
        tpbNew = Math.min(TPB_MAX, tpbNew);
        this.ticksPerRow = tpbNew;
        this.samplesPerRow = Math.ceil(RATE_SAMPLE/this.beatsPerSecond);
        this.samplesPerTick = Math.ceil(this.samplesPerRow/this.ticksPerRow);
    }
}
