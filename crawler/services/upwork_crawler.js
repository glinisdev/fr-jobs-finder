import { load } from 'cheerio'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import { Job } from '../models/job.schema.js'
 
export async function upworkCrawler() {

  puppeteer.use(StealthPlugin())
  puppeteer.use(AdblockerPlugin({ blockTrackers: true })) 

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  if (browser) {console.log('Connected to browser')}
  // const pages = [
  //   'https://www.upwork.com/search/jobs/?sort=recency',
  //   'https://www.upwork.com/nx/jobs/search/?sort=recency&page=2',
  //   'https://www.upwork.com/nx/jobs/search/?sort=recency&page=3']

  await page.goto('https://www.upwork.com/search/jobs/?sort=recency')

  const elementSelector = '[id^="job-"]'
  const elements = await page.$$eval(elementSelector, (uiElements) => {
  return uiElements.map((uiElement) => uiElement.innerHTML)
  })

  const crawledJobs = []

  for (const element of elements) {
    const htmlString = element

    const $ = load(htmlString)

    const title = $('h3 a').text()

    const existingJob = await Job.findOne({ title })

    if (!existingJob || title.includes('Do not apply')) {

      const link = $('h3 a').attr('href')
      const description = $('.up-line-clamp-v2.clamped').text().toLowerCase()
      const skills = $('.up-skill-wrapper .up-skill-badge').map((i, el) => $(el).text()).get()
      const jobType = $('[data-test="job-type"]').text()
      const contractorTier = $('[data-test="contractor-tier"]').text()
      const budget = $('[data-test="budget"]').text().replace(/[^0-9]/g, '')
      const duration = $('[data-test="duration"]').text()
      const postedTime = $('[data-test="UpCRelativeTime"]').text()
      
      const jobObject = {
        title,
        link,
        description,
        skills,
        jobType,
        contractorTier,
        budget,
        duration,
        postedTime
      }

      crawledJobs.push(jobObject)
      
      } else {console.log('Skipped')}
    }

  await Job.insertMany(crawledJobs)

  console.log(`successfully crawled at ${new Date}`)

  await browser.close()
}