const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const favouriteSchema = new mongoose.Schema({
    id: Number,
    title: String,
    year: String,
    genre: String,
    runtime: String,
    imdb: String,
    rotten: String,
    imdb_url: String,
    image_src: String
  })

favouriteSchema.plugin(AutoIncrement, {inc_field: 'id', start_seq: 1, id: 'favourite_id_counter'});

favouriteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject.id || returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

module.exports = mongoose.model('Favourite', favouriteSchema)