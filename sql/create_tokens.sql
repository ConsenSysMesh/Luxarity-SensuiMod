-- Table: tokens

-- DROP TABLE public.tokens;

CREATE TABLE tokens
(
    tokenid INTEGER, --token id
    txhash INTEGER, --tx hash
    CONSTRAINT token_pkey PRIMARY KEY (txhash)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.tx
  OWNER TO root;
