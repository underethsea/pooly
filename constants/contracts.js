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
        ),
OPTIMISM: new ethers.Contract(
	ADDRESS.OPTIMISM.TICKET,
	ABI.TICKET,
	PROVIDERS.OPTIMISM),
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
        ), OPTIMISM: new ethers.Contract(
            ADDRESS.OPTIMISM.AAVETOKEN,
            ABI.AAVE,
            PROVIDERS.OPTIMISM
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
        ),
        AVALANCHE: new ethers.Contract(
            ADDRESS.AVALANCHE.PRIZETIER,
            ABI.PRIZETIER,
            PROVIDERS.AVALANCHE
        ),
        OPTIMISM: new ethers.Contract(
            ADDRESS.OPTIMISM.PRIZETIER,
            ABI.PRIZETIER,
            PROVIDERS.OPTIMISM
        ), POLYGON: new ethers.Contract(
            ADDRESS.POLYGON.PRIZETIER,
            ABI.PRIZETIER,
            PROVIDERS.POLYGON
        )
    }
}

module.exports = { CONTRACTS }
