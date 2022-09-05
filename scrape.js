const puppeteer = require('puppeteer');

(async function scrape() {
    const browser =  await puppeteer.launch({ headless: true })
    const page = (await browser.pages())[0]
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36");
    // let link = 'https://solend.fi/dashboard';
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

    // await page.goto('https://tulip.garden/lend', {waitUntil: 'domcontentloaded'});
    // await page.waitForNetworkIdle();
    // const 

    // try {
    //     await page.waitForSelector('.Typography_primary__ljjY8', {visible : true, waitUntil : 'domcontentloaded'})
    //     await page.evaluate(() => document.querySelectorAll('.Typography_primary__ljjY8')[19].textContent)
    //     // console does work hmm...
    //     console.log(await page.evaluate(() => document.querySelectorAll('.Typography_primary__ljjY8')[19].textContent))
    // } catch {
    //     console.log("error", error)
    // }
   
    
        // let ltv = document.querySelectorAll('.Typography_primary__ljjY8')[19].textContent
        // let total_supply = document.querySelectorAll('.Typography_primary__ljjY8')[20].textContent
        // let total_borrow = document.querySelectorAll('.Typography_primary__ljjY8')[21].textContent
        // let supply_apy = document.querySelectorAll('.Typography_primary__ljjY8')[22].textContent
        // console.log(price)
    

// subsection solend for usdc



    await browser.close()

})();