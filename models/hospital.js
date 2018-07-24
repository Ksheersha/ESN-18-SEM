let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let HospitalSchema = Schema({
    hospitalName: {type: String, required: true},
    address: {type: String, required: true},
    description: {type: String, required: false},
    nurse: [{type: Schema.Types.ObjectId, ref: 'User'}],
    location: {
        type: {type: String, default: 'Point'},
        coordinates: {type: [Number], default: [0, 0], index: '2dsphere'}
    },
    beds: {type: Number},
    patients: {type: [Schema.Types.ObjectId], default: []}
}, {
    usePushEach: true
});

module.exports = HospitalSchema;
