-- Table: public.orders

-- DROP TABLE public.orders;

CREATE TABLE orders
(
    orderid INTEGER, --order id
    ordernumber INTEGER, --order number
    customeremail VARCHAR(320), --customer email
    totalcost DECIMAL(19,2), -- total cost
    redemptionhash VARCHAR(128) NOT NULL, --redemption hash
    tokenid INTEGER, --token id
    CONSTRAINT order_pkey PRIMARY KEY (redemptionhash)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.tx
  OWNER TO root;
