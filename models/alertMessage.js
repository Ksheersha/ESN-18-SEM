let mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = Schema({
  sendId: {type: Schema.Types.ObjectId, ref: 'User'},
  groupId: {type: Schema.Types.ObjectId, ref: 'Group' },
  content: {type: String},
  recipients: [{type: Schema.Types.ObjectId, ref: 'User'}]
});
