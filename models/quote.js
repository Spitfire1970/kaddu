const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const quoteSchema = new mongoose.Schema({
  id: Number,
  text: String,
  vid: String
})

quoteSchema.plugin(AutoIncrement, {inc_field: 'id', start_seq: 1, id: 'quote_id_counter'});

quoteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject.id || returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

module.exports = mongoose.model('Quote', quoteSchema)