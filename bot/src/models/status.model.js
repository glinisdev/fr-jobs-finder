import mongoose from 'mongoose'

const statusSchema = new mongoose.Schema({
  portal: String,
  numberOfCrawledJobs: Number
})

export const Status = mongoose.model('Status', statusSchema)
