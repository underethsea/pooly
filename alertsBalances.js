

       async function delegatedBalance(address, network) {
  try {
    if (network === 1) {
      contract = ethereumTicketContract;
    }
    if (network === 3) {
      contract = polygonTicketContract;
    }
    if (network === 4) {
      contract = avalancheTicketContract;
    }
    let nowTime = parseInt(Date.now() / 1000);
    let balance = await contract.getBalanceAt(address, nowTime);
    balance = ethers.utils.formatUnits(balance, 6);
    return balance;
  } catch (error) {

    console.log(error);
return 0
  }
}

const pgp = require("pg-promise")(/* initialization options */);
const ethers = require("ethers");
const fs = require("fs");
const dotenv = require("dotenv");
var emoji = require("./functions/emoji.js");

dotenv.config();
const yek = "h6F2U032M_OcexfJyYFFsLFk4CdceAnb";
const polygonEndpoint = "https://polygon-mainnet.g.alchemy.com/v2/" + yek;
const ethereumEndpoint = "https://eth-mainnet.alchemyapi.io/v2/IoY2MivSyvhBktzHoyto2ZqUsG2BEWth"
const avalancheEndpoint = "https://rpc.ankr.com/avalanche";

const cdn = {
  host: "localhost", // server name or IP address;
  port: 5432,
  database: "birdcall",
  user: process.env.USER,
  password: process.env.PASSWORD,
};
const db = pgp(cdn);

let abi = ["function balanceOf(address) public view returns (uint256)",
"function getBalanceAt(address user, uint64 timestamp) external view returns (uint256)"];
const ptausdcavax = "0xB27f379C050f6eD0973A01667458af6eCeBc1d90"
const ptausdceth = "0xdd4d117723C257CEe402285D3aCF218E9A8236E1"
let ptausdc = "0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076";


const polygonProvider = new ethers.providers.JsonRpcProvider(polygonEndpoint);
const avaxProvider = new ethers.providers.JsonRpcProvider(avalancheEndpoint)
const ethProvider = new ethers.providers.JsonRpcProvider(ethereumEndpoint)


const contract = new ethers.Contract(ptausdc, abi, polygonProvider);
const ethcontract = new ethers.Contract(ptausdceth, abi, ethProvider);
const avaxcontract = new ethers.Contract(ptausdcavax, abi, avaxProvider);

const query = "select WALLET from addresses;";
let total = 0
let userWithZero =0
let smallBalance = 0
let nowTime = parseInt(Date.now() / 1000);
console.log("balances at: ",nowTime)
async function run() {
  let queryRun = await db.any(query);
  for (let player of queryRun) {
    let address = player.wallet;

    let balance = await contract.getBalanceAt(address,nowTime);
    balance = ethers.utils.formatUnits(balance, 6)
    let ethbalance = await ethcontract.getBalanceAt(address,nowTime);
    ethbalance = ethers.utils.formatUnits(ethbalance, 6)
    let avaxbalance = await avaxcontract.getBalanceAt(address,nowTime);
    avaxbalance = ethers.utils.formatUnits(avaxbalance, 6)
    let userTotal = parseFloat(balance) + parseFloat(ethbalance) + parseFloat(avaxbalance)
    total +=  userTotal
    if(userTotal < .1 ){userWithZero +=1;}
//    if(userTotal > 4){console.log(address," , ", userTotal, " , ", balance, ", ",ethbalance," , ",avaxbalance);
if(userTotal >= 4) {console.log(address),"  ",userTotal}
if(userTotal >= .1 && userTotal < 4) {console.log("------","  ", userTotal);smallBalance +=1;}
  }
  console.log("users with zero: ",userWithZero)
  console.log("total users ",queryRun.length)
  console.log("users with small balance: ",smallBalance)
console.log("total balance ",total)

}
run()
