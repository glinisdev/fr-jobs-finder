/* eslint-disable no-case-declarations */
import TelegramBot from 'node-telegram-bot-api'
import { User, Job } from './models/index.js'
import express from 'express'
import { connect } from './config/db.config.js'
import { GET_KEYWORDS, PROVIDE_KEYWORDS, UPDATE_KEYWORDS, TOKEN, inlineKeyboard } from './utils/constants.js'

console.log('starting application...')

connect()

const bot = new TelegramBot(TOKEN, { polling: true })

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
        await bot.sendMessage(user.chatId, job.link).then(function (resp) {
        }).catch(async function (error) {
          if (error.response && error.response.statusCode === 403) {
            const chatId = user.chatId
            await User.deleteOne({ chatId })
          }
        })
      }
    }
  }
})

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id

  await User.deleteMany({ chatId })
  await User.create({ chatId, context: 'new' })

  bot.sendMessage(chatId, 'Hello, this is the job finder bot!', { reply_markup: { inlineKeyboard } }).then(function (resp) {
  }).catch(async function (error) {
    if (error.response && error.response.statusCode === 403) {
      await User.deleteOne({ chatId })
    }
  })
})

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id

  const user = await User.findOne({ chatId })
  const context = user.context

  switch (query.data) {
    case PROVIDE_KEYWORDS:

      if (context !== 'providing_keywords' && context !== 'updating_keywords' && context !== 'keywords_provided') {
        const providingContext = 'providing_keywords'
        await User.updateOne({ chatId }, { $set: { context: providingContext } })

        await bot.sendMessage(chatId, 'Please enter 5 keywords for freelance job search. \nFollow this pattern: keyword1, keyword2... (words separated by space and comma)')

        await bot.once('message', async (msg) => {
          const keywords = msg.text.toLowerCase().split(', ')

          if (keywords.length <= 5) {
            const user = await User.findOne({ chatId })

            if (user.keywords.length === 0) {
              await User.updateOne({ chatId }, { $set: { keywords, context: 'keywords_provided' } })

              await bot.sendMessage(chatId, 'Your keywords have been saved')
            }
          } else {
            await User.updateOne({ chatId }, { $set: { context: 'keywords_not_provided' } })

            await bot.sendMessage(chatId, 'More than 5 keywords. \nPlease provide less and follow this pattern: keyword1, keyword2...')
            await bot.sendMessage(chatId, 'Menu', { reply_markup: { inlineKeyboard } })
          }
        }
        )
      } else {
        await bot.sendMessage(chatId, 'You have already provided keywords')
      }
      break

    case GET_KEYWORDS:
      const user = await User.findOne({ chatId })
      if (user.keywords.length !== 0) {
        await bot.sendMessage(chatId, 'Keywords are using for the search:')
        const keywords = user.keywords.toString()
        await bot.sendMessage(chatId, keywords)
      } else {
        await bot.sendMessage(chatId, 'You have not provided keywords')
      }

      break

    case UPDATE_KEYWORDS:

      // ADD LOGIC WHILE IAM IN THE PROCESS

      if (context !== 'providing_keywords' && context !== 'updating_keywords' && context !== 'new') {
        const providingContext = 'updating_keywords'

        await User.updateOne({ chatId }, { $set: { context: providingContext } })
        await bot.sendMessage(chatId, 'Please enter 5 keywords for freelance job search. \nFollow this pattern: keyword1, keyword2... (words separated by space and comma)')

        await bot.once('message', async (msg) => {
          const keywords = msg.text.toLowerCase().split(', ')

          if (keywords.length <= 5) {
            const user = await User.findOne({ chatId })

            if (user.keywords.length === 0) {
              await User.updateOne({ chatId }, { $set: { keywords, context: 'keywords_provided' } })

              await bot.sendMessage(chatId, 'Your keywords have been saved')
            }
          } else {
            await User.updateOne({ chatId }, { $set: { context: 'keywords_not_provided' } })

            await bot.sendMessage(chatId, 'More than 5 keywords. \nPlease provide less and follow this pattern: keyword1, keyword2...')
            await bot.sendMessage(chatId, 'Menu', { reply_markup: { inlineKeyboard } })
          }
        }
        )
      } else {
        await bot.sendMessage(chatId, 'You have not provided keywords. Nothing to update.')
      }

      break
  }
})

app.listen(process.env.BOT_DOCKER_PORT, () => {
  console.log(`Express server listening on port ${process.env.BOT_DOCKER_PORT}`)
})
