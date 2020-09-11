

//==============================================================================

//-- Aggregation ---------------------------------
import './apu.js';
export {
    TAU,
    RATE_SAMPLE,
    BPS_MAX,
    TPB_MAX,
    CHANNELS_NUMBER,
    MASK_CELL_NOTE_STOP,
    MASK_CELL_VOLUME_WIDTH,
    ACTION_SONG,
    ACTION_PLAYBACK_PLAY,
    ACTION_PLAYBACK_STOP,
    RESPONSE_READY,
    RESPONSE_PATTERN_ROW,
    RESPONSE_SONG_END,
    HEX,
    BPS_DEFAULT,
    TPB_DEFAULT,
    VOLUME_MAX,
    CHANNEL_NOISE,
    PATTERNS_MAX,
    PATTERN_LENGTH_MAX,
    MASK_CELL_FLAG_NOTE,
    MASK_CELL_FLAG_INSTRUMENT,
    MASK_CELL_FLAG_VOLUME,
    MASK_CELL_FLAG_EFFECT,
    MASK_CELL_NOTE_WIDTH,
    MASK_CELL_NOTE_OFFSET,
    MASK_CELL_INSTRUMENT_WIDTH,
    MASK_CELL_INSTRUMENT_OFFSET,
    MASK_CELL_VOLUME_OFFSET,
    MASK_CELL_EFFECT_WIDTH,
    MASK_CELL_EFFECT_OFFSET,
    NOTE_NOISE_MAX,
} from './constants.js';
export {
    cell,
    cellParse,
    empty,
    pattern,
} from './pattern_building.js';

//-- Audio Message Interface ---------------------
import { RATE_SAMPLE } from './constants.js';
export default class AudioMessageInterface {
    constructor(handleMessage, url) {
        this.handleMessage = handleMessage;
        this.url = url;
    }
    async setup() { // Cannot be a constructor. Must be initiated by user action.
        // Create audio context
        const optionsAudio = {
            sampleRate: RATE_SAMPLE,
        };
        const context = new AudioContext(optionsAudio);
        // Create audio processing worklet
        await context.audioWorklet.addModule(this.url);
        const optionsProcessor = {
            outputChannelCount: [1], // mono sound
            // outputChannelCount: [2], // Stereo sound
        };
        this.processor = new AudioWorkletNode(context, 'apu', optionsProcessor);
        // Connect audio graph
        this.processor.connect(context.destination);
        // Listen for messages
        this.processor.port.onmessage = (eventMessage) => {
            this.handleMessage(eventMessage.data.action, eventMessage.data.data);
        }
    }
    async messageSend(action, data) {
        if(!this.processor) {
            await this.setup();
        }
        this.processor.port.postMessage({
            action: action,
            data: data,
        });
    }
}
