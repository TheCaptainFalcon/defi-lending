require('dotenv').config({ path:'./secret.env' });


// temporary boiler plate for starter code

//msql2 is faster and more secure than 1
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});


// test code
const solend_sol = {
    name : 'sol',
    lending_protocol : 'solend',
}


connection.connect(err => {
    if (err) throw err;
    console.log('Database ' + `${process.env.database}` + ' connected.')
    connection.query({
        sql : 'INSERT INTO test1 (name, lending_protocol) VALUES (?, ?)',
        values : [solend_sol.name, solend_sol.lending_protocol]
    }, (err, res) => {
            if (err) throw err;
            console.log('Solend data inserted!') 
    });
});
