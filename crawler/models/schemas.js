import mongoose from 'mongoose'

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME
} = process.env

console.log(DB_USER, DB_PASSWORD)

const MONGO_URI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`
console.log(MONGO_URI)

mongoose.connect(MONGO_URI, {
  dbName: DB_NAME,
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
