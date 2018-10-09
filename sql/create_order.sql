-- Table: public.order

-- DROP TABLE public.order;

CREATE TABLE public.order
(
    buyerid INTEGER, --buyer id
    itemcost DECIMAL(19,2), -- item cost
    redemptionhash VARCHAR(128) NOT NULL, --redemption hash
    tokenid INTEGER, --token id
    orderid INTEGER, --order id
    sku INTEGER, --sku number
    CONSTRAINT order_pkey PRIMARY KEY (redemptionhash)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.tx
  OWNER TO root;
