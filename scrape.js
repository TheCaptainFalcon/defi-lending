const solend_scrape = require('./solend');
// const solend_data_bank = require('./solend');

const tulip_scrape = require('./tulip');
const francium_scrape = require('./francium');


const multi_scrape = [
    solend_scrape,
    tulip_scrape,
    francium_scrape
];

async function process_parallel (multi_scrape) {
    await Promise.all(multi_scrape);
    // console.log(solend_data_bank)
    return;
    
};

process_parallel(multi_scrape);