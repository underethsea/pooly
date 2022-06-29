const ethers = require("ethers");
const { ABI } = require("./abi.js")
const { ADDRESS } = require("./address.js");
const { PROVIDERS } = require("./providers.js")

const CONTRACTS = {
    TICKET: {
        POLYGON: new ethers.Contract(
            ADDRESS.POLYGON.TICKET,
            ABI.TICKET,
            PROVIDERS.POLYGON), AVALANCHE: new ethers.Contract(
                ADDRESS.AVALANCHE.TICKET,
                ABI.TICKET,
                PROVIDERS.AVALANCHE
            ),
        ETHEREUM: new ethers.Contract(
            ADDRESS.ETHEREUM.TICKET,
            ABI.TICKET,
            PROVIDERS.ETHEREUM
        )
    }, AAVE: {
        POLYGON: new ethers.Contract(
            ADDRESS.POLYGON.AAVETOKEN,
            ABI.AAVE,
            PROVIDERS.POLYGON
        ), AVALANCHE: new ethers.Contract(
            ADDRESS.AVALANCHE.AAVETOKEN,
            ABI.AAVE,
            PROVIDERS.AVALANCHE
        ), ETHEREUM: new ethers.Contract(
            ADDRESS.ETHEREUM.AAVETOKEN,
            ABI.AAVE,
            PROVIDERS.ETHEREUM
        )
    }, AAVEINCENTIVES: {
        POLYGON:
            new ethers.Contract(
                ADDRESS.POLYGON.AAVEINCENTIVES,
                ABI.AAVEINCENTIVES,
                PROVIDERS.POLYGON
            ), ETHEREUM: new ethers.Contract(
                ADDRESS.ETHEREUM.AAVEINCENTIVES,
                ABI.AAVEINCENTIVES,
                PROVIDERS.ETHEREUM
            ), AVALANCHE: new ethers.Contract(
                ADDRESS.AVALANCHE.AAVEINCENTIVES,
                ABI.AAVEINCENTIVES,
                PROVIDERS.AVALANCHE
            )
    }, PRIZETIER: {
        ETHEREUM: new ethers.Contract(
            ADDRESS.ETHEREUM.PRIZETIER,
            ABI.PRIZETIER,
            PROVIDERS.ETHEREUM
        )
    }
}

module.exports = { CONTRACTS }
