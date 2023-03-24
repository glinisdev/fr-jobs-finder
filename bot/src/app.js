/* eslint-disable no-case-declarations */
import TelegramBot from 'node-telegram-bot-api'
import { User, Job } from './models/index.js'
import express from 'express'
import { connect } from './config/db.config.js'
import { GET_KEYWORDS, PROVIDE_KEYWORDS, UPDATE_KEYWORDS, TOKEN, inline_keyboard, Status, Menu } from './utils/constants.js'

console.log('starting application...')

connect()

const bot = new TelegramBot(TOKEN, { polling: true })

bot.setMyCommands([
  { command: 'start', description: 'start bot' },
  { command: 'menu', description: 'bot menu' }
])

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
  await User.create({ chatId, context: Status.NEW })

  bot.sendMessage(chatId, '<b>Hello, this is the job finder bot!</b>', { parse_mode: 'HTML', reply_markup: { inline_keyboard } }).then(function (resp) {
  }).catch(async function (error) {
    if (error.response && error.response.statusCode === 403) {
      await User.deleteOne({ chatId })
      console.log('user deleted')
    }
  })
})

bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id

  bot.sendMessage(chatId, '<b>Choose one of the following options</b>:', { parse_mode: 'HTML', reply_markup: { inline_keyboard } }).then(function (resp) {
  }).catch(async function (error) {
    if (error.response && error.response.statusCode === 403) {
      await User.deleteOne({ chatId })
      console.log('user deleted')
    }
  })
})

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id
  const user = await User.findOne({ chatId })
  if (!user) { throw new Error('no user for this chat id') }
  const context = user.context

  switch (query.data) {
    case PROVIDE_KEYWORDS:

      if (context !== Status.PROVIDING_KEYWORDS && context !== Status.UPDATING_KEYWORDS && context !== Status.KEYWORDS_PROVIDED) {
        await User.updateOne({ chatId }, { $set: { context: Status.PROVIDING_KEYWORDS } })

        await bot.sendMessage(chatId, 'Please enter <b>5</b> keywords for freelance job search. \nFollow this pattern: <i>keyword1, keyword2...</i> (words separated by space and comma)', { parse_mode: 'HTML' })

        bot.once('message', async (msg) => {
          const keywords = msg.text.toLowerCase().split(', ')

          if (keywords.length <= 5 && !Menu.includes(keywords[0])) {
            const user = await User.findOne({ chatId })

            if (user.keywords.length === 0) {
              await User.updateOne({ chatId }, { $set: { keywords, context: Status.KEYWORDS_PROVIDED } })

              await bot.sendMessage(chatId, 'Your keywords have been saved')
            }
          } else if (Menu.includes(keywords[0])) {
            await User.updateOne({ chatId }, { $set: { context: Status.NEW } })
          } else {
            await User.updateOne({ chatId }, { $set: { context: Status.NEW } })

            await bot.sendMessage(chatId, 'More than 5 keywords. \nPlease provide less and follow this pattern: keyword1, keyword2...')
            await bot.sendMessage(chatId, '<b>Choose one of the following options:</b>', { parse_mode: 'HTML', reply_markup: { inline_keyboard } })
          }
        })
      } else {
        if (context === Status.KEYWORDS_PROVIDED) {
          await bot.sendMessage(chatId, 'You have already provided keywords')
        } else if (context !== Status.UPDATING_KEYWORDS) {
          await User.updateOne({ chatId }, { $set: { context: Status.NEW } })
          await bot.sendMessage(chatId, 'You have not provided keywords')
        }
      }
      break

    case UPDATE_KEYWORDS:

      if (context !== Status.PROVIDING_KEYWORDS && context !== Status.UPDATING_KEYWORDS && context !== Status.NEW) {
        await User.updateOne({ chatId }, { $set: { context: Status.UPDATING_KEYWORDS } })
        await bot.sendMessage(chatId, 'Please enter <b>5</b> keywords for freelance job search. \nFollow this pattern: <i>keyword1, keyword2...</i> (words separated by space and comma)', { parse_mode: 'HTML' })

        bot.once('message', async (msg) => {
          const keywords = msg.text.toLowerCase().split(', ')

          if (keywords.length <= 5 && !Menu.includes(keywords[0])) {
            await User.updateOne({ chatId }, { $set: { keywords, context: Status.KEYWORDS_PROVIDED } })
            await bot.sendMessage(chatId, 'Your keywords have been saved')
          } else if (Menu.includes(keywords[0])) {
            await User.updateOne({ chatId }, { $set: { context: Status.KEYWORDS_PROVIDED } })
          } else {
            await User.updateOne({ chatId }, { $set: { context: Status.KEYWORDS_PROVIDED } })

            await bot.sendMessage(chatId, 'More than <b>5</b> keywords. \nPlease provide less and follow this pattern: <i>keyword1, keyword2...</i>', { parse_mode: 'HTML' })
            await bot.sendMessage(chatId, '<b>Choose one of the following options:</b>', { parse_mode: 'HTML', reply_markup: { inline_keyboard } })
          }
        })
      } else {
        if (context === Status.UPDATING_KEYWORDS) {
          await bot.sendMessage(chatId, 'You have not provided updated keywords.')
        } else {
          await bot.sendMessage(chatId, 'You have not provided keywords. Nothing to update.')
        }
      }

      break

    case GET_KEYWORDS:

      const user = await User.findOne({ chatId })

      if (!user) { throw new Error('no user for this chat id') }

      if (user.keywords.length !== 0) {
        await bot.sendMessage(chatId, 'Keywords are using for the search:')
        const keywords = user.keywords.toString()
        await bot.sendMessage(chatId, keywords)
      } else {
        await bot.sendMessage(chatId, 'You have not provided keywords')
      }

      break
  }
})

app.listen(process.env.BOT_DOCKER_PORT, () => {
  console.log(`Express server listening on port ${process.env.BOT_DOCKER_PORT}`)
})
