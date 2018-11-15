import { Client } from "pg";



class DatabaseMgr {
  constructor() {
    this.pgUrl = null;
    console.log("databaseMgr constructed")
  }

  isSecretsSet() {
    return this.pgUrl !== null ;
  }

setSecrets(secrets) {
    this.pgUrl = secrets.PG_URL;
  }

async insertOrder(orderid,ordernumber,customeremail,totalcost,redemptionhash,tokenid,customeremail256) {
    if (!this.pgUrl) throw "no pgUrl set";

    console.log("\nMade all input checks, in DatabaseMgr. insertOrder");

    const client = new Client({
      connectionString: this.pgUrl
    });

    try {
      await client.connect();
      const res = await client.query(
        "INSERT INTO orders(orderid,ordernumber,customeremail,totalcost,redemptionhash,tokenid,customeremail256) \
             VALUES ($1,$2,$3,$4,$5,$6,$7) returning *",
        [orderid,ordernumber,customeremail,totalcost,redemptionhash,tokenid,customeremail256]
      );
      console.log(res.rows[0].orderid);
      return res.rows[0].orderid;
    } catch (e) {
      throw e;
    } finally {
      await client.end();
    }
  }

  async insertDonation(causeid,causename,orderid,donationamount) {
    if (!this.pgUrl) throw "no pgUrl set";

    console.log("\nMade all input checks, in DatabaseMgr. insertOrder");

    const client = new Client({
      connectionString: this.pgUrl
    });

    try {
      await client.connect();
      const res = await client.query(
        "INSERT INTO causes(causeid,causename,orderid,donationamount) \
             VALUES ($1,$2,$3,$4) returning *",
        [causeid,causename,orderid,donationamount]
      );
      console.log(res.rows[0].orderid);
      return res.rows[0].orderid;
    } catch (e) {
      throw e;
    } finally {
      await client.end();
    }
  }

}

module.exports = DatabaseMgr;