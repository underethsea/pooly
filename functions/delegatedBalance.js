
const ethers = require("ethers")
const { CONTRACTS } = require("../constants/contracts.js")
async function delegatedBalance(address, network) {
    try {
        if (network === 1) {
            contract = CONTRACTS.TICKET.ETHEREUM;
        }
        if (network === 3) {
            contract = CONTRACTS.TICKET.POLYGON;
        }
        if (network === 4) {
            contract = CONTRACTS.TICKET.AVALANCHE;
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
module.exports.DelegatedBalance = delegatedBalance
