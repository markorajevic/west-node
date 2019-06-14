const express = require('express')
const _ = require('lodash')
const app = express()
const port = 4200
const admin = require('firebase-admin');
const bluetooth = require('node-bluetooth');
const device = new bluetooth.DeviceINQ();
let bluetoothName = 'HC-06';
var serviceAccount = require('./cert/service.json');

admin.initializeApp({
    databaseURL: "https://westapp-tower.firebaseio.com",
    credential: admin.credential.cert(serviceAccount)
});
var db = admin.firestore();
var docRef = db.collection('lights').doc('status');
let turnOfTheLights = (connection) => {

}
function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
}

device.listPairedDevices(devices => {
    let bluDevice = _.find(devices, dev => dev.name == bluetoothName);
    device.findSerialPortChannel(bluDevice.address, function (channel) {
        console.log('Found RFCOMM channel for serial port on %s: ', channel);
        bluetooth.connect(bluDevice.address, channel, function (err, connection) {
            if (err) return console.error(err);
            docRef.onSnapshot((data) => {
                let apartment = data.data().apartment;
                let offApartments = data.data().previous;
                let offChunk = chunkString(offApartments, 160);
                let chunk = chunkString(apartment, 160);
                    // var offApSet = 0;
                    // _.each(offChunk, el => {
                    //     setTimeout(function () {
                    //         connection.write(new Buffer(el, 'utf-8'), () => {
                    //             console.log('offOnes', el);
                    //         });
                    //     }, 1500 + offApSet);
                    //     offApSet += 1500;
                    // })
                    var offset = 0;
                    _.each(chunk, el => {
                        // setTimeout(function () {
                            connection.write(new Buffer(el, 'utf-8'), () => {
                                console.log('newOnes', el);
                            });
                        // }, 1500 + offset);
                        // offset += 1500;
                    })


            });
        });
    });
});





app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))