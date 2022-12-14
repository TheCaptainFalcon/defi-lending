require('dotenv').config({ path:'./secret.env' });
const puppeteer = require('puppeteer');
const mysql = require('mysql2');
const nodeCron = require('node-cron');

const connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    multipleStatements : true
});

function delay(ms) {
    return new Promise(res => {
        setTimeout(res, ms)
    });
};

async function solend_scrape() {
    const browser =  await puppeteer.launch({ headless: true, defaultViewport: null })
    const page = (await browser.pages())[0]
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36");
    await page.goto('https://solend.fi/dashboard', {waitUntil: 'domcontentloaded'})

    // usually xhr requests occur shortly after, this works compared to waiting for a selector.
    await page.waitForNetworkIdle()

    // recalling the var to grab a new set of data does not work that way, even with a timeout.
    // therefore if/else or iterative methods revolving around 0 values may not work as intended.
    await delay(30000);
    const millions = 1000000;
    console.log('Starting Solend scrape at ' + new Date().toLocaleString() + '\n')

    // data populates both name and price combined, substring removes the name and grabs the price without '$', trim removes the space at the end
    // all of this is converted into an integer
    // must use the first duplicate index referring to the price, otherwise returns incorrect value
    const solend_sol_price = await page.evaluate(() => parseFloat(document.querySelectorAll('div.ant-col')[44].textContent.substring(4).trimEnd()))

    // removes the % symbol and turns into an integer / 100 to indicate percentage (natively they round the % to an int, not a float)
    // removes the commas (separators) and turn into integer
    const solend_sol_supply= await page.evaluate(() => parseInt(document.querySelectorAll('div.ant-col')[52].textContent.replaceAll(',' , '')))
    const solend_sol_borrow = await page.evaluate(() => parseInt(document.querySelectorAll('div.ant-col')[55].textContent.replaceAll(',' , '')))

    // removes the % symbol and converts to float
    const solend_sol_supply_apy = await page.evaluate(() => parseFloat(document.querySelectorAll('div.ant-col')[58].textContent))

    // Date is associated as the same throughout to group instances into 1 per session of the scrape.
    // separating into multiple files creates new instances (may need to export same var instance)
    const date_raw = new Date();

    // need to be in this format for DATE sql format
    const date = date_raw.toJSON().substring(0,10);

    // convert to 24 hr, bc am/pm makes data manipulating difficult
    const time = date_raw.toTimeString().substring(0,8)

    // gets the day of the week
    const dow = date_raw.toDateString().substring(0,3)

    // solend USDC

    // stablecoin, but utilizing float type to account for unpeg events
    const solend_usdc_price = await page.evaluate(() => parseFloat(document.querySelectorAll('div.ant-col')[63].textContent.substring(5).trimEnd()))
    const solend_usdc_supply = await page.evaluate(() => parseInt(document.querySelectorAll('div.ant-col')[70].textContent.replaceAll(',' , '')))
    const solend_usdc_borrow = await page.evaluate(() => parseInt(document.querySelectorAll('div.ant-col')[73].textContent.replaceAll(',' , '')))
    const solend_usdc_supply_apy = await page.evaluate(() => parseFloat(document.querySelectorAll('div.ant-col')[76].textContent))

    // solend USDT
    const solend_usdt_price = await page.evaluate(() => parseFloat(document.querySelectorAll('div.ant-col')[81].textContent.substring(5).trimEnd()))
    const solend_usdt_supply = await page.evaluate(() => parseInt(document.querySelectorAll('div.ant-col')[88].textContent.replaceAll(',' , '')))
    const solend_usdt_borrow = await page.evaluate(() => parseInt(document.querySelectorAll('div.ant-col')[91].textContent.replaceAll(',' , '')))
    const solend_usdt_supply_apy = await page.evaluate(() => parseFloat(document.querySelectorAll('div.ant-col')[94].textContent))

    // solend metrics
    const solend_tvl = await page.evaluate(() => parseInt(document.querySelectorAll('div.ant-col')[24].textContent.substring(4).replace('M', ''))) * millions;
    

    const solend_sol = {
        name : 'sol',
        lending_protocol : 'solend',
        price : solend_sol_price,
        total_supply : solend_sol_supply,
        total_borrow : solend_sol_borrow,
        supply_apy : solend_sol_supply_apy,
        date : date,
        time : time,
        day_of_week : dow
    }

    const solend_usdc = {
        name : 'usdc',
        lending_protocol : 'solend',
        price : solend_usdc_price,
        total_supply : solend_usdc_supply,
        total_borrow : solend_usdc_borrow,
        supply_apy : solend_usdc_supply_apy,
        date : date,
        time : time,
        day_of_week : dow
    }

    const solend_usdt = {
        name : 'usdt',
        lending_protocol : 'solend',
        price : solend_usdt_price,
        total_supply : solend_usdt_supply,
        total_borrow : solend_usdt_borrow,
        supply_apy : solend_usdt_supply_apy,
        date : date,
        time : time,
        day_of_week : dow
    }

    const solend_lp = {
        tvl : solend_tvl,
        date : date,
        time : time,
        day_of_week : dow
    }

    let solend_data_bank = [];
    solend_data_bank.push(solend_sol, solend_usdc, solend_usdt, solend_lp)
    // console.log(solend_data_bank)

    console.log('Finished Solend scraping!' + '\n')

    const sol = solend_data_bank[0];
    const usdc = solend_data_bank[1];
    const usdt = solend_data_bank[2];
    const solend = solend_data_bank[3];

    const insert_crypto_metrics = 'INSERT INTO cryptocurrency_metrics (cryptocurrency_id, total_supply, total_borrow, supply_apy, date, time, day_of_week) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const insert_crypto_price = 'INSERT INTO cryptocurrency_price (cryptocurrency_id, price, date, time, day_of_week) VALUES (?, ?, ?, ?, ?)';
    const insert_lending_protocol_metrics = 'INSERT INTO lending_protocol_metrics (lending_protocol_id, tvl, date, time, day_of_week) VALUES (?, ?, ?, ?, ?)';

    const sol_values = [
        1,
        sol.total_supply,
        sol.total_borrow,
        sol.supply_apy,
        sol.date,
        sol.time,
        sol.day_of_week
    ]

    const usdc_values = [
        2,
        usdc.total_supply,
        usdc.total_borrow,
        usdc.supply_apy,
        usdc.date,
        usdc.time,
        usdc.day_of_week
    ]

    const usdt_values = [
        3,
        usdt.total_supply,
        usdt.total_borrow,
        usdt.supply_apy,
        usdt.date,
        usdt.time,
        usdt.day_of_week
    ]

    const solend_sol_prices = [
        1,
        sol.price,
        sol.date,
        sol.time,
        sol.day_of_week
    ]

    const solend_usdc_prices = [
        2,
        usdc.price,
        usdc.date,
        usdc.time,
        usdc.day_of_week
    ]

    const solend_usdt_prices = [
        3,
        usdt.price,
        usdt.date,
        usdt.time,
        usdt.day_of_week
    ]

    const tulip_sol_prices = [
        4,
        sol.price,
        sol.date,
        sol.time,
        sol.day_of_week
    ]

    const tulip_usdc_prices = [
        5,
        usdc.price,
        usdc.date,
        usdc.time,
        usdc.day_of_week
    ]

    const tulip_usdt_prices = [
        6,
        usdt.price,
        usdt.date,
        usdt.time,
        usdt.day_of_week
    ]

    const francium_sol_prices = [
        7,
        sol.price,
        sol.date,
        sol.time,
        sol.day_of_week
    ]

    const francium_usdc_prices = [
        8,
        usdc.price,
        usdc.date,
        usdc.time,
        usdc.day_of_week
    ]

    const francium_usdt_prices = [
        9,
        usdt.price,
        usdt.date,
        usdt.time,
        usdt.day_of_week
    ]
        
    const solend_lp_values = [
        1,
        solend.tvl,
        solend.date,
        solend.time,
        solend.day_of_week
    ]

    connection.connect(err => {
        if (err) throw err;

        // bulk inserts are not easily compatible. This is the easiest alternative.
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
        })
        
        connection.query({
            sql : insert_crypto_price,
            values : solend_sol_prices
        })

        connection.query({
            sql : insert_crypto_price,
            values : solend_usdc_prices
        })
        connection.query({
            sql : insert_crypto_price,
            values : solend_usdt_prices
        })

        connection.query({
            sql : insert_crypto_price,
            values : tulip_sol_prices
        })
        connection.query({
            sql : insert_crypto_price,
            values : tulip_usdc_prices
        })

        connection.query({
            sql : insert_crypto_price,
            values : tulip_usdt_prices
        })
        connection.query({
            sql : insert_crypto_price,
            values : francium_sol_prices
        })

        connection.query({
            sql : insert_crypto_price,
            values : francium_usdc_prices
        })

        connection.query({
            sql : insert_crypto_price,
            values : francium_usdt_prices
        })

        connection.query({
            sql : insert_lending_protocol_metrics,
            values : solend_lp_values
        })
    
    }, (err) => {
        if (err) throw err;
        return
    });

    await browser.close()

};

solend_scrape();

// default settings (3) automatically starts without callback
// oddly enough adding a console log while also trying to callback within the function causes the whole function to not work.
// async function to start automatically cannot be used for utilizing scheduler.
nodeCron.schedule("*/15 * * * *", solend_scrape);

module.exports = { 
    'solend_scrape' : this.solend_scrape, 
    'solend_data_bank' : this.solend_data_bank
};
