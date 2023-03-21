import TelegramBot from 'node-telegram-bot-api'
import { Job, User } from './models/schemas.js'
import * as dotenv from 'dotenv'

dotenv.config()

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true })

console.log('starting application...')

// Listen for the /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id

  // Send a welcome message
  bot.sendMessage(chatId, 'Hello, this is the job finder bot!')

  // Ask the user for keywords
  bot.sendMessage(chatId, 'Please enter your keywords:')
})

// Listen for messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const keywords = msg.text.split(',')

  // Save the user data to MongoDB
  const user = new User({ chatId, keywords })
  await user.save()

  const pattern = `(${keywords.join('|')})`

  const query = {
    $or: [
      { title: { $regex: pattern, $options: 'i' } },
      { description: { $regex: pattern, $options: 'i' } }
    ]
  }

  const mathedJobs = await Job.find(query)

  console.log(mathedJobs[0])

  bot.sendMessage(chatId, mathedJobs[0].link)
  // Search for jobs based on the user's keywords
  // and send them to the user
  // ...
})
