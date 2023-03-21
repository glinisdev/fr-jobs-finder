import mongoose from 'mongoose'

const MONGO_URI = 'mongodb://admin:admin@localhost:27017'

mongoose.connect(MONGO_URI, {
  dbName: 'fr-jobs-finder',
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const userSchema = new mongoose.Schema({
  chatId: Number,
  keywords: String
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

const statusSchema = new mongoose.Schema({
  portal: String,
  numberOfCrawledJobs: Number
})

export const User = mongoose.model('User', userSchema)
export const Job = mongoose.model('Job', jobSchema)
export const Status = mongoose.model('Status', statusSchema)
