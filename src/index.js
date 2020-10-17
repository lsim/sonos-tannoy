const { DeviceDiscovery, Sonos } = require('sonos');

const { gamepadEvents } = require('./gamepad');
// event on all found...
// DeviceDiscovery((device) => {
//     console.log('found device at ' + device.host, JSON.stringify(device, null, 2));
//
//     // mute every device...
//     // device.setMuted(true)
//     //     .then(d => console.log(`${d.host} now muted`))
// });

const sonosGroupIdentifier = 'Kælder';

console.log(`Looking for target sonos ${sonosGroupIdentifier}...`);
// find one device
DeviceDiscovery().once('DeviceAvailable', (device) => {
    // console.log('found device at ' + device.host, JSON.stringify(device, null, 2));

    // get all groups
    const sonos = new Sonos(device.host);
    sonos.getAllGroups().then(groups => {
        let cellarGroup = null;
        groups.forEach(group => {
            if (group.Name && group.Name.indexOf(sonosGroupIdentifier) >= 0)
                cellarGroup = group;
        });
        return cellarGroup;
    }).then(g => {
        console.log(`Found target sonos group: ${sonosGroupIdentifier}!`);
        let targetSonos = new Sonos(g.host);
        function onButtonPress(pressedButtons) {
            console.log('pressed button(s)', pressedButtons);
            if (pressedButtons.indexOf('green') !== -1) {
                targetSonos.play().then(playResult => {
                    console.log('playing', playResult);
                }, err => {
                    console.log('play start failed', err);
                });
            }
            if (pressedButtons.indexOf('red') !== -1) {
                targetSonos.pause().then(playResult => {
                    console.log('paused', playResult);
                }, err => {
                    console.log('pause failed', err);
                });
            }
            if (pressedButtons.indexOf('left-bumper') !== -1) {
                console.log('Good bive!');
                gamepadEvents.close();
                process.exit(0);
            }
            // 'http://live-icy.dr.dk/A/A03H.mp3.m3u'
        }
        gamepadEvents.on('down', onButtonPress);
    });
});
