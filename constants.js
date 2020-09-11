

//== Constants =================================================================

//-- Generic geometric and physical constants ----
export const TAU = Math.PI*2;
export const HEX = 16;

//-- Audio parameters ----------------------------
export const RATE_SAMPLE = 16000;
export const BPS_DEFAULT = 8;
export const BPS_MAX = 63;
export const TPB_DEFAULT = 4;
export const TPB_MAX = 15;
export const VOLUME_MAX = 63;
export const CHANNELS_NUMBER = 5;
export const CHANNEL_NOISE = 4;
export const PATTERNS_MAX = 16;
export const PATTERN_LENGTH_MAX = 256;

//-- Pattern cell data masking -------------------
// 0b NIVE NNNNNN IIII VVVVVV EEEEEEEEEEEE 
export const MASK_CELL_FLAG_NOTE       = 0b10000000000000000000000000000000;
export const MASK_CELL_FLAG_INSTRUMENT = 0b01000000000000000000000000000000;
export const MASK_CELL_FLAG_VOLUME     = 0b00100000000000000000000000000000;
export const MASK_CELL_FLAG_EFFECT     = 0b00010000000000000000000000000000;
export const MASK_CELL_NOTE_WIDTH = 6;
export const MASK_CELL_NOTE_OFFSET = 22;
export const MASK_CELL_NOTE_STOP = Math.pow(2, MASK_CELL_NOTE_WIDTH)-1;
export const MASK_CELL_INSTRUMENT_WIDTH = 4;
export const MASK_CELL_INSTRUMENT_OFFSET = 18;
export const MASK_CELL_VOLUME_WIDTH = 6;
export const MASK_CELL_VOLUME_OFFSET = 12;
export const MASK_CELL_EFFECT_WIDTH = 12;
export const MASK_CELL_EFFECT_OFFSET = 0;
export const NOTE_NOISE_MAX = 0b1111;

//-- Client Actions ------------------------------
let INDEX = 1;
export const ACTION_SONG = INDEX++;
export const ACTION_PLAYBACK_PLAY = INDEX++;
export const ACTION_PLAYBACK_STOP = INDEX++;

//-- Processor Feedback --------------------------
export const RESPONSE_READY = INDEX++;
export const RESPONSE_PATTERN_ROW = INDEX++;
export const RESPONSE_SONG_END = INDEX++;
