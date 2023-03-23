import TelegramBot from 'node-telegram-bot-api'
import { User, Job } from './models/index.js'
import express from 'express'
import { connect } from './config/db.config.js'

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

  const Jobs = await Job.find().sort({ _id: -1 }).limit(crawled)
  const Users = await User.find()

  for (const user of Users) {
    for (const job of Jobs) {
      const jobKeywords = job.description.split(' ').concat(job.title.toLowerCase().split(' '))

      if (user.keywords.some(keyword => jobKeywords.includes(keyword))) {
        bot.sendMessage(user.chatId, job.link)
      }
    }
  }
})

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id

  const keyboard = {
    keyboard: [
      ['Provide keywords'], ['Get my keywords'], ['Change keywords']
    ]
  }

  bot.sendMessage(chatId, 'Hello, this is the job finder bot!', { reply_markup: JSON.stringify(keyboard) })
})

bot.on('message', async (msg) => {
  const chatId = msg.chat.id

  const provideKeywords = 'Provide keywords'
  if (msg.text.indexOf(provideKeywords) === 0) {
    bot.sendMessage(chatId, 'Please enter 5 keywords for freelance job search. \nFollow this pattern: keyword1, keyword2... (words separated by space and comma)')

    bot.on('message', async (msg) => {
      const keywords = msg.text.split(', ')

      if (keywords.length <= 5) {
        const user = await User.findOne({ chatId })

        if (!user) {
          await User.create({ chatId, keywords })
          bot.sendMessage(msg.chat.id, 'Your keywords have been saved')
        } else {
          bot.sendMessage(msg.chat.id, 'Something went wrong. You have already provided keywords')
        }
      } else {
        bot.sendMessage(msg.chat.id, 'More than 5 keywords. \nPlease provide less and follow this pattern: keyword1, keyword2...')
      }
    })
  }

  const getKeywords = 'Get keywords'
  if (msg.text.indexOf(getKeywords) === 0) {
    bot.sendMessage(chatId, 'Keywords are using for the search:')

    const user = await User.findOne({ chatId })
    const keywords = user.keywords.toString()

    bot.sendMessage(chatId, keywords)
  }
})

app.listen(process.env.BOT_DOCKER_PORT, () => {
  console.log(`Express server started on port ${process.env.BOT_DOCKER_PORT}`)
})
