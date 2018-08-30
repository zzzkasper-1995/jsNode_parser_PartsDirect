const puppeteer = require('puppeteer')
const Excel = require('exceljs')
const logger = require('./log')(module)


const sleep = ms => new Promise(r => setTimeout(r, ms))

const URLS = [
    'https://www.partsdirect.ru/notebooks/',
    'https://www.partsdirect.ru/pads_parts/',
    'https://www.partsdirect.ru/smartphones/',
    'https://www.partsdirect.ru/apple_spareparts/',
    'https://www.partsdirect.ru/pc/',

    'https://www.partsdirect.ru/for_soldering/',
    'https://www.partsdirect.ru/thermal_equipment/',
    'https://www.partsdirect.ru/chemicals_for_electronics/',
    'https://www.partsdirect.ru/radio_components/',

    'https://www.partsdirect.ru/hand_tools/',
    'https://www.partsdirect.ru/soldering_station/',
    'https://www.partsdirect.ru/metering_equipment/',
    'https://www.partsdirect.ru/programmator/',
];

(async () => {
    logger.info('Start')
    for (const URL of URLS) {
        // try {
        const workbook = new Excel.Workbook()

        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(URL)
        await sleep(2000)

        let nameFile = await page.$('main > h1')
        const r = await nameFile.getProperty('innerHTML')
        nameFile = r._remoteObject.value
        nameFile.replace(/[^a-zA-Z ]/g, '')

        const data = await page.$$('main > section.cats > ul > li > a')
        const linksPage = await Promise.all(data.map(async el => ({
            href: await (await el.getProperty('href')).jsonValue(),
            name: await (await el.getProperty('innerText')).jsonValue(),
        })))

        logger.info(nameFile)

        for (const item of linksPage) {
            const sheet = workbook.addWorksheet(item.name)
            logger.info(item.name)

            let isPars = true
            let n = 1
            do {
                try {
                    const params = `?p=${n}`
                    logger.info(`\n${item.href} ${params}`)

                    const pageItem = await browser.newPage()
                    await pageItem.goto(item.href + params)
                    await sleep(1000)

                    const products = await pageItem.$$('tbody > tr')

                    for (const index in products) {
                        const td = await products[index].$$('td')

                        let a = await td[1].$('a')
                        const href = await (await a.getProperty('href')).jsonValue()
                        const productDescription = await (await a.getProperty('innerText')).jsonValue()

                        a = await td[0].$('a')
                        const productKey = await (await a.getProperty('innerText')).jsonValue()

                        sheet.addRow([href, productKey, productDescription])
                        console.log(href, productKey, productDescription)
                    }
                    n += 1
                    isPars = products.length !== 0
                    await pageItem.close()
                } catch (err) {
                    logger.error(error)
                }
            } while (isPars)
        }

        await browser.close()

        workbook.xlsx.writeFile('Excel.xlsx')
            .then(() => {
                // done
            })
        // } catch (err) {
        //    logger.error(err)
        // }
    }
    logger.info('End')
})()
