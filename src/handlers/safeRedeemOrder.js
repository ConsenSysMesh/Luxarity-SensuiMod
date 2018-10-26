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
        cb({ code: 500, message: "no json body - error in parsing" });
        return;
      }
    } else {
      cb({ code: 500, message: "no json body - improper format or object" });
      return;
    }

    //check body
    console.log(body);
    console.log(body.toString());

    /* checking for inputs */
    if (!body.customerEmailSHA256) {
      cb({ code: 500, message: "buyerID parameter missing" });
      return;
    }
    if (!body.redemptionPinSHA256) {
      cb({ code: 500, message: "redemptionHash parameter missing" });
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


    //get transaction made
    console.log('Building rawtx');
    let rawTx;
    try {
      rawTx = await this.ethereumMgr.makeTx({
        buyerID: body.customerEmailSHA256,
        redemptionHash: body.redemptionPinSHA256,
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
