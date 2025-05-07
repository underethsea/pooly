function chainToId(chain) {
console.log(chain)
chain = chain.toString()
 if (chain == "1" || chain.startsWith("eth")) { chain = 1 }
    else if (chain == "3" || chain.startsWith("poly")) { chain = 137 }
    else if (chain == "4" || chain.startsWith("ava")) { chain = 43114 }
    else if (chain === "6" || chain.startsWith("op")) { chain = 10 }
    else { chain = 10 }
return chain
}
module.exports.ChainToId = chainToId
