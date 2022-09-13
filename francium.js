require('dotenv').config({ path:'./secret.env' });
const puppeteer = require('puppeteer');
const mysql = require('mysql2');

function delay(ms) {
    return new Promise(res => {
        setTimeout(res, ms)
    });
};

const connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});

(async function francium_scrape() {
    const browser =  await puppeteer.launch({ headless: true, defaultViewport: null })
    const page = (await browser.pages())[0]
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36");
    await page.goto('https://francium.io/app/lend', {waitUntil: 'domcontentloaded'});
    await page.waitForNetworkIdle();
    await page.waitForSelector('td.ant-table-cell>div>p');

    await delay(5000);

    console.log('Executing Francium scrape...')
    const millions = 1000000;
    const francium_usdc_supply_apy = await page.evaluate(() => parseFloat(document.querySelectorAll('p.hint')[0].textContent.replace('%' , '')));
    const francium_usdc_supply = await page.evaluate(() => parseFloat(document.querySelectorAll('td.ant-table-cell>div>p')[2].textContent.substring(1).replace('M' , ''))) * millions;
    const francium_usdc_borrow = await page.evaluate(() => parseFloat(document.querySelectorAll('td.ant-table-cell>div>p')[4].textContent.substring(1).replace('M' , ''))) * millions;
    const francium_usdc_utilization = await page.evaluate(() => parseFloat(document.querySelectorAll('td.ant-table-cell')[4].textContent.replace('%', '')));

    const francium_usdt_supply_apy = await page.evaluate(() => parseFloat(document.querySelectorAll('p.hint')[1].textContent.replace('%' , '')));
    const francium_usdt_supply = await page.evaluate(() => parseFloat(document.querySelectorAll('td.ant-table-cell>div>p')[7].textContent.substring(1).replace('M' , ''))) * millions;
    const francium_usdt_borrow = await page.evaluate(() => parseFloat(document.querySelectorAll('td.ant-table-cell>div>p')[9].textContent.substring(1).replace('M' , ''))) * millions;
    const francium_usdt_utilization = await page.evaluate(() => parseFloat(document.querySelectorAll('td.ant-table-cell')[11].textContent.replace('%', '')));

    const francium_sol_supply_apy = await page.evaluate(() => parseFloat(document.querySelectorAll('p.hint')[2].textContent.replace('%' , ''))); 
    const francium_sol_supply = await page.evaluate(() => parseFloat(document.querySelectorAll('td.ant-table-cell>div>p')[12].textContent.substring(1).replace('M' , ''))) * millions;
    const francium_sol_borrow = await page.evaluate(() => parseFloat(document.querySelectorAll('td.ant-table-cell>div>p')[14].textContent.substring(1).replace('M' , ''))) * millions;
    const francium_sol_utilization = await page.evaluate(() => parseFloat(document.querySelectorAll('td.ant-table-cell')[18].textContent.replace('%', '')));

    // new page bc tvl is on a different part of site
    await page.goto('https://francium.io/app/invest/farm', {waitUntil: 'domcontentloaded'});
    // await page.waitForNetworkIdle();
    // await page.waitForSelector('b.hint');
    await delay(5000);

    // francium metrics
    const francium_tvl = await page.evaluate(() => parseInt(document.querySelectorAll('b.hint')[3].textContent.substring(1).replaceAll(',' , '')))

    const date_raw = new Date();
    // const date = date_raw.toLocaleDateString();
    const date = date_raw.toJSON().substring(0,10);
    const time = date_raw.toTimeString().substring(0,8)
    const dow = date_raw.toDateString().substring(0,3)

    const francium_sol = {
        name : 'sol',
        lending_protocol : 'francium',
        total_supply : francium_sol_supply,
        total_borrow : francium_sol_borrow,
        supply_apy : francium_sol_supply_apy,
        utilization : francium_sol_utilization,
        date : date,
        time : time,
        day_of_week : dow
    }

    const francium_usdc = {
        name : 'usdc',
        lending_protocol : 'francium',
        total_supply : francium_usdc_supply,
        total_borrow : francium_usdc_borrow,
        supply_apy : francium_usdc_supply_apy,
        utilization : francium_usdc_utilization,
        date : date,
        time : time,
        day_of_week : dow
    }

    const francium_usdt = {
        name : 'usdt',
        lending_protocol : 'francium',
        total_supply : francium_usdt_supply,
        total_borrow : francium_usdt_borrow,
        supply_apy : francium_usdt_supply_apy,
        utilization : francium_usdt_utilization,
        date : date,
        time : time,
        day_of_week : dow
    }

    const francium_lp = {
        // fill this above and dl
        tvl : francium_tvl,
        date : date,
        time : time,
        day_of_week : dow
    }

    let francium_data_bank = [];
    francium_data_bank.push(francium_sol, francium_usdc, francium_usdt, francium_lp);
    console.log(francium_data_bank);

    console.log('Finished Francium scraping!');

    const sol = francium_data_bank[0];
    const usdc = francium_data_bank[1];
    const usdt = francium_data_bank[2];
    const francium = francium_data_bank[3];

    const insert_crypto_metrics = 'INSERT INTO cryptocurrency_metrics (cryptocurrency_id, total_supply, total_borrow, supply_apy, date, time, day_of_week) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const insert_lending_protocol_metrics = 'INSERT INTO lending_protocol_metrics (lending_protocol_id, tvl, date, time, day_of_week) VALUES (?, ?, ?, ?, ?)';

    // per setup, solend wil be id 1, tulip will be id 2, and francium will be id 3.

    connection.connect(err => {
        if (err) throw err;
        console.log('Database ' + `${process.env.database}` + ' connected.' + '\n')
        connection.query({
            sql : insert_crypto_metrics,
            values : [
                7,
                sol.total_supply,
                sol.total_borrow,
                sol.supply_apy,
                sol.date,
                sol.time,
                sol.day_of_week
            ],
            sql : insert_crypto_metrics,
            values : [
                8,
                usdc.total_supply,
                usdc.total_borrow,
                usdc.supply_apy,
                usdc.date,
                usdc.time,
                usdc.day_of_week
            ],
            sql : insert_crypto_metrics,
            values: [
                9,
                usdt.total_supply,
                usdt.total_borrow,
                usdt.supply_apy,
                usdt.date,
                usdt.time,
                usdt.day_of_week
            ],
            sql : insert_lending_protocol_metrics,
            values: [
                3,
                francium.tvl,
                francium.date,
                francium.time,
                francium.day_of_week
            ]
        }, (err) => {
                if (err) throw err;
                console.log('Francium data inserted!')
                // console.log('Affected Rows: ' + connection.query.length)
        });
    });
    await browser.close()

}());

module.exports = { 
    'francium_scrape' : this.francium_scrape,
    'francium_data_bank' : this.francium_data_bank 
};