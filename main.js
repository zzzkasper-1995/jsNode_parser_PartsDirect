const puppeteer = require('puppeteer')
const mailer = require('nodemailer')

const sleep = ms => new Promise(r => setTimeout(r, ms))

const URL = 'https://www.partsdirect.ru/notebooks/'
const isCan = false
const userFrom = 'zzz.kasper.zzz.1995@gmail.com'
const passFrom = 'paspaspaspapsaps'
const userTo = 'zzz.kasper.zzz.1995@gmail.com';

(async () => {
    console.log('Start')
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(URL)
    await sleep(2000)

    const data = await page.$$('main > section.cats > ul > li > a')
    const linksPage = await Promise.all(data.map(async el => ({
        href: await (await el.getProperty('href')).jsonValue(),
        name: await (await el.getProperty('innerText')).jsonValue(),
    })))

    const span = await data[0].$('span')
    const linksSpan = await (await span.getProperty('innerText')).jsonValue()
    console.log(linksSpan)

    const item = linksPage[0]
    // linksPage.forEach(async (item) => {

    let isPars = true
    let n = 1
    do {
        const pageItem = await browser.newPage()
        const params = `?tv=1&p=${n}`
        await pageItem.goto(item.href + params)
        console.log(`n=${n} href='${item.href + params}'`)
        await sleep(1000)

        const products = await pageItem.$$('tbody > tr')

        for (const index in products) {
            const td = await products[index].$$('td')

            let a = await td[1].$('a')
            console.log(td[1])
            const href = await (await a.getProperty('href')).jsonValue()
            const productDescription = await (await a.getProperty('innerText')).jsonValue()

            a = await td[0].$('a')
            const productKey = await (await a.getProperty('innerText')).jsonValue()

            console.log(href, productKey, productDescription)
        }
        n += 1
        isPars = products.length !== 0
    } while (isPars)

    await browser.close()
    console.log('End')
})()
