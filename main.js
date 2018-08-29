const puppeteer = require('puppeteer')
const mailer = require('nodemailer')

const sleep = ms => new Promise(r => setTimeout(r, ms))

console.log('start')
const URL = 'https://www.partsdirect.ru/notebooks/'
const isCan = false
const userFrom = 'zzz.kasper.zzz.1995@gmail.com'
const passFrom = 'paspaspaspapsaps'
const userTo = 'zzz.kasper.zzz.1995@gmail.com';

(async () => {
    console.log('Запустил проверку')
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(URL)
    await sleep(2000)

    const data = await page.$$('main > section.cats > ul > li > a')
    const linksPage = await Promise.all(data.map(async el => ({
        href: await (await el.getProperty('href')).jsonValue(),
        name: await (await el.getProperty('innerText')).jsonValue(),
    })))

    await browser.close()

    console.log(linksPage)
    console.log('end')
})()
