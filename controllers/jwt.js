const jwt = require("jsonwebtoken");

const secretKey = "ChaiTan_1024";

exports.jwt_generator = user_id => {
  return jwt.sign(
    {
      user_id
    },
    secretKey
  );
};

exports.jwt_verify = client_token => {
  try {
    const result = jwt.verify(client_token, secretKey);
    return result.user_id;
  } catch (err) {
    return undefined;
  }
};
