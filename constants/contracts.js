const ethers = require("ethers");
const { ABI } = require("./constants/abi.js")
const { ADDRESS } = require("./constants/address.js");


const polygonTicketContract = new ethers.Contract(
    ADDRESS.POLYGON.TICKET,
    ABI.TICKET,
    polygonProvider
);

const avalancheTicketContract = new ethers.Contract(
    ADDRESS.AVALANCHE.TICKET,
    ABI.TICKET,
    avalancheProvider
);
const ethereumTicketContract = new ethers.Contract(
    ADDRESS.ETHEREUM.TICKET,
    ABI.TICKET,
    ethereumProvider
);

const polygonAaveContract = new ethers.Contract(
    ADDRESS.POLYGON.AAVETOKEN,
    ABI.AAVE,
    polygonProvider
);
const avalancheAaveContract = new ethers.Contract(
    ADDRESS.AVALANCHE.AAVETOKEN,
    ABI.AAVE,
    avalancheProvider
);
const ethereumAaveContract = new ethers.Contract(
    ADDRESS.ETHEREUM.AAVETOKEN,
    ABI.AAVE,
    ethereumProvider
);

const polygonAaveIncentivesContract = new ethers.Contract(
    ADDRESS.POLYGON.AAVEINCENTIVES,
    ABI.AAVEINCENTIVES,
    polygonProvider
);
const avalancheAaveIncentivesContract = new ethers.Contract(
    ADDRESS.AVALANCHE.AAVEINCENTIVES,
    ABI.AAVEINCENTIVES,
    avalancheProvider
);
const ethereumAaveIncentivesContract = new ethers.Contract(
    ADDRESS.ETHEREUM.AAVEINCENTIVES,
    ABI.AAVEINCENTIVES,
    ethereumProvider
);

const prizeTierContract = new ethers.Contract(
    ADDRESS.ETHEREUM.PRIZETIER,
    ABI.PRIZETIER,
    ethereumProvider
);
