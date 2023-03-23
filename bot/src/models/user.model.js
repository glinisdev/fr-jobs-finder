import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  chatId: Number,
  keywords: [String],
  context: String
},
{ timestamps: true }
)

export const User = mongoose.model('User', userSchema)
