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
    let numberOfFloors = _.range(3, 41);
    let numberOfApartments = _.range(11);
    let temp = [];
    _.each(numberOfFloors, floor => {
        floor =
            floor.toString().length == 1
                ? 0 + floor.toString()
                : floor;
        _.each(numberOfApartments, apartment => {
            temp.push(floor + "Stan " + apartment + "0")
        });
    })
    var offset = 0;
    _.each(temp, el => {
        setTimeout(function () {
            connection.write(new Buffer(el, 'utf-8'), () => {
                console.log('el', el);
            });
        }, 1100 + offset);
        offset += 1100;
    })
}

device.listPairedDevices(devices => {
    let bluDevice = _.find(devices, dev => dev.name == bluetoothName);
    device.findSerialPortChannel(bluDevice.address, function (channel) {
        console.log('Found RFCOMM channel for serial port on %s: ', channel);
        bluetooth.connect(bluDevice.address, channel, function (err, connection) {
            if (err) return console.error(err);
            docRef.onSnapshot((data) => {
                let apartment = data.data().apartment;
                if (apartment == false || apartment == 'false') {
                    turnOfTheLights(connection);
                } else {
                    connection.write(new Buffer(apartment, 'utf-8'), () => {
                        console.log('apartment', apartment)
                    });
                }

            });
        });
    });
});





app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))