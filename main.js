const http = require("http");
const puppeteer = require('puppeteer');
const mailer = require("nodemailer");
const jsdom = require("jsdom");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log('start')
var URL = 'https://www.partsdirect.ru/notebooks/';
let isCan = false;
let timeout = 6; // время в минутах
let userFrom = 'zzz.kasper.zzz.1995@gmail.com';
let passFrom = 'paspaspaspapsaps';
let userTo = 'zzz.kasper.zzz.1995@gmail.com';

(async () => {
    while(true) {
        console.log('Запустил проверку');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(URL);
        await sleep(2000);
        
        let data=await page.$$('main > section.cats > ul > li');
        console.log(data);
        let linksPage = await Promise.all(data.map(async el => await (await el.getProperty('innerText')).jsonValue()));
        isCan = linksPage.filter(el=>el.includes('L7'))[0].includes('Заказать');
        await browser.close();
        console.log(isCan ? new Date() + 'Появилось нужное предложение' : new Date() + 'Предложение все еще не появилось');

        if(isCan) {
            var smtpTransport = mailer.createTransport({
                service: "Gmail",
                auth: {
                    user: userFrom,
                    pass: passFrom
                }
            });
    
            var mail = {
                    from: userFrom,
                    to: userTo,
                    subject: "Можно заказать супер сервер на 12TB с i7",
                    text: "Сервер (L7 Intel i7 4/8 32ГБ 4x3000ГБ) появился в продаже ->" + URL,
                };
                
            smtpTransport.sendMail(mail, function(error, info){
                if(error) {
                    console.log(error);
                } else {
                    console.log('info.envelope', info.envelope);
                    console.log('info.messageId', info.messageId);
                }
                smtpTransport.close();
            });

            break;
        }
        
        await sleep(timeout*60*1000);
    }
    console.log('end');
})();