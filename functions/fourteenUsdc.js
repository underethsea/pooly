const fourteenUsdc = (amount) => {
    let usdc = amount / 1e14;
    return usdc.toFixed();
};

module.exports.Fourteenusdc = fourteenUsdc