/*
method: safeRedeemOrder

needed parameters in url endpoint:
  - bytes32 buyerID
  - bytes32 redemptionHash
  - address buyerAddress
  - uint256 tokenId

activates safeRedeemOrderHandler, which takes the following inputs (which are instatited
at the top of the file):
  - authMgr*
  - ethereumMgr
*/

//resources
import sha256 from 'js-sha256';

//class
class SafeRedeemOrderHandler {
  constructor(ethereumMgr) {
    this.ethereumMgr = ethereumMgr;
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

    let body;

    if (event && !event.body) {
      body = event;
    } else if (event && event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        cb({ code: 500, message: "no json body" });
        return;
      }
    } else {
      cb({ code: 500, message: "no json body" });
      return;
    }

    /* checking for inputs */
<<<<<<< HEAD
    if (!body.customerEmailSHA256) {
      cb({ code: 500, message: "buyerID parameter missing" });
      return;
    }
    if (!body.redemptionPinSHA256) {
      cb({ code: 500, message: "redemptionHash parameter missing" });
=======
    if (!body.customerEmail && typeof(body.orderId) === "string") {
      cb({ code: 400, message: "customerEmail missing" });
      return;
    }
    if (!body.orderId && typeof(body.orderId) === "number") {
      cb({ code: 400, message: "orderId parameter missing" });
      return;
    }
    if (!body.orderNumber && typeof(body.orderId) === "number") {
      cb({ code: 400, message: "orderNumber parameter missing" });
>>>>>>> 898df6d143cadb11dba0cb268afab8dded438f3b
      return;
    }
    if (!body.buyerAddress) {
      cb({ code: 500, message: "buyerAddress parameter missing" });
      return;
    }
    if (!body.tokenId) {
      cb({ code: 500, message: "tokenId parameter missing" });
      return;
    }
    if (!body.blockchain) {
      cb({ code: 500, message: "blockchain parameter missing" });
      return;
    } else if (body.blockchain.toLowerCase() != 'rinkeby' && body.blockchain.toLowerCase() != 'mainnet' && body.blockchain.toLowerCase() != 'kovan' && body.blockchain.toLowerCase() != 'ropsten') {
      cb({ code: 500, message: "blockchain parameter not valid" });
      return;
    }

    //create hashed buyerID, redemptionHash
    let buyerID = sha256(body.customerEmail);
    let secretSum = body.orderNumber + body.orderId;
    let redemptionHash = sha256(secretSum);

    //get transaction made
    console.log('Building rawtx');
    let rawTx;
    try {
      rawTx = await this.ethereumMgr.makeTx({
<<<<<<< HEAD
        buyerID: body.customerEmailSHA256,
        redemptionHash: body.redemptionPinSHA256,
=======
        buyerID: buyerID,
        redemptionHash: redemptionHash,
>>>>>>> 898df6d143cadb11dba0cb268afab8dded438f3b
        buyerAddress: body.buyerAddress,
        tokenId: body.tokenId,
        blockchain: body.blockchain.toLowerCase(),
        methodName: 'safeRedeemOrder',
      });
    } catch (err) {
      console.log("Error on this.ethereumMgr.makeTx");
      console.log(err);
      cb({ code: 500, message: err.message + " Originating from safeRedeemOrder.js calling makeTx from ethereumMgr.js."});
      return;
    }

    //get rawTx signed
    console.log("Getting rawtx signed");
    console.log(body.blockchain.toLowerCase());
    let signedRawTx;
    try {
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
      txHash = await this.ethereumMgr.sendRawTransaction(
        signedRawTx,
        body.blockchain.toLowerCase(),
      );
      cb(null, txHash);
    } catch (err) {
      console.log("Error on this.ethereumMgr.sendRawTransaction");
      console.log(err);
      cb({ code: 500, message: "Send Raw Tx Error: " +  err.message });
      return;
    }

  }
}
module.exports = SafeRedeemOrderHandler;
