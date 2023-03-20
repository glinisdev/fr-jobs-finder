import mongoose from 'mongoose'

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

const jobSchema = new mongoose.Schema({
  title: String,
  link: String,
  description: String,
  skills: [String],
  jobType: String,
  contractorTier: String,
  budget: Number,
  duration: String,
  postedTime: String
})

export const Job = mongoose.model('Job', jobSchema)
