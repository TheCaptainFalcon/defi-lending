const puppeteer = require('puppeteer');

(async function tulip_scrape() {
    const browser =  await puppeteer.launch({ headless: true, defaultViewport: null })
    const page = (await browser.pages())[0]
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36");

    // navigate to next url (having multiple tabs performing tasks can put too much load on rpi)

    // must be set otherwise responsiveness will hide data on tulip and require clicks
    // already coded without on solend (oops)
    await page.setViewport({ width: 1920, height: 1080})

    await page.goto('https://tulip.garden/lend', {waitUntil: 'domcontentloaded'});
    // await page.waitForNetworkIdle();
    await page.waitForSelector('div.lend-table__row-item__cell-usd')

    console.log('Executing Tulip scrape...')
    // in order to account for edgecase, replacing built in substring method to an alternative.
    // using subtring 1 will eliminate the $ but can account for increasing digit counts
    // adding m in zeros to keep data consistent

    const millions = 1000000;
    const tulip_usdc_supply_apy = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell')[2].textContent.replace('%' , '')));

    // could use the same class in apy above, but there are too many extra variables that can upset the built in substring method.
    const tulip_usdc_supply = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell-usd')[0].textContent.substring(1).replace('M' , ''))) * millions;

    const tulip_usdc_borrow = await page.evaluate(() => parseFloat(document.querySelectorAll('div.lend-table__row-item__cell-usd')[1].textContent.substring(1).replace('M', ''))) * millions;
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

    const date_raw = new Date();
    const date = date_raw.toLocaleDateString();
    const time = date_raw.toTimeString().substring(0,8)
    const dow = date_raw.toDateString().substring(0,3)

    const tulip_sol = {
        name : 'sol',
        lending_protocol : 'tulip',
        total_supply : tulip_sol_supply,
        total_borrow : tulip_sol_borrow,
        supply_apy : tulip_sol_supply_apy,
        utilization : tulip_sol_utilization,
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
        utilization : tulip_usdc_utilization,
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
        utilization : tulip_usdt_utilization,
        date : date,
        time : time,
        day_of_week : dow
    }


    console.log(tulip_sol)
    console.log(tulip_usdc)
    console.log(tulip_usdt)

    // if my calculations are correct, when this triggers, the correct data will populate the instance that should have been without duplicating instances
    while (tulip_sol_supply === 0) {
        try {
            let x = 1
            console.log('Retrying Tulip data scrape ' + 'Attempt' + ` ${x}`)
            tulip_sol_supply;
            tulip_sol_borrow;
            tulip_sol_supply_apy;
            tulip_sol_utilization;
            tulip_usdc_supply;
            tulip_usdc_borrow;
            tulip_usdc_supply_apy;
            tulip_usdc_utilization;
            tulip_usdt_supply;
            tulip_usdt_borrow;
            tulip_usdt_supply_apy;
            tulip_usdt_utilization;
            x++;
        
        } catch {
            console.log('tulip data scrape success!')
            console.log(tulip_sol);
            console.log(tulip_usdc);
            console.log(tulip_usdt);
            // insert code to push to arr > db
            break;

    }
}
    console.log('Finished Tulip scrape!')
    await browser.close();

}());

module.exports = { 'tulip_scrape' : this.tulip_scrape };