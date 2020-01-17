exports.deliveryCharge = (price_amount, pincode) => {
  let charge;
  price_amount > 0 ? (charge = 0) : (charge = 50);
  return charge;
};
