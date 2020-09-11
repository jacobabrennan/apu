

//== Pattern Building ==========================================================

//-- Dependencies --------------------------------
import {
    MASK_CELL_FLAG_NOTE,
    MASK_CELL_FLAG_INSTRUMENT,
    MASK_CELL_FLAG_VOLUME,
    MASK_CELL_FLAG_EFFECT,
    MASK_CELL_NOTE_WIDTH,
    MASK_CELL_NOTE_OFFSET,
    MASK_CELL_INSTRUMENT_WIDTH,
    MASK_CELL_INSTRUMENT_OFFSET,
    MASK_CELL_VOLUME_WIDTH,
    MASK_CELL_VOLUME_OFFSET,
    MASK_CELL_EFFECT_WIDTH,
    MASK_CELL_EFFECT_OFFSET,
} from './constants.js';

//-- Pattern Creation ----------------------------
export function pattern(rows, channelNumber) {
    return new Uint32Array(rows*channelNumber);
}

//-- Cell Parsing --------------------------------
export function cell(note, instrument, volume, effect) {
    let R = 0;
    if(Number.isFinite(note)) {
        R |= MASK_CELL_FLAG_NOTE | note << MASK_CELL_NOTE_OFFSET;
    }
    if(Number.isFinite(instrument)) {
        R |= MASK_CELL_FLAG_INSTRUMENT | instrument << MASK_CELL_INSTRUMENT_OFFSET;
    }
    if(Number.isFinite(volume)) {
        R |= MASK_CELL_FLAG_VOLUME | volume << MASK_CELL_VOLUME_OFFSET;
    }
    if(Number.isFinite(effect)) {
        R |= MASK_CELL_FLAG_EFFECT | effect << MASK_CELL_EFFECT_OFFSET;
    }
    return R;
}
export function cellParse(cellData32Bit) {
    let note = (cellData32Bit >> MASK_CELL_NOTE_OFFSET) & (Math.pow(2,MASK_CELL_NOTE_WIDTH)-1);
    let instrument = (cellData32Bit >> MASK_CELL_INSTRUMENT_OFFSET) & (Math.pow(2,MASK_CELL_INSTRUMENT_WIDTH)-1);
    let volume = (cellData32Bit >> MASK_CELL_VOLUME_OFFSET) & (Math.pow(2,MASK_CELL_VOLUME_WIDTH)-1);
    let effect = (cellData32Bit >> MASK_CELL_EFFECT_OFFSET) & (Math.pow(2,MASK_CELL_EFFECT_WIDTH)-1);
    return [
        (cellData32Bit&MASK_CELL_FLAG_NOTE)? note : undefined,
        (cellData32Bit&MASK_CELL_FLAG_INSTRUMENT)? instrument : undefined,
        (cellData32Bit&MASK_CELL_FLAG_VOLUME)? volume : undefined,
        (cellData32Bit&MASK_CELL_FLAG_EFFECT)? effect : undefined,
    ];
}
export function empty() {
    return 0;
}
