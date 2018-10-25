/*
method: makeDonation
needed parameters in url endpoint:
  - bytes32 proofHash
  - string proofURL
  - uint256 madeDonationAmount
  - string charityName

activates makeDonationHandler, which takes the following inputs (which are instatited
at the top of the file):
  - authMgr*
  - ethereumMgr
*/
class MakeDonationHandler {
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

    let body = event.Records[0].body; 
    try { 
      body = JSON.parse(body); 
    } catch(e) { 
      cb({ code: 500, message: "no json body" }); 
      return; 
    } 

    //check body
    console.log(body);
    console.log(body.toString());

    /* checking for inputs */
    if (!body.proofHash) {
      cb({ code: 500, message: "proofHash parameter missing" });
      return;
    }
    if (!body.proofURL) {
      cb({ code: 500, message: "proofURL parameter missing" });
      return;
    }
    if (!body.madeDonationAmount) {
      cb({ code: 500, message: "madeDonationAmount parameter missing" });
      return;
    }
    if (!body.charityName) {
      cb({ code: 500, message: "charityNameparameter missing" });
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
        proofHash: body.proofHash,
        proofURL: body.proofURL,
        madeDonationAmount: body.madeDonationAmount,
        charityName: body.charityName,
        blockchain: body.blockchain.toLowerCase(),
        methodName: 'makeDonation',
      });
    } catch (err) {
      console.log("Error on this.ethereumMgr.makeTx");
      console.log(err);
      cb({ code: 500, message: err.message + " Originating from makeDonation.js calling makeTx from ethereumMgr.js."});
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
module.exports = MakeDonationHandler;
