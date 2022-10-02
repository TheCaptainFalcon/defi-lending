use proj3;

set global local_infile=1;

show global variables like 'local_infile';

select * from lending_protocol;

INSERT INTO lending_protocol VALUES (1, 'solend');
INSERT INTO lending_protocol VALUES (2, 'tulip');
INSERT INTO lending_protocol VALUES (3, 'francium');

delete from lending_protocol where lending_protocol_id IN (1,2,3);

select * from cryptocurrency;

INSERT INTO cryptocurrency (cryptocurrency_id, lending_protocol_id, name) VALUES (1, 1, 'sol');
INSERT INTO cryptocurrency (cryptocurrency_id, lending_protocol_id, name) VALUES (2, 1, 'usdc');
INSERT INTO cryptocurrency (cryptocurrency_id, lending_protocol_id, name) VALUES (3, 1, 'usdt');

delete from cryptocurrency where cryptocurrency_id IN (6);

INSERT INTO cryptocurrency (cryptocurrency_id, lending_protocol_id, name) VALUES (4, 2, 'sol');
INSERT INTO cryptocurrency (cryptocurrency_id, lending_protocol_id, name) VALUES (5, 2, 'usdc');
INSERT INTO cryptocurrency (cryptocurrency_id, lending_protocol_id, name) VALUES (6, 2, 'usdt');

INSERT INTO cryptocurrency (cryptocurrency_id, lending_protocol_id, name) VALUES (7, 3, 'sol');
INSERT INTO cryptocurrency (cryptocurrency_id, lending_protocol_id, name) VALUES (8, 3, 'usdc');
INSERT INTO cryptocurrency (cryptocurrency_id, lending_protocol_id, name) VALUES (9, 3, 'usdt');

select * from cryptocurrency_metrics LIMIT 500000;
select * from cryptocurrency_price LIMIT 500000;
select * from cryptocurrency;
select * from lending_protocol;
select * from lending_protocol_metrics LIMIT 500000 ;

delete from cryptocurrency_price where cryptocurrency_price_id = 1;

ALTER TABLE lending_protocol_metrics AUTO_INCREMENT = 1;
ALTER TABLE cryptocurrency_metrics AUTO_INCREMENT = 1;
ALTER TABLE cryptocurrency_price AUTO_INCREMENT = 3399;

-- realizing i need a date and time field for price

ALTER TABLE cryptocurrency_price 
ADD date DATE;

ALTER TABLE cryptocurrency_price
ADD time TIME;

ALTER TABLE cryptocurrency_price
ADD day_of_week VARCHAR(5);

-- import data error - turn off strict mode

SET GLOBAL sql_mode='';

-- LOAD DATA LOCAL INFILE 'C:/Users/jaznr/Desktop/P3/csv extract/conversion/add_to_price.csv' INTO TABLE cryptocurrency_price
-- FIELDS TERMINATED BY ',' -- CSV file format
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\r\n'
-- IGNORE 1 LINES -- to accomodate column headers;


