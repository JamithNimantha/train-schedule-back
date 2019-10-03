const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RouteSchema = new Schema({
    startStation: {
        type:Schema.Types.Number,
        require: true,
        ref: 'stations'
    },
    endStation: {
        type:Schema.Types.Number,
        require: true,
        ref: 'stations'
    },
    // startStation: {
    //     type: String,
    //     require: true,
    // },
    // endStation: {
    //     type: String,
    //     require: true,
    // },
    distance: {
        type: String
    },
    firstClassPrice: {
        type: Number
    },
    secondClassPrice: {
        type: Number
    },
    thirdClassPrice: {
        type: Number
    }
});

module.exports = Route = mongoose.model('Route', RouteSchema);