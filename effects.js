

//== Effects ===================================================================

//-- Effect Handler ------------------------------
export default function handleEffect(apu, effect, indexChannel) {
    // Cleanup previous effect
    const theChannel = apu.channels[indexChannel];
    if(theChannel.effect) {
        theChannel.effect(theChannel, null);
    }
    // Parse input
    const effectIndex = (effect >>> 8)&(0b1111);
    const arg1 = (effect >>> 4)&(0b1111);
    const arg2 = (effect >>> 0)&(0b1111);
    // Handle individual effects; indicate jumps where necessary
    switch(effectIndex) {
        case 0b0000:
            apu.channels[indexChannel].effectAdd(effectArpeggio, arg1, arg2);
            break;
        case 0b0001:
            return immediateLoop(apu, indexChannel, arg1, arg2);
        case 0b0010:
            return immediatePatternJump(apu, indexChannel, arg1, arg2);
        case 0b0011:
            return immediateRowJump(apu, indexChannel, arg1, arg2);
        case 0b0100:
            apu.channels[indexChannel].effectAdd(effectRetrigger, arg1, arg2);
            break;
        case 0b0101: 
            apu.channels[indexChannel].effectAdd(effectDelay, arg1, arg2);
            break;
        case 0b0110:
            return immediateSongVolume(apu, indexChannel, arg1, arg2);
        case 0b0111:
            return immediateSongBPS(apu, indexChannel, arg1, arg2);
        case 0b1000:
            return immediateSongTPB(apu, indexChannel, arg1, arg2);
        case 0b1001: break;
        case 0b1010: break;
        case 0b1011: break;
        case 0b1100: break;
        case 0b1101: break;
        case 0b1110: break;
        case 0b1111: break;
    }
    // Indicate no jump
    return false;
}

//-- Channel Controlled Effects ------------------
function effectArpeggio(theChannel, tick) {
    if(!theChannel.note) { return;}
    let noteValue = theChannel.note.value;
    if(tick === null) {
        theChannel.wave.noteSet(noteValue);
        return;
    }
    switch(tick % 3) {
        case 0:
            theChannel.wave.noteSet(noteValue);
            break;
        case 1:
            theChannel.wave.noteSet(noteValue+theChannel.effectParameter1);
            break;
        case 2:
            theChannel.wave.noteSet(noteValue+theChannel.effectParameter2);
            break;
    }
}
function effectRetrigger(theChannel, tick) {
    if(tick === null) { return;}
    if(!theChannel.note) { return;}
    if(tick%theChannel.effectParameter2) { return;}
    theChannel.note.retrigger();
}
function effectDelay(theChannel, tick) {
    if(!theChannel.note) { return;}
    const note = theChannel.note;
    const instrument = theChannel.note.instrument;
    if(tick === 0) {
        note.nodeIndexCurrent = instrument.envelopeDuration.length-1;
        note.duration = Infinity;
        note.volumeGoal = 0;
        note.volume = 0;
    }
    else if(tick === theChannel.effectParameter2) {
        note.nodeIndexCurrent = 0;
        note.duration = 0;
        note.volumeGoal = instrument.envelopeVolume[0];
        note.volume = note.volumeGoal;
    }
}

//-- Immediate Effects ---------------------------
function immediateLoop(apu, indexChannel, arg1, repeatTimes) {
    // Handle Loop point set command
    const theChannel = apu.channels[indexChannel];
    if(!repeatTimes) {
        // don't retrigger on every loop iteration
        if(!theChannel.repeat) {
            theChannel.repeat = {
                count: 0,
            };
        }
        // Set repeat point to this row
        theChannel.repeat.row = apu.songCurrent.indexRow;
        return false;
    }
    // Loop from start if no loop start specified
    if(!theChannel.repeat) {
        theChannel.repeat = {
            row: 0,
            count: 0,
        };
    }
    // Do the actual repeating
    if(theChannel.repeat.count < repeatTimes) {
        theChannel.repeat.count++;
        apu.songCurrent.indexRow = theChannel.repeat.row;
    }
    // Cleanup for next loop
    else {
        delete theChannel.repeat;
        return false;
    }
    // Indicate a jump
    return true;
}
function immediatePatternJump(apu, indexChannel, arg1, indexPattern) {
    apu.songCurrent.indexPattern = indexPattern;
    apu.songCurrent.indexRow = 0;
    return true;
}
function immediateRowJump(apu, indexChannel, nibble1, nibble2) {
    const indexRow = (nibble1 << 4)|nibble2;
    apu.songCurrent.indexRow = indexRow;
    return true;
}
function immediateSongVolume(apu, indexChannel, nibble1, nibble2) {
    const volumeNew = (nibble1 << 4)|nibble2;
    apu.songCurrent.volumeSet(volumeNew);
}
function immediateSongBPS(apu, indexChannel, nibble1, nibble2) {
    const bpsNew = (nibble1 << 4)|nibble2;
    apu.songCurrent.bpsSet(bpsNew);
}
function immediateSongTPB(apu, indexChannel, arg1, tpbNew) {
    apu.songCurrent.tpbSet(tpbNew);
}
