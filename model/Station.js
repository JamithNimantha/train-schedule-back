const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let Station = new Schema({
    _id: Number,
    name: {
        type: String,
        require: true,
        unique: true
    }
});

module.exports = Station = mongoose.model('Station', Station);

