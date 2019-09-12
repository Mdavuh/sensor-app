const express = require('express');
const router = express.Router();
const timestamp = require('time-stamp');
//import splunk logger api

var fs = require('fs');
var data = fs.readFileSync('./data/gyroscope_db.json');
var gyroscopeData = [];

var FlakeIdGen = require('flake-idgen'),
    intformat = require('biguint-format'),
    generator = new FlakeIdGen()

gyroscopeData = JSON.parse(data);

router.get('/', (req, res, next) => {
    res.status(200).json({
        data: gyroscopeData
    })
});

router.get('/:gyroscope_id', (req, res, next) => {
    var id = req.params.gyroscope_id;
    var data = {};
    var df = false;

    if (id.toString() === 'all'){
        res.status(200).json({
            gyroscopeData
        });
        
        //batchPayLoad();
        return;
    }

    for (let i = 0; i < gyroscopeData.length; i++) {
        data = gyroscopeData[i];
        if (data.gyroscope_id === parseInt(id)) {
            df = true;
            res.status(200).json({
                data: data
            });
            break;
        }
        console.log(data);
    }

    if (!df) {
        res.status(401).json({
            message: "data not found for gyroscope id: " + id
        });
    }
});

router.post('/', (req, res, next) => {

    var id = generator.next()
    var gid = intformat(id, 'dec');
    var time = timestamp.utc('YYYY-DD-MM HH:mm:ss.ms');
    var trip_id = req.body.trip_id;
    var x_value = req.body.x_value;
    var y_value = req.body.y_value;
    var z_value = req.body.z_value;

    console.log(trip_id);

    if ((!trip_id) ||
        (!x_value) ||
        (!y_value) ||
        (!z_value)) {
        res.status(401).json({
            message: 'Badly format JSON String. Required: trip_id, x_value, y_value, z_value',
        })
        return;
    }

    const data = {
        "gyroscope_id": gid,
        "trip_id": req.body.trip_id,
        "x_value": req.body.x_value,
        "y_value": req.body.y_value,
        "z_value": req.body.z_value,
        "timestamp": time.toString()
    }

    gyroscopeData.push(data);

    fs.writeFile('./data/gyroscope_db.json', JSON.stringify(gyroscopeData, null, 2), (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File");
    });

    //singlePayLoad(data);

    res.status(201).json({
        data: data
    });
});

module.exports = router;
