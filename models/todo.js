const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const todoSchema = new mongoose.Schema({
  id: Number,
  task: String,
  status: String,
  created: String
})

todoSchema.plugin(AutoIncrement, {inc_field: 'id', start_seq: 1, id: 'todo_id_counter'});

todoSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject.id || returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

module.exports = mongoose.model('Todo', todoSchema)