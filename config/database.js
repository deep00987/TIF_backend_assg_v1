require('dotenv').config();
const mongoose = require('mongoose');

const mongoDB = async () => {
  return (
    await mongoose.connect(process.env.MONGO_URI, 
        { 
          useNewUrlParser: true, 
          useUnifiedTopology: true 
        }
      )
  )
}

module.exports = { mongoDB };
