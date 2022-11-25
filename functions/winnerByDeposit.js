const fetch = require('cross-fetch')

const QuickChart = require('quickchart-js');
const chart = new QuickChart();

function NK(num) {
    return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num)
}
    
function NWC(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function getDraw(draw) {
    let data = await fetch('https://poolexplorer.xyz/draw' + draw)
    data = await data.json()
    return data
}

async function winnerByDeposit(drawStart, drawStop) {
    try{
    let bigList = []
    for (let x = drawStart; x <= drawStop; x++) {
        let drawData = await getDraw(x)
        bigList = bigList.concat(drawData)
    }
    let totalWon = 0
    let groupAThreshold = 0
    let groupA = []
    let groupATotalWinValue = 0

    let groupBThreshold = 1000
    let groupB = []
    let groupBTotalWinValue = 0

    let groupCThreshold = 10000
    let groupC = []
    let groupCTotalWinValue = 0

    let groupDThreshold = 50000
    let groupD = []
    let groupDTotalWinValue = 0

    let groupEThreshold = 100000
    let groupE = []
    let groupETotalWinValue = 0

    let groupFThreshold = 1000000
    let groupF = []
    let groupFTotalWinValue = 0

    bigList.forEach(win => {
        totalWon += win.w
        if (win.g >= groupFThreshold) {
            groupF.push(win)
            groupFTotalWinValue += win.w
        }
        else if (win.g < groupFThreshold && win.g >= groupEThreshold) {
            groupE.push(win)
            groupETotalWinValue += win.w

        }
        else if (win.g < groupEThreshold && win.g >= groupDThreshold) {
            groupD.push(win)
            groupDTotalWinValue += win.w

        }
        else if (win.g < groupDThreshold && win.g >= groupCThreshold) {
            groupC.push(win)
            groupCTotalWinValue += win.w

        }
        else if (win.g < groupCThreshold && win.g >= groupBThreshold) {
            groupB.push(win)
            groupBTotalWinValue += win.w

        }
        else if (win.g < groupBThreshold) {
            groupA.push(win)
            groupATotalWinValue += win.w

        }

    })
    console.log("Draw ",drawStart," to ",drawStop)
    console.log(bigList.length, " total wins ",totalWon, " USDC ")
    console.log("< ",NK(groupBThreshold)," | ",groupA.length, " wins ",groupATotalWinValue, " USDC ",(groupATotalWinValue / totalWon * 100).toFixed(0),"%")
    console.log(NK(groupBThreshold)," - ",NK(groupCThreshold)," | ",groupB.length, " wins ",groupBTotalWinValue, " USDC ",(groupBTotalWinValue / totalWon * 100).toFixed(0),"%")
    console.log(NK(groupCThreshold)," - ",NK(groupDThreshold)," | ",groupC.length, " wins ",groupCTotalWinValue, " USDC ",(groupCTotalWinValue / totalWon * 100).toFixed(0),"%")
    console.log(NK(groupDThreshold)," - ",NK(groupEThreshold)," | ",groupD.length, " wins ",groupDTotalWinValue, " USDC ",(groupDTotalWinValue / totalWon * 100).toFixed(0),"%")
    console.log(NK(groupEThreshold)," - ",NK(groupFThreshold)," | ",groupE.length, " wins ",groupETotalWinValue, " USDC ",(groupETotalWinValue / totalWon * 100).toFixed(0),"%")

    console.log("> ",groupFThreshold, " | ",groupF.length, " wins ",groupFTotalWinValue, " USDC ",(groupFTotalWinValue / totalWon * 100).toFixed(0),"%")
chart.setConfig({
  type: 'pie',
  "options": {
    "plugins": {
        "datalabels": {
                formatter: (value, ctx) => {
                   
                    let percentage = value+"%";
                    return percentage;
                },
          "display": true,
          "align": "center",
          "anchor": "center",
          "backgroundColor": "#0e0000",
          "borderColor": "#0e0000",
          "borderRadius": 9,
          "borderWidth": 1,
          "padding": 8,
          "color": "#f7f6f6",
          "font": {
            "family": "sans-serif",
            "size": 13,
            "style": "normal"
          }
        },
    "title": {
      "display": true,
      "position": "bottom",
      "fontSize": 15,
      "fontFamily": "sans-serif",
      "fontColor": "#666666",
      "fontStyle": "bold",
      "padding": 10,
      "lineHeight": 1.2,
      "text": "Draw " + drawStart + " to " + drawStop
    }}},
  data: {
    datasets: [
      {
        data: [(groupATotalWinValue / totalWon * 100).toFixed(0), 
        (groupBTotalWinValue / totalWon * 100).toFixed(0), 
        (groupCTotalWinValue / totalWon * 100).toFixed(0), 
        (groupDTotalWinValue / totalWon * 100).toFixed(0), 
        (groupETotalWinValue / totalWon * 100).toFixed(0),
        (groupFTotalWinValue / totalWon * 100).toFixed(0)],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
        ],
        label: 'Dataset 1',
      },
    ],
    labels: ['< '+ NWC(groupBThreshold), NWC(groupBThreshold) + " - " + NWC(groupCThreshold), NWC(groupCThreshold) + " - " +
 NWC(groupDThreshold), NWC(groupDThreshold) + " - " + NWC(groupEThreshold) ,NWC(groupEThreshold) + " - " + NWC(groupFThreshold),"> " + groupFThreshold]
  },
}
);
const url = await chart.getShortUrl();
let a = "< "+ NK(groupBThreshold)
let b = NK(groupBThreshold) + " - " + NK(groupCThreshold)
let c = NK(groupCThreshold) + " - " + NK(groupDThreshold)
let d = NK(groupDThreshold) + " - " + NK(groupEThreshold)
let e = NK(groupEThreshold) + " - " + NK(groupFThreshold) 
let f = "> " + NK(groupFThreshold)


let returnString = "```Draw " + drawStart + " to " + drawStop + "\n" +
NWC(bigList.length) + " total wins " + NWC(totalWon) + " USDC " + "\n\n" +
"Deposit Amount".padEnd(15,' ') + " | " + "Total Wins".padEnd(10,' ') + " | " + "Total Won".padStart(12,' ') + "\n" +
"---------------------------------------------------------" + "\n" +
a.padEnd(15,' ') + " | " + NWC(groupA.length).padEnd(10,' ') + " | " + NWC(parseInt(groupATotalWinValue)).padStart(7,' ') + " USDC " + (groupATotalWinValue / totalWon * 100).toFixed(0).padStart(4,' ') + "%" + "\n" +
b.padEnd(15,' ') + " | " + NWC(groupB.length).padEnd(10,' ') + " | " + NWC(parseInt(groupBTotalWinValue)).padStart(7,' ') + " USDC " + (groupBTotalWinValue / totalWon * 100).toFixed(0).padStart(4,' ') + "%" + "\n" +
c.padEnd(15,' ') + " | " + NWC(groupC.length).padEnd(10,' ') + " | " + NWC(parseInt(groupCTotalWinValue)).padStart(7,' ') + " USDC " + (groupCTotalWinValue / totalWon * 100).toFixed(0).padStart(4,' ') + "%" + "\n" +
d.padEnd(15,' ') + " | " + NWC(groupD.length).padEnd(10,' ') + " | " + NWC(parseInt(groupDTotalWinValue)).padStart(7,' ') + " USDC " + (groupDTotalWinValue / totalWon * 100).toFixed(0).padStart(4,' ') + "%" + "\n" +
e.padEnd(15,' ') + " | " + NWC(groupE.length).padEnd(10,' ') + " | " + NWC(parseInt(groupETotalWinValue)).padStart(7,' ') + " USDC " + (groupETotalWinValue / totalWon * 100).toFixed(0).padStart(4,' ') + "%" + "\n" +
"1,000,000".padEnd(15,' ') + " | " + NWC(groupF.length).padEnd(10,' ') + " | " + NWC(parseInt(groupFTotalWinValue)).padStart(7,' ') + " USDC " + (groupFTotalWinValue / totalWon * 100).toFixed(0).padStart(4,' ') + "%" + "\n" +
'```'

returnString += url
return returnString;
    }catch(error){console.log(error)}
}

module.exports.WinnerByDeposit = winnerByDeposit



