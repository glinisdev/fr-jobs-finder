import TelegramBot from 'node-telegram-bot-api'
import { User, Job, Status } from './models/index.js'
import * as dotenv from 'dotenv'

dotenv.config()
const token = process.env.TOKEN

const bot = new TelegramBot(token, { polling: true })

console.log('starting application...')

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id

  bot.sendMessage(chatId, 'Hello, this is the job finder bot!')
  bot.sendMessage(chatId, 'Please enter your keywords for freelance job search:')
})

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const keywords = msg.text.split(',')

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

// const TelegramBot = require('node-telegram-bot-api');
// const express = require('express');

// // Set up your bot token and chat ID
// const botToken = 'YOUR_BOT_TOKEN';
// const chatId = 'YOUR_CHAT_ID';

// // Set up your bot
// const bot = new TelegramBot(botToken, { polling: true });

// // Create an Express app
// const app = express();

// // Create a route that listens for a POST request
// app.post('/api', (req, res) => {
//   // Extract the number from the request body
//   const number = req.body.number;

//   // Send a message to your Telegram chat
//   bot.sendMessage(chatId, `Received number: ${number}`);

//   // Send a response back to the API caller
//   res.send('Number received');
// });

// // Listen for /start command
// bot.onText(/\/start/, (msg) => {
//   bot.sendMessage(msg.chat.id, "Welcome to my bot!");
// });

// // Listen for /help command
// bot.onText(/\/help/, (msg) => {
//   bot.sendMessage(msg.chat.id, "Type /api <number> to send a number to the bot.");
// });

// // Listen for /api command with a number argument
// bot.onText(/\/api (.+)/, (msg, match) => {
//   // Extract the number from the command argument
//   const number = match[1];

//   // Send a message to the chat
//   bot.sendMessage(chatId, `Received number: ${number}`);
// });

// // Start the Express app
// app.listen(3000, () => {
//   console.log('Express server started on port 3000');
// });

// const axios = require('axios');

// const apiUrl = 'http://other_service:3000/api';

// // Make a POST request to the other service
// axios.post(apiUrl, { number: 42 })
//   .then(response => {
//     console.log(response.data);
//   })
//   .catch(error => {
//     console.error(error);
//   });
