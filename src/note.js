

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
        this.live = true;
    }
    sample() {
        // Generate silence beyond envelope
        if(this.nodeIndexCurrent >= this.instrument.envelopeVolume.length) {
            return 0;
        }
        // Generate constant tone on sustain node
        if(this.live && this.nodeIndexCurrent === this.instrument.sustain) {
            return this.instrument.envelopeVolume[this.nodeIndexCurrent];
        }
        // Advance node at end of node duration
        if(this.duration-- <= 0) {
            this.nodeIndexCurrent++;
            // Loop nodes
            if(this.live && this.nodeIndexCurrent > this.instrument.loopEnd) {
                this.nodeIndexCurrent = this.instrument.loopStart;
            }
            // Generate silence beyond envelope
            if(this.nodeIndexCurrent >= this.instrument.envelopeVolume.length) {
                this.duration = Infinity;
                return 0;
            }
            //
            this.volume = this.volumeGoal;
            this.volumeGoal = this.instrument.envelopeVolume[this.nodeIndexCurrent];
            this.duration = this.instrument.envelopeDuration[this.nodeIndexCurrent];
        }
        // Advance volume towards goal
        this.volume += (this.volumeGoal - this.volume) / Math.max(1, this.duration);
        // Generate Sample
        return this.volume;
    }
    cut() {
        this.live = false;
    }
    retrigger() {
        this.nodeIndexCurrent = 0;
        this.duration = 0;
        this.volumeGoal = this.instrument.envelopeVolume[0];
        this.volume = this.volumeGoal;
    }
}
