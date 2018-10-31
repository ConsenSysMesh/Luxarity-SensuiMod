-- Table: public.orders

-- DROP TABLE public.orders;

CREATE TABLE orders
(
    orderid INTEGER, --order id
    ordernumber INTEGER, --order number
    customeremail VARCHAR(320), --customer email
    totalcost DECIMAL(19,2), -- total cost
    redemptionhash VARCHAR(128) NOT NULL, --redemption hash
    tokenid SERIAL PRIMARY KEY, --token id
    CONSTRAINT order_pkey PRIMARY KEY (redemptionhash)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.tx
  OWNER TO root;

###########

CREATE TABLE orders(
orderid BIGINT,
ordernumber integer,
customeremail VARCHAR (500),
redemptionhash VARCHAR (500),
totalcost numeric,
tokenid SERIAL PRIMARY KEY,
customeremail256 VARCHAR (500),
tokenuri VARCHAR (500)
)

SELECT setval(pg_get_serial_sequence('orders', 'tokenid'), coalesce(min(tokenid),0) + 100, false) FROM orders;