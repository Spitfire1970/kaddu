const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const blogSchema = new mongoose.Schema({
    id: Number,
    content: String,
    rating: Number,
    tags: [{ label: String, color: String }],
    datetime: String
  })

blogSchema.plugin(AutoIncrement, {inc_field: 'id', start_seq: 1, id: 'blog_id_counter'});

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject.id || returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

module.exports = mongoose.model('Blog', blogSchema)