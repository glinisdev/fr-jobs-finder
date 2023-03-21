import mongoose from 'mongoose'

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
},
{ timestamps: true }
)

export const Job = mongoose.model('Job', jobSchema)
