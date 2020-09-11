

//== Channel ====================================================================

//-- Dependencies --------------------------------
import AudioProcessor from './audio_processor.js';
import Note from './note.js';

//------------------------------------------------
export default class Channel extends AudioProcessor {
    constructor(waveForm) {
        super();
        this.wave = new waveForm();
        this.volume = 1;
    }
    reset() {
        this.volume = 1;
        delete this.note;
        delete this.repeat;
    }
    tickAdvance(tick) {
        if(this.effect) {
            this.effect(this, tick);
        }
    }
    sample() {
        if(!this.note) { return 0;}
        const noteSample = this.note.sample();
        if(noteSample === null) {
            this.reset();
            return 0;
        }
        return this.wave.sample() * this.volume * noteSample;
    }
    notePlay(note, instrument) {
        if(this.effect) {
            delete this.effect;
        }
        this.wave.noteSet(note);
        let volumeOld = 0;
        if(this.note) {
            volumeOld = this.note.volume;
        }
        this.note = new Note(instrument, note);
        this.note.volume = volumeOld;
    }
    noteEnd() {
        if(!this.note) { return;}
        this.note.cut();
    }
    volumeSet(volumeNew) {
        this.volume = volumeNew;
    }
    effectAdd(effect, arg1, arg2) {
        this.effectParameter1 = arg1;
        this.effectParameter2 = arg2;
        this.effect = effect; 
    }
}
