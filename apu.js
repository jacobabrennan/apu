

//== Audio Processing Unit =====================================================

//-- Dependencies --------------------------------
import {
    ACTION_SONG,
    ACTION_PLAYBACK_PLAY,
    ACTION_PLAYBACK_STOP,
    RESPONSE_READY,
} from './constants.js';
import Song from './song.js';
import Channel from './channel.js';
import {
    WaveSquare,
    WaveSaw,
    WaveTriangle,
    WaveNoise,
} from './wave_forms.js';

//-- Account for loading on main thread ----------
let WorkletClass = class {};
let registerFunction = function () {};
if(typeof AudioWorkletProcessor !== 'undefined') {
    WorkletClass = AudioWorkletProcessor;
}
if(typeof registerProcessor !== 'undefined') {
    registerFunction = registerProcessor;
}

//-- Processor Worklet ---------------------------
registerFunction('apu', class extends WorkletClass {
    constructor() {
        super();
        this.port.onmessage = (eventMessage) => {
            this.messageReceive(eventMessage.data.action, eventMessage.data.data);
        }
        this.messageSend(RESPONSE_READY, {});
    }
    process(inputs, outputs, parameters) {
        const output = outputs[0][0];
        let bufferLength = output.length;
        for(let index=0; index < bufferLength; index++) {
            output[index] = this.sample();
        }
        return true;
    }
    messageSend(action, data) {
        this.port.postMessage({
            action: action,
            data: data,
        });
    }
    messageReceive(action, data) {
        switch(action) {
            case ACTION_PLAYBACK_PLAY:
                this.play();
                break;
            case ACTION_PLAYBACK_STOP:
                this.pause();
                break;
            case ACTION_SONG:
                this.playSong(data);
                break;
        }
    }
    channels = [
        new Channel(WaveSquare),
        new Channel(WaveSquare),
        new Channel(WaveSaw),
        new Channel(WaveTriangle),
        new Channel(WaveNoise),
    ]
    sample() {
        if(!this.songCurrent) {
            return 0;
        }
        this.songCurrent.sample();
        const volume = this.songCurrent.volume;
        return volume * (
            this.channels[0].sample() +
            this.channels[1].sample() +
            this.channels[2].sample() +
            this.channels[3].sample() +
            this.channels[4].sample()
        );
    }
    playSong(songData) {
        for(let channel of this.channels) {
            channel.reset();
        }
        this.songCurrent = new Song(this, songData);
    }
    play() {
        if(!this.songCurrent) { return;}
        this.songCurrent.play();
    }
    pause() {
        if(!this.songCurrent) { return;}
        this.songCurrent.pause();
    }
});
