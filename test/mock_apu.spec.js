

//== Test Mock Apu =============================================================

//-- Dependencies --------------------------------
import assert from 'assert';
import ApuMock from '../mocks/mock_apu.js';
import { RESPONSE_READY } from '../src/constants.js';

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
});
