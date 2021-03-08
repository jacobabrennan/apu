

//== Audio Processing Unit (Testing Mock) ======================================

//-- Dependencies --------------------------------
import {
    ACTION_SONG,
    ACTION_PLAYBACK_PLAY,
    ACTION_PLAYBACK_STOP,
    RESPONSE_READY,
} from '../src/constants.js';
import Song from '../src/song.js';
import Channel from '../src/channel.js';
import {
    WaveSquare,
    WaveSaw,
    WaveTriangle,
    WaveNoise,
} from '../src/wave_forms.js';

//-- Processor Worklet ---------------------------
export default class ApuMock {
    constructor(messageHandler) {
        this.messageHandler = messageHandler;
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
        this.messageHandler({
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
}
