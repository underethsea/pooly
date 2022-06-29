const commas = (number) => {
    let fixed = number.toFixed();
    return fixed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  module.exports.Commas = commas