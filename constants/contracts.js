const ethers = require("ethers");
const { ABI } = require("./abi.js")
const { ADDRESS } = require("./address.js");
const { PROVIDERS } = require("./providers.js")

const CONTRACTS = {
BEACON: {
POLYGON: new ethers.Contract(ADDRESS.POLYGON.BEACON,ABI.BEACON,PROVIDERS.POLYGON),
ETHEREUM: new ethers.Contract(ADDRESS.ETHEREUM.BEACON,ABI.BEACON,PROVIDERS.ETHEREUM),
AVALANCHE: new ethers.Contract(ADDRESS.ETHEREUM.BEACON,ABI.BEACON,PROVIDERS.ETHEREUM),
// AVALANCHE: new ethers.Contract(ADDRESS.AVALANCHE.BEACON,ABI.BEACON,PROVIDERS.AVALANCHE),
//  OP AND AVAX HACK - -- - USSES MAINNET BECAUSE OP NO BEACON!!!!!!
OPTIMISM: new ethers.Contract(ADDRESS.ETHEREUM.BEACON,ABI.BEACON,PROVIDERS.ETHEREUM),
},

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
            PROVIDERS.OPTIMISM)
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
            ),OPTIMISM: new ethers.Contract(
                ADDRESS.OPTIMISM.AAVEINCENTIVES,
                ABI.AAVEINCENTIVESV3,
                PROVIDERS.OPTIMISM)
    }, PRIZETIER: {
        ETHEREUM: new ethers.Contract(
            ADDRESS.ETHEREUM.PRIZETIER,
            ABI.PRIZETIERV2,
            PROVIDERS.ETHEREUM
        ),
        AVALANCHE: new ethers.Contract(
            ADDRESS.AVALANCHE.PRIZETIER,
            ABI.PRIZETIERV2,
            PROVIDERS.AVALANCHE
        ),
        OPTIMISM: new ethers.Contract(
            ADDRESS.OPTIMISM.PRIZETIER,
            ABI.PRIZETIERV2,
            PROVIDERS.OPTIMISM
        ), POLYGON: new ethers.Contract(
            ADDRESS.POLYGON.PRIZETIER,
            ABI.PRIZETIERV2,
            PROVIDERS.POLYGON
        )
    }, AAVEDATA: {
OPTIMISM: new ethers.Contract(
            ADDRESS.OPTIMISM.AAVEDATA,
            ABI.AAVEDATA,
            PROVIDERS.OPTIMISM),
ETHEREUM: new ethers.Contract(
            ADDRESS.ETHEREUM.AAVEDATA,
            ABI.AAVEDATAV2,
            PROVIDERS.ETHEREUM),
POLYGON: new ethers.Contract(
            ADDRESS.POLYGON.AAVEDATA,
            ABI.AAVEDATAV2,
            PROVIDERS.POLYGON),
AVALANCHE: new ethers.Contract(
            ADDRESS.AVALANCHE.AAVEDATA,
            ABI.AAVEDATAV2,
            PROVIDERS.AVALANCHE)



}

}

module.exports = { CONTRACTS }
