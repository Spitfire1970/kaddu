require('dotenv').config();
const mongoose = require('mongoose');

const Image = require('../models/image')
const Todo = require('../models/todo')
const Favourite = require('../models/favourite')
const Quote = require('../models/quote')
const Blog = require('../models/blog')
const data = require('./data_to_populate')

const m = (obj) => {return {
  images: new Image(obj),
  favourites: new Favourite(obj),
  todos: new Todo(obj),
  quotes: new Quote(obj),
  blogs: new Blog(obj)
}
}

mongoose.set('strictQuery', false)

mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB Atlas:', err));

async function initializeDatabase() {
  try {
    // await Image.deleteMany({}); <- do this for a model to delete all data in it

    // await Image.insertMany(initialData.images); <- this is the quicker wait of doing it but auto increment plugin does not work with this method

    for (data_type in data) {
      if (data[data_type].length > 0) {
        for (const obj of data[data_type]) {
          await m(obj)[data_type].save();
        }
      }
    }

    console.log('Database populated successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    mongoose.disconnect();
  }
}

initializeDatabase();