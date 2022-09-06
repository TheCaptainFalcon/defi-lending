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

connection.connect(err => {
    if (err) throw err;
    console.log('Database ' + `${process.env.database}` + ' connected.')
    let sql = "INSERT INTO test1 (name) VALUES ('test2')";
    connection.query(sql, (err, res) => {
        if (err) throw err;
        // fix this later as its hard coded
        console.log('1 record inserted') 
    });
});
