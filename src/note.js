

//== Note ======================================================================

//-- Dependencies --------------------------------
import AudioProcessor from './audio_processor.js';

//------------------------------------------------
export default class Note extends AudioProcessor {
    constructor(instrument, value) {
        super();
        this.value = value;
        this.instrument = instrument;
        this.nodeIndexCurrent = 0;
        this.duration = 0;
        this.volumeGoal = instrument.envelopeVolume[0];
        this.volume = this.volumeGoal;
    }
    sample() {
        if(this.nodeIndexCurrent >= this.instrument.envelopeVolume.length) {
            return 0;
            // return null;
        }
        //
        if(!this.live && this.nodeIndexCurrent === this.instrument.sustain) {
            return this.instrument.envelopeVolume[this.nodeIndexCurrent];
        }
        if(this.duration-- <= 0) {
            this.nodeIndexCurrent++;
            if(this.nodeIndexCurrent >= this.instrument.envelopeVolume.length) {
                this.duration = Infinity;
                return 0;
                // return null;
            }
            if(!this.live && this.nodeIndexCurrent === this.instrument.loopEnd) {
                this.nodeIndexCurrent = this.instrument.loopStart;
            }
            this.volume = this.volumeGoal;
            this.volumeGoal = this.instrument.envelopeVolume[this.nodeIndexCurrent];
            this.duration = this.instrument.envelopeDuration[this.nodeIndexCurrent];
        }
        //
        this.volume += (this.volumeGoal - this.volume) / Math.max(1, this.duration);
        return this.volume;
    }
    cut() {
        this.live = true;
    }
    retrigger() {
        this.nodeIndexCurrent = 0;
        this.duration = 0;
        this.volumeGoal = this.instrument.envelopeVolume[0];
        this.volume = this.volumeGoal;
    }
}
