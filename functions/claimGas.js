const fetch = require('cross-fetch')
const {ADDRESS} = require('../constants/address')
const dotenv = require("dotenv");

dotenv.config();

const key = 'ckey_d8ea1001bff74ecb8cc3afd51ec'

async function getGasForClaims() {

let distributorAddress = ADDRESS.ETHEREUM.DISTRIBUTOR
let chain = 1
let covalentUrl = "https://api.covalenthq.com/v1/" + chain + "/address/" + distributorAddress + "/transactions_v2/?quote-currency=USD&format=JSON&block-signed-at-asc=true&no-logs=false&page-number=1&page-size=100&key=" + key
let covalentFetch = await fetch(covalentUrl)
covalentFetch = await covalentFetch.json()
covalentFetch = covalentFetch.data.items
covalentFetch.forEach(claim =>{ console.log(claim.tx_hash)/*;console.log("raw ",claim.raw_log_topics)*/;console.log("decoded ",claim.decoded.fees_paid)})

}
getGasForClaims()
