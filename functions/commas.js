const commas = (number) => {
    if(number<1){return number.toFixed(2)}else{
    let fixed = number.toFixed();
    return fixed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }};

  module.exports.Commas = commas
