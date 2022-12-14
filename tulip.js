require('dotenv').config({ path:'./secret.env' });
const puppeteer = require('puppeteer');
const mysql = require('mysql2');
const nodeCron = require('node-cron');

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

async function tulip_scrape() {
    const browser =  await puppeteer.launch({ headless: true, defaultViewport: null })
    const page = (await browser.pages())[0]
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36");

    // navigate to next url (having multiple tabs performing tasks can put too much load on rpi)

    // must be set otherwise responsiveness will hide data on tulip and require clicks
    // already coded without on solend (oops)
    await page.setViewport({ width: 1920, height: 1080})

    await page.goto('https://tulip.garden/lend', {waitUntil: 'domcontentloaded'});
    await page.waitForNetworkIdle();
    await page.waitForSelector('div.lend-table__row-item__cell-usd')

    // for whatever reason, the tvl takes so long to load
    await delay(30000);

    console.log('Starting Tulip scrape at ' + new Date().toLocaleString() + '\n')
    // in order to account for edgecase, replacing built in substring method to an alternative.
    // using subtring 1 will eliminate the $ but can account for increasing digit counts
    // adding m in zeros to keep data consistent

    const millions = 1000000;
    const tulip_usdc_supply_apy = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell')[2].textContent.replace('%' , '')));

    // could use the same class in apy above, but there are too many extra variables that can upset the built in substring method.
    const tulip_usdc_supply_raw = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell-usd')[0].textContent.substring(1).replace('M' , ''))) * millions;
    const tulip_usdc_supply = parseInt(tulip_usdc_supply_raw);
    const tulip_usdc_borrow_raw = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell-usd')[1].textContent.substring(1).replace('M', ''))) * millions;
    const tulip_usdc_borrow = parseInt(tulip_usdc_borrow_raw);
    const tulip_usdc_utilization = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell')[5].textContent.replace('%', '').trimEnd()));

    // tulip usdt

    const tulip_usdt_supply_apy = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell')[8].textContent.replace('%' , '')));
    const tulip_usdt_supply = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell-usd')[2].textContent.substring(1).replace('M' , ''))) * millions;
    const tulip_usdt_borrow = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell-usd')[3].textContent.substring(1).replace('M', ''))) * millions;
    const tulip_usdt_utilization = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell')[11].textContent.replace('%', '').trimEnd()));


    // tulip sol

    const tulip_sol_supply_apy = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell')[20].textContent.replace('%' , '')));
    const tulip_sol_supply = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell-usd')[6].textContent.substring(1).replace('M' , ''))) * millions;
    const tulip_sol_borrow = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell-usd')[7].textContent.substring(1).replace('M', ''))) * millions;
    const tulip_sol_utilization = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell')[53].textContent.replace('%', '').trimEnd()));

    // tulip metrics
    // millions doesnt get recognized outside function, therefore added the numerical valuation
    // number is originally in a float with 2 decimals, multiply the number then convert back to int, as to not dismiss the other numbers.
    const tulip_tvl_raw = await page.evaluate(() => parseFloat(document.querySelectorAll('div.labelled-value__value')[1].textContent.replace('M' , ''))) * millions;
    const tulip_tvl = parseInt(tulip_tvl_raw);

    const date_raw = new Date();
    const date = date_raw.toJSON().substring(0,10);
    const time = date_raw.toTimeString().substring(0,8)
    const dow = date_raw.toDateString().substring(0,3)

    const tulip_sol = {
        name : 'sol',
        lending_protocol : 'tulip',
        total_supply : tulip_sol_supply,
        total_borrow : tulip_sol_borrow,
        supply_apy : tulip_sol_supply_apy,
        // utilization : tulip_sol_utilization,
        date : date,
        time : time,
        day_of_week : dow
    }

    const tulip_usdc = {
        name : 'usdc',
        lending_protocol : 'tulip',
        total_supply : tulip_usdc_supply,
        total_borrow : tulip_usdc_borrow,
        supply_apy : tulip_usdc_supply_apy,
        // utilization : tulip_usdc_utilization,
        date : date,
        time : time,
        day_of_week : dow
    }

    const tulip_usdt = {
        name : 'usdt',
        lending_protocol : 'tulip',
        total_supply : tulip_usdt_supply,
        total_borrow : tulip_usdt_borrow,
        supply_apy : tulip_usdt_supply_apy,
        // utilization : tulip_usdt_utilization,
        date : date,
        time : time,
        day_of_week : dow
    }

    const tulip_lp = {
        tvl : tulip_tvl,
        date : date,
        time : time,
        day_of_week : dow
    }

    let tulip_data_bank = [];
    tulip_data_bank.push(tulip_sol, tulip_usdc, tulip_usdt, tulip_lp)
    // console.log(tulip_data_bank)

    console.log('Finished Tulip scrape!' + '\n')

    const sol = tulip_data_bank[0];
    const usdc = tulip_data_bank[1];
    const usdt = tulip_data_bank[2];
    const tulip = tulip_data_bank[3];

    const insert_crypto_metrics = 'INSERT INTO cryptocurrency_metrics (cryptocurrency_id, total_supply, total_borrow, supply_apy, date, time, day_of_week) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const insert_lending_protocol_metrics = 'INSERT INTO lending_protocol_metrics (lending_protocol_id, tvl, date, time, day_of_week) VALUES (?, ?, ?, ?, ?)';

    const sol_values = [
        4,
        sol.total_supply,
        sol.total_borrow,
        sol.supply_apy,
        sol.date,
        sol.time,
        sol.day_of_week
    ]

    const usdc_values = [
        5,
        usdc.total_supply,
        usdc.total_borrow,
        usdc.supply_apy,
        usdc.date,
        usdc.time,
        usdc.day_of_week
    ]

    const usdt_values = [
        6,
        usdt.total_supply,
        usdt.total_borrow,
        usdt.supply_apy,
        usdt.date,
        usdt.time,
        usdt.day_of_week
    ]

    const tulip_lp_values = [
        2,
        tulip.tvl,
        tulip.date,
        tulip.time,
        tulip.day_of_week
    ]

    connection.connect(err => {
        if (err) throw err;
        connection.query({
            sql : insert_crypto_metrics,
            values : sol_values
        });

        connection.query({
            sql : insert_crypto_metrics,
            values : usdc_values
        });

        connection.query({
            sql : insert_crypto_metrics,
            values : usdt_values
        });

        connection.query({
            sql : insert_lending_protocol_metrics,
            values : tulip_lp_values
        })
        
        
    }, (err) => {
        if (err) throw err;
        return
    });

    await browser.close();
 
};

tulip_scrape();
nodeCron.schedule("*/15 * * * *", tulip_scrape);

module.exports = { 
    'tulip_scrape' : this.tulip_scrape,
    'tulip_data_bank' : this.tulip_data_bank 
};