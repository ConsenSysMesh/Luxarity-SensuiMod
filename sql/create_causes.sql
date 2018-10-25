-- Table: public.causes

-- DROP TABLE public.causes;

CREATE TABLE causes
(
    causeid INTEGER, --cause id
    causename VARCHAR(320), --cause name
    orderid INTEGER, --order id
    donationamount DECIMAL(19,2), -- donation amount
    CONSTRAINT cause_pkey PRIMARY KEY (causeid)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.tx
  OWNER TO root;
