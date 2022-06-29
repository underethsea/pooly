
const dotenv = require("dotenv");
dotenv.config();

// const ethereumEndpoint = "https://mainnet.infura.io/v3/" + process.env.ETHEREUM_KEY;
// const ethereumEndpoint = "https://eth-mainnet.alchemyapi.io/v2/IoY2MivSyvhBktzHoyto2ZqUsG2BEWth"

const ethereumEndpoint = "https://eth-mainnet.alchemyapi.io/v2/" + process.env.POLYGON_KEY;
const polygonEndpoint = "https://polygon-mainnet.g.alchemy.com/v2/" + process.env.POLYGON_KEY;
const avalancheEndpoint = "https://api.avax.network/ext/bc/C/rpc";
const optimismEndpoint = "https://opt-mainnet.g.alchemy.com/v2/" + process.env.POLYGON_KEY;
// const avalancheEndpoint = "https://rpc.ankr.com/avalanche";

const PROVIDER = {
    POLYGON: new ethers.providers.JsonRpcProvider(polygonEndpoint),
    AVALANCHE: new ethers.providers.JsonRpcProvider(
        avalancheEndpoint
    ),
    ETHEREUM: new ethers.providers.JsonRpcProvider(ethereumEndpoint),
    OPTIMISM: new ethers.providers.JsonRpcProvider(optimismEndpoint)
}

modules.export = { PROVIDER }