const express = require('express')
const _ = require('lodash')
const app = express()
const port = 4200
const admin = require('firebase-admin');
const bluetooth = require('node-bluetooth');
const device = new bluetooth.DeviceINQ();
let bluetoothName = 'JBL GO';
var serviceAccount = require('./cert/service.json');

admin.initializeApp({
    databaseURL: "https://westapp-tower.firebaseio.com",
    credential: admin.credential.cert(serviceAccount)
});
var db = admin.firestore();
var docRef = db.collection('lights').doc('status');

device.listPairedDevices(devices => {
    let bluDevice = _.find(devices, dev => dev.name == bluetoothName);
    console.log('devicesss', bluDevice.address);
    device.findSerialPortChannel(bluDevice.address, function (channel) {
        console.log('Found RFCOMM channel for serial port on %s: ', channel);

        bluetooth.connect(bluDevice.address, channel, function (err, connection) {
            if (err) return console.error(err);
            docRef.onSnapshot((data) => {
                let apartment = data.data().apartment;
                connection.write(new Buffer('Hello!', 'utf-8'), () => {
                    console.log("wrote");
                });
                connection.on('data', (buffer) => {
                    console.log('received message:', buffer.toString());
                });

            });

        });

    });
});





app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))