const puppeteer = require('puppeteer');

(async function francium_scrape() {
    const browser =  await puppeteer.launch({ headless: true, defaultViewport: null })
    const page = (await browser.pages())[0]
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36");
    await page.goto('https://francium.io/app/lend', {waitUntil: 'domcontentloaded'});
    await page.waitForNetworkIdle();
    await page.waitForSelector('td.ant-table-cell>div>p');

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

    const date_raw = new Date();
    const date = date_raw.toLocaleDateString();
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

    console.log(francium_sol);
    console.log(francium_usdc);
    console.log(francium_usdt);

    while (francium_sol_supply === 0) {
        try {
            let x = 1
            console.log('Retrying Francium data scrape ' + 'Attempt' + ` ${x}`)
            francium_sol_supply;
            francium_sol_borrow;
            francium_sol_supply_apy;
            francium_sol_utilization;
            francium_usdc_supply;
            francium_usdc_borrow;
            francium_usdc_supply_apy;
            francium_usdc_utilization;
            francium_usdt_supply;
            francium_usdt_borrow;
            francium_usdt_supply_apy;
            francium_usdt_utilization;
            x++;
        
        } catch {
            console.log('Francium data scrape success!')
            console.log(francium_sol);
            console.log(francium_usdc);
            console.log(francium_usdt);
            // insert code to push to arr > db
            break;
        }
    }

    console.log('Finished Francium scraping!')
    await browser.close()

}());

module.exports = { 'francium_scrape' : this.francium_scrape };