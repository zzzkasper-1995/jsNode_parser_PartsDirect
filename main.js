const puppeteer = require('puppeteer')
const Excel = require('exceljs')
const logger = require('./log')(module)

const sleep = ms => new Promise(r => setTimeout(r, ms))

// разделы меню сайта которые необходимо распарсить
const URLS = [
    /*'https://www.partsdirect.ru/notebooks/',
    'https://www.partsdirect.ru/pads_parts/',
    'https://www.partsdirect.ru/smartphones/',
    'https://www.partsdirect.ru/apple_spareparts/',
    'https://www.partsdirect.ru/pc/',*/

    /*'https://www.partsdirect.ru/for_soldering/',
    'https://www.partsdirect.ru/thermal_equipment/',
    'https://www.partsdirect.ru/chemicals_for_electronics/',
    'https://www.partsdirect.ru/radio_components/',*/

    'https://www.partsdirect.ru/hand_tools/',
    'https://www.partsdirect.ru/soldering_station/',
    'https://www.partsdirect.ru/metering_equipment/',
    'https://www.partsdirect.ru/programmator/',
];

(async () => {
    logger.info('Start')
    URLS.forEach(async (URL) => {
        try {
            // создаем новый виртуальный файл Excel
            const workbook = new Excel.Workbook()

            // запускаем браузер через пупитер
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            await page.goto(URL)
            await sleep(500)

            // считываем название раздела меню
            let nameFile = await page.$('main > h1')
            const r = await nameFile.getProperty('innerHTML')
            nameFile = r._remoteObject.value
            nameFile.replace(/[^a-zA-Z ]/g, '')

            // получаем подразделы раздела используя селекторы
            const data = await page.$$('main > section.cats > ul > li > a')
            const linksPage = await Promise.all(data.map(async el => ({
                href: await (await el.getProperty('href')).jsonValue(),
                name: await (await (await el.$('span')).getProperty('innerText')).jsonValue(),
            })))

            console.log(linksPage)
            logger.info(nameFile)

            // цикл пробегает по подразделам
            for (const item of linksPage) {
                // создаем новую страницу Excel для подраздела
                const sheet = workbook.addWorksheet(item.name)
                logger.info(item.name)

                // бежим по страницам подраздела
                let isPars = true
                let n = 1
                do {
                    try {
                        const params = `?p=${n}`
                        logger.info(`\n${item.href} ${params}`)

                        const pageItem = await browser.newPage()
                        await pageItem.goto(item.href + params)
                        await sleep(500)

                        const products = await pageItem.$$('tbody > tr')

                        // цикл по товарам которые есть на этой странице
                        for (const index in products) {
                            const td = await products[index].$$('td')

                            let a = await td[1].$('a')
                            const href = await (await a.getProperty('href')).jsonValue()
                            const productDescription = await (await a.getProperty('innerText')).jsonValue()

                            let price = await td[1].$('div > span.stro')
                            price = await (await price.getProperty('innerText')).jsonValue()

                            a = await td[0].$('a')
                            const productKey = await (await a.getProperty('innerText')).jsonValue()

                            // записываем полученную информацию в новую строку Excel страницы
                            sheet.addRow([href, productKey, productDescription, price])
                            //console.log(href, productKey, productDescription, price)
                        }
                        n += 1
                        isPars = products.length !== 0

                        // закрываем страницу
                        await pageItem.close()
                    } catch (err) {
                        logger.error(err.message)
                    }
                } while (isPars)
            }

            await browser.close()

            // записываем виртуальный Excel файл в реальный файл формата xlsx
            workbook.xlsx.writeFile(`excel/${nameFile}.xlsx`)
                .then(() => {
                // done
                })
        } catch (err) {
            logger.error(err.message)
        }
    });
    logger.info('End')
})()

//  в итоге у нас есть несколько xlsx файлов
// в каждом из которых представлены товары по своему разделу


