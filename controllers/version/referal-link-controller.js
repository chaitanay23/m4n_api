const ENV = require("../../env");
const MobileDetect = require("mobile-detect");
const ANDROID_PATH_ENV = ENV.ANDROID_PATH_ENV;
const IOS_PATH_ENV = ENV.IOS_PATH_ENV;
const WEBSITE_ENV = ENV.WEBSITE_ENV;

exports.getUrl = (req, res) => {
  const md = new MobileDetect(req.headers["user-agent"]);
  const platform = md.os();
  if (platform == "AndroidOS") {
    return res.redirect(ANDROID_PATH_ENV);
  } else if (platform == "iOS") {
    return res.redirect(IOS_PATH_ENV);
  } else {
    return res.redirect(WEBSITE_ENV);
  }
};
