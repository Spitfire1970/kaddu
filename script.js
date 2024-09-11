const mongoose = require('mongoose');
const cors = require('cors');
const Log = require('./models/log')

require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));



const main = async () => {
    const datetime = new Date()
  
    const log = new Log({
      created: datetime.toLocaleString('en-UK', { month: "short", year: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: true })
    });
  
    try {
      await log.save();
      mongoose.disconnect()
    } catch (error) {
      console.error('Error saving log:', error);
    }
  }

main()