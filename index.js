const puppeteer = require('puppeteer');
const fs = require("fs");
const jsonexport = require('jsonexport');

function run () {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch( {headless: true});
            const page = await browser.newPage();
            page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36');
            await page.goto('https://www.google.com/');
            //click on search bar + enter query
            await page.type('#lst-ib', 'datatables');
            await page.keyboard.press('Enter');
            await page.waitFor(5000);
            //click on desired query result
            await page.click('#rso > div:nth-child(1) > div > div > div > div > h3 > a');
            await page.waitFor(5000);
            //click on dropdown and click on 100 entries
            await page.select('select[name="example_length"]', '100');
            
            const result = await page.evaluate(() => {
                let data = [];
                let rows = document.getElementById('example').querySelectorAll('tbody tr')                

                for (const row of rows){
                    let name = row.childNodes[0].innerText;
                    let position = row.childNodes[1].innerText;
                    let office = row.childNodes[2].innerText;     
                    let age = row.childNodes[3].innerText;                                                    
                    let startDate = row.childNodes[4].innerText;
                    let salary = row.childNodes[5].innerText;                                                                                    
                                                                   
                    data.push({name, position, office, age, startDate, salary}); 
                }
                
                return data;
    
            });
            //convert to csv format and create csv file
            jsonexport(result, function(err, csv){
                if(err) return console.log(err);
                fs.writeFile('table.csv', csv, function(err){
                    if (err) {
                        return console.log(err);
                    }
                    console.log('File was written successfully');
                })
            })
            
            browser.close();
            return resolve(result);                                 

        } catch (e) {
            return reject(e);
        }
    })
}
run().then(console.log).catch(console.error);