import mongoose from 'mongoose'

const MONGO_URI = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`

mongoose.connect(MONGO_URI, {
  dbName: process.env.DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
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

const statusSchema = new mongoose.Schema({
  portal: String,
  numberOfCrawledJobs: Number
})

export const Job = mongoose.model('Job', jobSchema)
export const Status = mongoose.model('Status', statusSchema)

const portals = [
  {
    portal: 'upwork',
    numberOfCrawledJobs: 0
  },
  {
    portal: 'fiverr',
    numberOfCrawledJobs: 0
  }
]

for (const portal of portals) {
  await Status.updateOne(
    { portal: portal.portal },
    { $setOnInsert: portal },
    { upsert: true }
  )
}
