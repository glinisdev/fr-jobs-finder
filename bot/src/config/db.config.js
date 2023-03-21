import mongoose from 'mongoose'

// const {
//   DB_USER,
//   DB_PASSWORD,
//   DB_HOST,
//   DB_PORT,
//   DB_NAME
// } = process.env

mongoose.Promise = global.Promise

// const mongoURL = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`
const mongoURL = 'mongodb://admin:admin@localhost:27017'

export const connect = () => {
  mongoose.connect(
    mongoURL, {
      // dbName: DB_NAME,
      dbName: 'fr-jobs-finder',
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection is failed:', error))
}
