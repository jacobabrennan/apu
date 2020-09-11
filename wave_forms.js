

//== Wave Forms ================================================================

//-- Dependencies --------------------------------
import {
    TAU,
    RATE_SAMPLE,
} from './constants.js';
import AudioProcessor from './audio_processor.js';

//-- Base Wave Form ------------------------------
export class WavePhase extends AudioProcessor {
    phase = 0
    phaseOffset = 0
    phaseLength = undefined
    frequency = undefined
    constructor() {
        super();
        this.setFrequency(1);
    }
    noteSet(note) {
        this.setFrequency(55*Math.pow(2, note/12));
    }
    setFrequency(frequencyNew) {
        //
        this.phaseLength = RATE_SAMPLE / frequencyNew;
        this.frequency = frequencyNew;
        this.phaseOffset = this.phase*this.phaseLength;
    }
    sample() {
        this.phaseOffset = (this.phaseOffset+1) % this.phaseLength;
        this.phase = this.phaseOffset / this.phaseLength;
        return this.phase;
    }
}

//-- Square Wave ---------------------------------
export class WaveSquare extends WavePhase {
    duty = 1/2
    lastValue = 0
    lastCount = 0
    setDuty(dutyNew) { // 16 values possible, only 8 unique
        if(this.phase >= this.duty) {
            if(this.phase < dutyNew) {
                this.phase = dutyNew;
                this.phaseOffset = this.phase*this.phaseLength;
            }
        } else {
            if(this.phase >= dutyNew) {
                this.phase = 0;
                this.phaseOffset = 0;
            }
        }
        this.duty = dutyNew;
    }
    sample() {
        return (super.sample() >= this.duty)? 1 : -1;
    }
}

//-- Saw Wave ------------------------------------
export class WaveSaw extends WavePhase {
    sample() {
        return super.sample()*2 - 1;
    }
}

//-- Sine Wave -----------------------------------
export class WaveSine extends WavePhase {
    sample() {
        return Math.sin(super.sample() * TAU);
    }
}

//-- Triangle Wave -------------------------------
export class WaveTriangle extends WavePhase {
    sample() {
        return Math.abs((super.sample()*4)-2)-1;
    }
}

//-- Noise Generator -----------------------------
export class WaveNoise extends WavePhase { // 16 "frequencies" available, 0=high, 15=low
    // const timerPeriod = [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068];
    // const timerPeriod = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    // When the timer clocks the shift register, the following actions occur in order: 
    //     Feedback is calculated as the exclusive-OR of bit 0 and one other bit: bit 6 if Mode flag is set, otherwise bit 1.
    //     The shift register is shifted right by one bit.
    //     Bit 14, the leftmost bit, is set to the feedback calculated earlier.
    // setFrequency(frequencyNew) {
    //     this.frequency = frequencyNew;
    //     this.phaseOffset = Math.floor(RATE_SAMPLE / this.frequency);
    //     // this.phaseOffset = Math.floor(RATE_SAMPLE / timerPeriod[this.frequency]);
    // }
    sr = 1
    noteSet(note) {
        this.frequency = note+1; // Zero doesn't work with modulo
    }
    sample() {
        this.phase = (this.phase+1)%this.frequency; // see note above
        if(!this.phase) {
            this.sr = (((this.sr ^ (this.sr >>> 1)) & 0b1) << 14) | (this.sr >>> 1);
        }
        return ((this.sr&1)*2)-1;
    }
}
