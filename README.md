### Telegram Bot: Freelance Jobs Finder
#### Tech stack
This application is two services and database:
1) Node JS crawler based on puppetter library
2) Node JS + Express telegram bot
3) MongoDB

#### How does it work?
This application consists of two services and a MongoDB database:
- The first service is a Node.js crawler based on the Puppeter library, which scrapes new Upwork jobs saves them to the MongoDB database.
- The second service is a Node.js + Express Telegram bot that sends job links to users who have subscribed to specific keywords.

The crawler service has a cron job that runs every minute to scrape new job postings and save them to the MongoDB database. 
The bot service then retrieves the number of new job postings from the database via API and sends them to the subscribed users based of provided keywords.

To make deployment easier, the entire application is packaged into a docker compose file.

You can currently access the Freelance Finder bot on Telegram at https://t.me/freelance_finder_bot.

Explore my article dedicated to this repo: https://codingwithgeorge.com/how-to-build-dockerized-telegram-bot-with-node-js-puppeteer-and-mongodb/
