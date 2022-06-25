// const tierNumPrizes = [3,48,192,768] // newly proposed
const simulationDays = 365;


function simulate(deposit,scalingVariable,totalPrizes,dailyProbWin,tierPrizesAfterGas,tierNumPrizes) {
    let prizes = [];
    for (let draw = 0; draw < Math.trunc(deposit/scalingVariable); draw++) {
        for (let tier in tierNumPrizes) {
        if (Math.random() < (tierNumPrizes[tier] / totalPrizes) * dailyProbWin) {
            prizes.push(tierPrizesAfterGas[tier]);
        }
        }
    }
    return prizes.sort(function (a, b) {
        return b - a;
    });
    }
    let prizeResults = [];

module.exports = function calculateWinnings(
    deposit,
    simulateDays,
    scalingVariable,
    totalPrizes,
    dailyProbWin,
    tierPrizesAfterGas,
    tierNumPrizes,
    maxPrizes
    ) {
    let claimableWinnings = 0;
    let totalWinnings = 0;
    let firstPrizeDay = 0;
    let droppedPrizes = 0 

    for (let days = 0; days < simulateDays; days++) {
        let dayResult = simulate(deposit,scalingVariable,totalPrizes,dailyProbWin,tierPrizesAfterGas,tierNumPrizes);
        if (dayResult[0] > 0 && firstPrizeDay === 0 ) {firstPrizeDay = days}
        totalWinnings += dayResult.reduce((partial_sum, a) => partial_sum + a, 0);
        claimableWinnings += dayResult
        .slice(0, maxPrizes)
        .reduce((partial_sum, a) => partial_sum + a, 0);
        let dropped = dayResult.slice(maxPrizes, dayResult.length);
        droppedPrizes += dropped.length;
        // if (dropped[0] > 0) {
        // console.log(dayResult, " ", droppedPrizes); dropped info
        // }
    }
    prizeResults.push(parseInt(claimableWinnings.toFixed()));
    //  TODO need to better address not winning - maybe change to odds calculation for first prize - or count players winning zero
    if(firstPrizeDay === 0) {firstPrizeDay = simulateDays;} 
    return [
        claimableWinnings,
        totalWinnings,
        claimableWinnings / totalWinnings,
        droppedPrizes,firstPrizeDay
    ];
    }
