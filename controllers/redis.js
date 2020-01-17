const redis = require("redis");

// Creating Redis Client
let client = redis.createClient();

// To check if Redis connection was successful
client.on("connect", () => {
  console.table(["Connected to Redis"]);
});

// Pushing token in Redis list tail-wise
exports.addToBlacklist = token => {
  client.rpush(["Blacklist", token], (err, reply) => {
    console.log("Token added to Blacklist");
  });
};

// Fetching Redis list for Authentication
exports.authenticateToken = (token, callback) => {
  // eslint-disable-next-line no-useless-catch
  try {
    client.lrange("Blacklist", 0, -1, (_, reply) => {
      if (reply.includes(token)) {
        callback(true);
      } else {
        callback(false);
      }
    });
  } catch (err) {
    throw err;
  }
};
