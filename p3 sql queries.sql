use proj3;

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

select * from cryptocurrency_metrics;
select * from cryptocurrency_price;
select * from cryptocurrency;
select * from lending_protocol;
select * from lending_protocol_metrics;

delete from cryptocurrency_price where cryptocurrency_price_id = 1;

ALTER TABLE lending_protocol_metrics AUTO_INCREMENT = 1;
ALTER TABLE cryptocurrency_metrics AUTO_INCREMENT = 1;
ALTER TABLE cryptocurrency_price AUTO_INCREMENT = 1;
