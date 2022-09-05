const puppeteer = require('puppeteer');

(async function scrape() {
    const browser =  await puppeteer.launch({ headless: false, defaultViewport: null })
    const page = (await browser.pages())[0]
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36");
    let link = 'https://solend.fi/dashboard';
    await page.goto('https://solend.fi/dashboard', {waitUntil: 'domcontentloaded'})
    // await page.waitForTimeout(5000)
    // await page.waitForSelector('.Typography_secondary__MsHYD', {visible: true, waitUntil: 'domcontentloaded'})
    
    // let pageLoad =  await page.evaluate(() => {
    //     document.querySelectorAll('.Typography_secondary__MsHYD')[15].textContent
    // })

    // while (pageLoad == undefined) {
    //     try {
    //         await pageLoad;
    //         console.log('Waiting on page to load...')
    //     } catch {
    //         console.log("Page has fully loaded!");
    //         break;
    //     }
    // }

    // await page.evaluate(() => document.querySelectorAll('.Typography_secondary__MsHYD')[15].textContent)

    // await page wait for selector needed?
    // await page.waitForSelector('div.ant-col', {visible : true, waitUntil : 'domcontentloaded'})

    // usually xhr requests occur shortly after, this works compared to waiting for a selector.
    await page.waitForNetworkIdle()
    // let stats =  await page.evaluate(() => document.querySelectorAll('div.ant-col')[25].length)

    // data populates both name and price combined, substring removes the name and grabs the price without '$', trim removes the space at the end
    // all of this is converted into an integer
    // must use the first duplicate index referring to the price, otherwise returns incorrect value
    const solend_sol_price = await page.evaluate(() => parseFloat(document.querySelectorAll('div.ant-col')[44].textContent.substring(4).trimEnd()))
    // removes the % symbol and turns into an integer / 100 to indicate percentage (natively they round the % to an int, not a float)
    // substring is not needed (actually)
    // const sol_ltv = await page.evaluate(() => parseInt(document.querySelectorAll('div.ant-col')[49].textContent))/100
    // removes the commas (separators) and turn into integer
    const solend_sol_supply= await page.evaluate(() => parseInt(document.querySelectorAll('div.ant-col')[52].textContent.replaceAll(',' , '')))
    // same as above
    const solend_sol_borrow = await page.evaluate(() => parseInt(document.querySelectorAll('div.ant-col')[55].textContent.replaceAll(',' , '')))
    // removes the % symbol and converts to float
    const solend_sol_supply_apy = await page.evaluate(() => parseFloat(document.querySelectorAll('div.ant-col')[58].textContent))

    // Date is associated as the same throughout to group instances into 1 per session of the scrape.
    const date_raw = new Date();
    const date = date_raw.toLocaleDateString();
    // // convert to 24 hr, bc am/pm makes data manipulating difficult
    const time = date_raw.toTimeString().substring(0,8)
    // // gets the day of the week
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


    const solend_sol = {
        name : 'sol',
        lending_protocol : 'solend',
        price : solend_sol_price,
        // ltv : sol_ltv,
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

    console.log(solend_sol);
    console.log(solend_usdc);
    console.log(solend_usdt);

    // navigate to next url (having multiple tabs performing tasks can put too much load on rpi)

    // must be set otherwise responsiveness will hide data on tulip and require clicks
    // already coded without on solend (oops)
    await page.setViewport({ width: 1920, height: 1080})

    await page.goto('https://tulip.garden/lend', {waitUntil: 'domcontentloaded'});
    // await page.waitForNetworkIdle();
    await page.waitForSelector('div.lend-table__row-item__cell-usd')

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

    // francium

    await page.goto('https://francium.io/app/lend', {waitUntil: 'domcontentloaded'});
    await page.waitForNetworkIdle();
    await page.waitForSelector('td.ant-table-cell>div>p');

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


    await browser.close()

})();