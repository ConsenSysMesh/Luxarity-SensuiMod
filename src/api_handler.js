"use strict";
const AWS = require("aws-sdk");

const AuthMgr = require("./lib/authMgr");
const EthereumMgr = require("./lib/ethereumMgr");
const DatabaseMgr = require("./lib/databaseMgr");
const TxMgr = require("./lib/txMgr");
const MetaTxMgr = require("./lib/metaTxMgr");
const FundHandler = require("./handlers/fund");
const CheckPendingHandler = require('./handlers/checkPending');
const SoldOrderToMintHandler = require('./handlers/soldOrderToMint');
const ChooseDonationHandler = require('./handlers/chooseDonation');
const MakeDonationHandler = require('./handlers/makeDonation');
const RedeemOrderHandler = require('./handlers/redeemOrder');
const SafeRedeemOrderHandler = require('./handlers/safeRedeemOrder');

/*
creating instantiations of the necessary elements to carry out
tx being signed, sent to relay, verified, funded, and sent to blockchain
*/
let authMgr = new AuthMgr();
let ethereumMgr = new EthereumMgr();
let databaseMgr = new DatabaseMgr();
let txMgr = new TxMgr(ethereumMgr);
let metaTxMgr = new MetaTxMgr(ethereumMgr);
let fundHandler = new FundHandler(authMgr, txMgr, ethereumMgr);
let checkPendingHandler = new CheckPendingHandler(ethereumMgr);
let soldOrderToMintHandler = new SoldOrderToMintHandler(ethereumMgr, databaseMgr);
let chooseDonationHandler = new ChooseDonationHandler(ethereumMgr,databaseMgr);
let makeDonationHandler = new MakeDonationHandler(ethereumMgr);
let redeemOrderHandler = new RedeemOrderHandler(ethereumMgr);
let safeRedeemOrderHandler = new SafeRedeemOrderHandler(ethereumMgr);

/*
method: fund
needed parameters in url endpoint:
- tx
- blockchain

activates fundhandler, which takes the following inputs (which are instatited
at the top of the file):
- authMgr
- ethereumMgr
- metaTxMgr

Purpose: this activates the handle method in handlers/fund.js, which verifies the tx with
txMgr, decodes the transaction, verifies who the transaction is from, check if it
is abusing the gas price by not funding any transaction with a set gas price of ethereum's
trending gas price * 50 (i.e. blockchainGasPrice * 50), gets the balance of the Address
to check if it's real/instatiated and check if funds are needed in the funder address, and then
sends funds to the funding address (if more funds is needed)
*/
module.exports.fund = (event, context, callback) => {
  preHandler(fundHandler, event, context, callback);
};


/*
method: soldOrderToMint
needed parameters in url endpoint:
  - string _tokenURI
  - uint256 _saleAmount
  - bytes32 _buyerID
  - bytes32 _redemptionHash
*/
module.exports.soldOrderToMint = (event, context, callback) => {
  preHandlerDatabase(soldOrderToMintHandler, event, context, callback);
};

/*
method: chooseDonation
needed parameters in url endpoint:
  - bytes32 _buyerID
  - string _charityName
  - uint256 _chosenDonateAmount
*/
module.exports.chooseDonation = (event, context, callback) => {
  preHandlerDatabase(chooseDonationHandler, event, context, callback);
};

/*
method: makeDonation
needed parameters in url endpoint:
  - bytes32 _proofHash
  - string _proofURL
  - uint256 _madeDonationAmount
  - string _charityName
*/
module.exports.makeDonation = (event, context, callback) => {
  preHandler(makeDonationHandler, event, context, callback);
};

/*
method: redeemOrder
needed parameters in url endpoint:
  - bytes32 _buyerID
  - bytes32 _redemptionHash
  - address _buyerAddress
  - uint256 _tokenId
*/
module.exports.redeemOrder = (event, context, callback) => {
  preHandler(redeemOrderHandler, event, context, callback);
};

/*
method: safeRedeemOrder
needed parameters in url endpoint:
  - bytes32 _buyerID
  - bytes32 _redemptionHash
  - address _buyerAddress
  - uint256 _tokenId
*/
module.exports.safeRedeemOrder = (event, context, callback) => {
  preHandler(safeRedeemOrderHandler, event, context, callback);
};


/*
method: checkPending
needed parameters in url endpoint:
- blockchain
- age

activates checkPendinghandler, which takes the following inputs (which are instatited
at the top of the file):
- authMgr
- ethereumMgr
- metaTxMgr

Purpose: this activates the handle method in handlers/checkPending.js, which checks the
pending transactions on chain and returns the tx receipts
*/
module.exports.checkPending = (event, context, callback) => {
  preHandler(checkPendingHandler, event, context, callback);
};

/*
prehandler function to ensure secrets are set then sends api status request
*/
const preHandler = (handler, event, context, callback) => {
  console.log(event);
  if (!ethereumMgr.isSecretsSet() || !authMgr.isSecretsSet()) {
    const kms = new AWS.KMS();
    kms
      .decrypt({
        CiphertextBlob: Buffer(process.env.SECRETS, "base64")
      })
      .promise()
      .then(data => {
        const decrypted = String(data.Plaintext);
        ethereumMgr.setSecrets(JSON.parse(decrypted));
        authMgr.setSecrets(JSON.parse(decrypted));
        doHandler(handler, event, context, callback);
      });
  } else {
    doHandler(handler, event, context, callback);
  }
};

const preHandlerDatabase = (handler, event, context, callback) => {
  console.log(event);
  if (!ethereumMgr.isSecretsSet() || !authMgr.isSecretsSet() || !databaseMgr.isSecretsSet()) {
    const kms = new AWS.KMS();
    kms
      .decrypt({
        CiphertextBlob: Buffer(process.env.SECRETS, "base64")
      })
      .promise()
      .then(data => {
        const decrypted = String(data.Plaintext);
        ethereumMgr.setSecrets(JSON.parse(decrypted));
        authMgr.setSecrets(JSON.parse(decrypted));
        databaseMgr.setSecrets(JSON.parse(decrypted));
        doHandler(handler, event, context, callback);
      });
  } else {
    doHandler(handler, event, context, callback);
  }
};

const doHandler = (handler, event, context, callback) => {
  handler.handle(event, context, (err, resp) => {
    let response;
    console.log("response: "+response);

     if (err == null) {
          response = {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true,
              "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT"
            },
            body: JSON.stringify({
              status: "success",
              data: resp
            })
          };
      } else {
        console.log(err);
          let code = 500;
          if (err.code) code = err.code;
          let message = err;
          if (err.message) message = err.message;

          response = {
            statusCode: code,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true,
              "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT"
            },
            body: JSON.stringify({
              status: "error",
              message: message
            })
           };
        }

      callback(null, response);
  });
}
