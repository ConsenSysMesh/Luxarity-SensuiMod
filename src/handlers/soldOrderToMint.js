/*
method: soldOrderToMint
  - orderId,
  - totalPrice
  - orderNumber
  - customerEmail

needed parameters for api endpoint:
  - string tokenURI
  - uint256 saleAmount
  - bytes32 buyerID
  - bytes32 redemptionHash

needed parameters for smart contract:
  - string tokenURI
  - uint256 saleAmount
  - bytes32 buyerID
  - bytes32 redemptionHash

activates soldOrderToMintHandler, which takes the following inputs (which are instatited
at the top of the file):
  - authMgr*
  - ethereumMgr
*/

//class
class SoldOrderToMintHandler {
  constructor(ethereumMgr, databaseMgr) {
    this.ethereumMgr = ethereumMgr,
    this.databaseMgr = databaseMgr;
  }

  async handle(event, context, cb) {

    /*
    let authToken;
    try {
      authToken = await this.authMgr.verifyNisaba(event);
    } catch (err) {
      console.log("Error on this.authMgr.verifyNisaba");
      console.log(err);
      cb({ code: 401, message: err.message });
      return;
    }
    */

    /*
    let body = event.Records[0].body; 
    try { 
      body = JSON.parse(body); 
    } catch(e) { 
      cb({ code: 500, message: "no json body" }); 
      return; 
    } 
    */



    let body = event.Records[0].body;
  try {
        body = JSON.parse(body);
      } catch (e) {
        cb({ code: 500, message: "no json body" });
        return;
      }


    //check body
    console.log(body);
    console.log(body.toString());

    /* checking for inputs */
    if (!body.tokenURI) {
      cb({ code: 500, message: "tokenURI parameter missing" });
      return;
    }
    if (!body.totalPrice) {
      cb({ code: 500, message: "saleAmount parameter missing" });
      return;
    }
    if (!body.customerEmail) {
      cb({ code: 500, message: "buyerIDparameter missing" });
      return;
    }
    if (!body.customerEmailSHA256) {
      cb({ code: 500, message: "buyerIDparameter missing" });
      return;
    }
    if (!body.orderId) {
      cb({ code: 500, message: "orderId missing" });
      return;
    }
    if (!body.orderNumber) {
      cb({ code: 500, message: "orderNumber missing" });
      return;
    }
    if (!body.redemptionPinSHA256) {
      cb({ code: 500, message: "redemptionHash parameter missing" });
      return;
    }
    if (!body.blockchain) {
      cb({ code: 500, message: "blockchain parameter missing" });
      return;
    } else if (body.blockchain.toLowerCase() != 'rinkeby' && body.blockchain.toLowerCase() != 'mainnet' && body.blockchain.toLowerCase() != 'kovan' && body.blockchain.toLowerCase() != 'ropsten') {
      cb({ code: 500, message: "blockchain parameter not valid" });
      return;
    }

    //get transaction made
    console.log('Building rawtx');
    let rawTx;
    try {
      rawTx = await this.ethereumMgr.makeTx({
        tokenURI: body.tokenURI,
        saleAmount: Math.floor(body.totalPrice),
        buyerID: body.customerEmailSHA256,
        redemptionHash: body.redemptionPinSHA256,
        orderNumber: body.orderNumber,
        blockchain: body.blockchain.toLowerCase(),
        methodName: 'soldOrderToMint',
      });
    } catch (err) {
      console.log("Error on this.ethereumMgr.makeTx");
      console.log(err);
      cb({ code: 500, message: err.message + " Originating from soldOrderToMint.js calling makeTx from ethereumMgr.js."});
      return;
    }

    //get rawTx signed
    console.log("Getting rawtx signed");
    console.log(body.blockchain.toLowerCase());
    let signedRawTx;
    try {
      console.log("sign tx from soldOrderToMint")
      signedRawTx = await this.ethereumMgr.signTx({
        tx: rawTx,
        blockchain: body.blockchain.toLowerCase(),
      });
    } catch (err) {
      console.log("Error on this.ethereumMgr.signTx");
      console.log(err);
      cb({ code: 500, message: "Sign Raw Tx Error: " + err.message });
      return;
    }

    //sets transaction hash from created and sent signed transaction - CHANGE
    let txHash;
    try {
      console.log("sending raw tx from soldOrderToMint")
      txHash = await this.ethereumMgr.sendRawTransaction(
        signedRawTx,
        body.blockchain.toLowerCase(),
      );
      //cb(null, txHash);
    } catch (err) {
      console.log("Error on this.ethereumMgr.sendRawTransaction");
      console.log(err);
      cb({ code: 500, message: "Send Raw Tx Error: " +  err.message });
      return;
    }

     //insert into orders table offchain
    try{
      let dborderid = await this.databaseMgr.insertOrder(body.orderId,body.orderNumber,body.customerEmail,body.totalPrice,body.redemptionPinSHA256, body.customerEmailSHA256, body.tokenURI);
      console.log("db orderid inserted: "+dborderid);
      cb(null, txHash);
    }catch (err){
      cb({ code: 500, message: "soldOrderToMint db insertOrder error: " + err.message });
      return;
    }

  }
}
module.exports = SoldOrderToMintHandler;
