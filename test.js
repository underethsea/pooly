const fetch = require('cross-fetch')
async function get() {
let p = await fetch('https://poolexplorer.xyz/recent/')
let q= await p.json()
return q
}
async function go() {
let q = await get()
q.result.forEach(y=>{console.log(y.a)})
console.log(q.result.length)
}
go()
