require('dotenv').config({ path:'./secret.env' });


// temporary boiler plate for starter code

let mysql = require('mysql');

let con = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});

con.connect(err => {
    if (err) throw err;
    console.log(`Database ${database} connected.`)
    let sql = "INSERT INTO customers (name, address) VALUES ('company inc', 'highway 37')";
    con.query(sql, (err, res) => {
        if (err) throw err;
        console.log('1 record inserted')
    });
});
