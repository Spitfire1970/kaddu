const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const logSchema = new mongoose.Schema({
    id: Number,
    created: String
  })

  logSchema.plugin(AutoIncrement, {inc_field: 'id', start_seq: 1, id: 'log_id_counter'});

  logSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject.id || returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

module.exports = mongoose.model('Log', logSchema)