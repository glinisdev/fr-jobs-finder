import TelegramBot from 'node-telegram-bot-api'
import { User, Job } from './models/index.js'
import express from 'express'
import * as dotenv from 'dotenv'
import { checkPattern } from './utils.js'
import { connect } from './config/db.config.js'

dotenv.config()
const token = process.env.TOKEN

console.log('starting application...')

connect()

const bot = new TelegramBot(token, { polling: true })

const app = express()
app.use(express.json())

app.post('/api', async (request, response) => {
  const { crawled } = request.body

  response.send('updated')
  console.log(crawled)

  const lastJobs = await Job.find().sort({ _id: -1 }).limit(crawled)

  console.log(lastJobs)

  // const searchedKeywords = `(${keywords.join('|')})`

  // const query = {
  //   $or: [
  //     { title: { $regex: searchedKeywords, $options: 'i' } },
  //     { description: { $regex: searchedKeywords, $options: 'i' } }
  //   ]
  // }

  // const mathedJobs = await Job.find(query)

  // console.log(mathedJobs[0])

  // bot.sendMessage(chatId, mathedJobs[0].link)
  // // Search for jobs based on the user's keywords
  // // and send them to the user
  // // ...

  // console.log(crawled)
})

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id

  bot.sendMessage(chatId, 'Hello, this is the job finder bot!')
  bot.sendMessage(chatId, 'Please enter your keywords for freelance job search:')
})

bot.on('message', async (msg) => {
  const keywordsPattern = /^(([a-zA-Z]+|\d+)(,([a-zA-Z]+|\d+))*)|[a-zA-Z]|\d$/
  console.log(checkPattern(msg.text, keywordsPattern))
  if (checkPattern(msg.text, keywordsPattern)) {
    const chatId = msg.chat.id
    const keywords = msg.text.split(',')

    const user = await User.findOne({ chatId })

    if (!user) {
      await User.create({ chatId, keywords })
      bot.sendMessage(msg.chat.id, 'Your keywords have been saved')
    } else {
      bot.sendMessage(msg.chat.id, 'Something went wrong. You have already provided keywords')
    }
  } else {
    bot.sendMessage(msg.chat.id, 'You have provided incorrect keywords. \n Please follow pattern: keyword1, keyword2...')
  }
})

app.listen(4000, () => {
  console.log('Express server started on port 3000')
})
