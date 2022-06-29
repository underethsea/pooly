
const { ADDRESS } = require("./address.js");
const ethers = require("ethers");

const FILTERS = {
    CLAIM: {
        POLYGON: {
            address: ADDRESS.POLYGON.DISTRIBUTOR,
            topics: [ethers.utils.id("ClaimedDraw(address,uint32,uint256)")],
        }, AVALANCHE: {
            address: ADDRESS.AVALANCHE.DISTRIBUTOR,
            topics: [ethers.utils.id("ClaimedDraw(address,uint32,uint256)")],
        }
    },
    DEPOSIT: {
        POLYGON: {
            address: ADDRESS.POLYGON.POOL,
            topics: [ethers.utils.id("Deposited(address,address,address,uint256)")],
        },
        AVALANCHE: {
            address: ADDRESS.AVALANCHE.POOL,
            topics: [ethers.utils.id("Deposited(address,address,address,uint256)")],
        }
    },
    WITHDRAW: {
        POLYGON: {
            address: ADDRESS.POLYGON.POOL,
            topics: [
                ethers.utils.id("Withdrawal(address,address,address,uint256,uint256)"),
            ],
        }, AVALANCHE: {
            address: ADDRESS.AVALANCHE.POOL,
            topics: [
                ethers.utils.id("Withdrawal(address,address,address,uint256,uint256)"),
            ],
        }
    }
}
module.exports = { FILTERS }