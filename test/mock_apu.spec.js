

//== Test Mock Apu =============================================================

//-- Dependencies --------------------------------
import assert from 'assert';
import ApuMock from '../mocks/mock_apu.js';
import {
    ACTION_PLAYBACK_PLAY,
    ACTION_SONG,
    RESPONSE_READY,
    RESPONSE_SONG_END,
} from '../src/constants.js';

//-- Constants -----------------------------------
const SONG_BLANK = {"id":null,"name":null,"author":"asdf","volume":4,"beatsPerSecond":5,"ticksPerBeat":4,"patterns":[{"name":"New Pattern","data":[0,0,0,0,0]}],"instruments":[{"name":"New Instrument","sustain":0,"envelopeVolume":[0.5],"envelopeDuration":[0]}]};

//-- Test Suite ----------------------------------
describe('Basic Functioning Test', function () {
    it ('Can be instanced', function () {
        const APU = new ApuMock(function () {});
        assert(APU);
    });
    it ('Sends RESPONSE_READY after construction', async function () {
        const messageResolver = new Promise(function (resolve, reject) {
            new ApuMock(function (message) {
                resolve(message.action);
            });
        });
        const receivedMessaged = await messageResolver;
        assert.equal(receivedMessaged, RESPONSE_READY);
    });
    it ('Processes the correct number of samples', function () {
        // Create new APU
        const APU = new ApuMock(function (message) {});
        APU.messageReceive(ACTION_SONG, SONG_BLANK);
        // Process the samples
        const sampleLength = 256;
        const resultBuffer = [];
        for(let bufferIndex = 0; bufferIndex < sampleLength; bufferIndex++) {
            resultBuffer[bufferIndex] = 1;
        }
        const inputs = [];
        const outputs = [
            [ resultBuffer ],
        ];
        const parameters = [];
        APU.process(inputs, outputs, parameters);
        // Check the samples for correctness
        let countZero = 0;
        for(let bufferIndex = 0; bufferIndex < sampleLength; bufferIndex++) {
            if(resultBuffer[bufferIndex] !== 0) { break;}
            countZero++;
        }
        assert.equal(countZero, sampleLength);
    });
    it ('Sends end message at end of song', async function () {
        // Setup message handling resolver
        let messageEndResolver;
        const processingPromise = new Promise(function (resolve, reject) {
            messageEndResolver = resolve;
        });
        function messageHandler(message) {
            if(message.action !== RESPONSE_SONG_END) { return;}
            messageEndResolver(message);
        }
        // Create new APU, send song data
        const APU = new ApuMock(messageHandler);
        APU.messageReceive(ACTION_SONG, SONG_BLANK);
        APU.messageReceive(ACTION_PLAYBACK_PLAY);
        // Process samples for entire song
        const sampleLength = 44000;
        const outputBuffer = [];
        for(let bufferIndex = 0; bufferIndex < sampleLength; bufferIndex++) {
            outputBuffer[bufferIndex] = 0;
        }
        APU.process([], [[ outputBuffer ]], []);
        // Listen for message at end of song
        const messageEnd = await processingPromise;
        assert.equal(messageEnd.action, RESPONSE_SONG_END);
    });
});
