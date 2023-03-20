import mongoose from 'mongoose'

console.log('starting...')

const MONGO_URI = 'mongodb://admin:admin@mongodb:27017'

mongoose.connect(MONGO_URI, {
  dbName: 'fr-jobs-finder',
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

mongoose.connection.useDb('fr-jobs-finder')

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('MongoDB connected')
})