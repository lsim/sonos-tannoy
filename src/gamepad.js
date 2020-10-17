

const HID = require('node-hid');
const xor = require('buffer-xor');
const _ = require('lodash');
const events = require('events');

const devices = HID.devices();
const deviceInfo = devices.find(d => d.product.indexOf('gamepad') >= 0);

if (!deviceInfo) {
    console.error('No gamepad device found. Please connect the gamepad!');
    process.exit(1);
}

function forwardCallOnButtonChange(fn) {
    let lastArg = [];
    return function(arrArg) {
        if (!lastArg || !arrArg) return;
        const ignoreCall = (lastArg.length === arrArg.length || lastArg.length === 0)
            && _.every(lastArg, (entry, idx) => arrArg[idx] === entry);
        if (!ignoreCall) fn(arrArg, lastArg);
        lastArg = arrArg;
    }
}


function getButtonNames(byteIndex, xorVal) {
    const res = [];
    function checkFlag(flag, name) {
        if ((xorVal & flag) === flag) res.push(name);
    }
    if (byteIndex === 5) {

        checkFlag(0x10, 'blue');
        checkFlag(0x20, 'red');
        checkFlag(0x40, 'yellow');
        checkFlag(0x80, 'green');
    } else if (byteIndex === 6) {
        checkFlag(0x01, 'left-bumper');
        checkFlag(0x04, 'right-bumper');
        checkFlag(0x10, 'select');
        checkFlag(0x20, 'start');
    } else if (byteIndex === 3) {
        checkFlag(0x7f, 'dir-left');
        checkFlag(0x80, 'dir-right');
    } else if (byteIndex === 4) {
        checkFlag(0x7f, 'dirup');
        checkFlag(0x80, 'dirdown');
    }
    return res;
}

const emitter = new events.EventEmitter();

function onButtonChange(newState, oldState) {
    const changedIndex = _.findIndex(newState, (val, idx) => val !== oldState[idx]);
    const bufXor = xor(oldState, newState);
    const oldVal = oldState[changedIndex];
    const newVal = newState[changedIndex];
    // down or up?
    const direction = oldVal - newVal;
    const directionText = direction < 0 ? 'down' : 'up';
    let buttonNames = getButtonNames(changedIndex, oldVal ^ newVal);
    if (buttonNames.length === 0)
        console.log('oops', oldState, newState, bufXor, oldVal, newVal);
    emitter.emit(directionText, buttonNames);
}

const gamepad = new HID.HID(deviceInfo.path);
gamepad.on('data', forwardCallOnButtonChange(onButtonChange));

emitter.close = () => {
    gamepad.close();
};

module.exports = {
    gamepadEvents: emitter
};

