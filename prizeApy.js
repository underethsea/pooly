// fork of script from @KingXKok of PT Discord

// print longer than 100 item array


const simulationDays = 365;
const simulationRuns = 100;


const maxPrizes = 2;

const gasToClaim = .8;
// const tierNumPrizes = [1, 3, 12, 48, 192, 768, 3072];
const tierNumPrizes = [3,48,192,768] // newly proposed

// const tierPrizes = [2500, 500, 200, 50, 10, 5, 1];
const tierPrizes = [1000,50,10,5] //newly proposed

module.exports = async function simulateApy(depositAmount,tvl,gasToClaim) {


let scalingVariable = 1 // used to make calculating prizes faster as deposit grows
if(depositAmount > 200) {scalingVariable = 5}
if(depositAmount > 1000) {scalingVariable = 25}
if(depositAmount > 5000) {scalingVariable = 75}
if(depositAmount > 50000) {scalingVariable = 175}
if(depositAmount > 75000) {scalingVariable = 350}
if(depositAmount >  100000) {scalingVariable = 500}
if(depositAmount > 150000) {scalingVariable = 1000}
if(depositAmount > 250000) {scalingVariable = 2000}
if(depositAmount > 400000) {scalingVariable = 2800}
if(depositAmount > 600000) {scalingVariable = 4000}
if(depositAmount > 800000) {scalingVariable = 5000}
if(depositAmount > 1000000) {scalingVariable = 7000}
if(depositAmount > 2000000) {scalingVariable = 14000}
if(depositAmount > 4000000) {scalingVariable = 28000}
if(depositAmount > 8000000) {scalingVariable = 50000}
if(depositAmount > 16000000) {scalingVariable = 110000}



// charts if you wanna get cray cray
// var asciichart = require ('asciichart')
let totalPrizeValue = 0;
let totalPrizes = 0;
let gasCost = 0;


for (x = 0; x < tierNumPrizes.length; x++) {
  totalPrizeValue += tierNumPrizes[x] * tierPrizes[x];
  if (tierNumPrizes[x] * tierPrizes[x] > 0) {
    totalPrizes += tierNumPrizes[x];
  }
}
const dailyProbWin = 1 / (tvl / totalPrizes/scalingVariable); // daily dollar probability of winning

console.log("total prize value: ", totalPrizeValue);
console.log("total number of prizes: ", totalPrizes);

let tierPrizesAfterGas = [];

for (x in tierPrizes) {
  let prizeVal = Math.max(0, tierPrizes[x] - gasToClaim);

  tierPrizesAfterGas.push(prizeVal);
}


let claimable = 0;
let winnings = 0;
let min = depositAmount;
let max = 0;
let claimableAmount = 0;
let droppedTotal = 0;
let firstPrizeDayTotal = 0
for (x = 0; x < simulationRuns; x++) {
  winnings = calculateWinnings(depositAmount,simulationDays,scalingVariable,totalPrizes,dailyProbWin,tierPrizesAfterGas);
  // log each simulation
  // console.log(winnings);
  droppedNumber = winnings[3];
  droppedTotal += droppedNumber;
  claimableAmount = winnings[0];
  claimable += claimableAmount;
  firstPrizeDayTotal += winnings[4]
  if (claimableAmount < min) {
    min = claimableAmount;
  }
  if (claimableAmount > max) {
    max = claimableAmount;
  }
}
tierString = "";
for (x in tierNumPrizes) {
  tierString += tierNumPrizes[x] + ": " + tierPrizes[x] + " ";
}
console.log("prize tiering: ", tierString);
console.log(
  depositAmount,
  " deposited for ",
  simulationDays,
  " days with gas cost to claim of ",
  gasToClaim
);
console.log("unluckiest player claimable: ", min.toFixed());
console.log("luckiest player claimable: ", max.toFixed());

let annualized = (365 / simulationDays) * 100;
let averageClaimable = claimable / simulationRuns;
let averageApr = annualized * (claimable / simulationRuns / depositAmount);
console.log(
  "average claimable: ",
  averageClaimable.toFixed(),
  " ",
  averageApr.toFixed(2),
  "% APR"
);
console.log("prizes dropped per player", droppedTotal / simulationRuns);
console.log("average first prize day: ",firstPrizeDayTotal/simulationRuns)
console.log("simulated ", simulationRuns, " times with a TVL of ", tvl);
// console.dir(prizeResults, { depth: null });

// more than 100 items
// console.log(util.inspect(prizeResults, { maxArrayLength: null }))

// example ascii chart
// console.log (asciichart.plot (prizeResults,{height:30}))
return averageApr.toFixed(2);
}

function simulate(deposit,scalingVariable,totalPrizes,dailyProbWin,tierPrizesAfterGas) {
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

function calculateWinnings(
  deposit,
  simulateDays,
  scalingVariable,
  totalPrizes,
  dailyProbWin,
  tierPrizesAfterGas
) {
  let claimableWinnings = 0;
  let totalWinnings = 0;
  let firstPrizeDay = 0;
  let droppedPrizes = 0 

  for (let days = 0; days < simulateDays; days++) {
    let dayResult = simulate(deposit,scalingVariable,totalPrizes,dailyProbWin,tierPrizesAfterGas);
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

simulateApy(5000,28000000,.05).then(apy => console.log("finished"))
