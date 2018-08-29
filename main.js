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
    const pageItem = await browser.newPage()
    await pageItem.goto(item.href)
    await sleep(1000)

    const products = await pageItem.$$('tbody > tr')

    /* products.forEach(async (product) => {
        const td = await product.$$('td')
        const a = await td[0].$('a')
        const href = await (await a.getProperty('href')).jsonValue()
        console.log(href)
    }) */

    for (const index in products) {
        const td = await products[index].$$('td')

        let a = await td[1].$('a')
        const href = await (await a.getProperty('href')).jsonValue()
        const productDescription = await (await a.getProperty('innerText')).jsonValue()

        a = await td[0].$('a')
        const productKey = await (await a.getProperty('innerText')).jsonValue()
        
        console.log(href, productKey, productDescription)
    }

    // products.forEach(async (product) => {
    // const td = await product.$$('td')
    // const a = await td[0].$('a')
    // const href = await (await a.getProperty('href')).jsonValue()
    // const article = await (await td[1].getProperty('innerText')).jsonValue()
    // const linksSpan = await (await span.getProperty('innerText')).jsonValue()
    //    console.log(td)
    // });
    // })

    await browser.close()

    // console.log(linksPage)
    console.log('End')
})()
