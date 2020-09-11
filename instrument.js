

//== Instrument ================================================================

//-- Dependencies --------------------------------
import AudioProcessor from './audio_processor.js';

//------------------------------------------------
export default class Instrument extends AudioProcessor {
    constructor(data) {
        super();
        this.sustain = data.sustain;
        this.loopEnd = data.loopEnd;
        this.loopStart = data.loopStart;
        this.envelopeVolume = data.envelopeVolume;
        this.envelopeDuration = data.envelopeDuration;
    }
}
