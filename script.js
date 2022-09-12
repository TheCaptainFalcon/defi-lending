const solend_scrape = require('./solend');
const tulip_scrape = require('./tulip');
const francium_scrape = require('./francium');

const multi_scrape = [
    solend_scrape,
    tulip_scrape,
    francium_scrape
];

async function process_parallel (multi_scrape) {
    await Promise.all(multi_scrape);
    return;
};

process_parallel(multi_scrape);