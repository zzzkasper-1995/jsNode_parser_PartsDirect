const Excel = require('exceljs')

const workbook = new Excel.Workbook()
const sheet = workbook.addWorksheet('My Sheet')

sheet.addRow([3, 'Sam', new Date()])

const sheet2 = workbook.addWorksheet('My Sheet2')
sheet2.addRow([3, 'Sam', new Date()])

workbook.xlsx.writeFile('excel/Excel.xlsx')
    .then(() => {
        // done
    })
