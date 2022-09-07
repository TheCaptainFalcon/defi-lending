const solend_scrape = require('./solend');

const tulip_scrape = require('./tulip');

const francium_scrape = require('./francium');

const load_data = require('./sql');

const multi_scrape = [
    solend_scrape,
    tulip_scrape,
    francium_scrape
];

// const data_banks = [
//     solend_data_bank,
//     tulip_data_bank,
//     francium_data_bank
// ]


async function process_parallel (multi_scrape) {
    await Promise.all(multi_scrape);
    await Promise(load_data);
    return;
};

process_parallel(multi_scrape);


// console.log(solend_data_bank);


// const data_banks = [
//     solend_data_bank,
//     tulip_data_bank,
//     francium_data_bank
// ]

// async function accum_data (data_banks) {
//     await console.log(data_banks)
//     return;
// }

// accum_data(data_banks);