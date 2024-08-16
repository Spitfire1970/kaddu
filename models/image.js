const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const imageSchema = new mongoose.Schema({
    id: Number,
    path: String,
    info: String
  })

imageSchema.plugin(AutoIncrement, {inc_field: 'id', start_seq: 1, id: 'image_id_counter'});

imageSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject.id || returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

module.exports = mongoose.model('Image', imageSchema)