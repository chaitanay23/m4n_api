const delhivery_staging_url = "https://staging-express.delhivery.com";
const staging_token = "97db8c4c3af5bf9695c95b5055fde6f2bbe8e81b";
const staging_client_name = "MADFORSURFACE-B2C";
const prod_token = "711c7176e47be143988ac4fa1e4df33009e4731c";
const prod_client_name = "MADFOR SURFACE";
const delhivery_production_url = "https://track.delhivery.com";

exports.USERNAME = "9871172999";
exports.PASSWORD = "Tepl*1234";
exports.FEEDID = "375359";
exports.BASEURL = "http://0.0.0.0:3000";
exports.PREFIX = "Z";
exports.ORIGINPIN = "201303";
exports.SHIPTYPE = "NONDOX";
exports.PRODUCTTYPE = "LITE";
exports.SERVICETYPE = "AR1";
exports.CONTENT = "SNAPON NAILS";
exports.INSURED = "OWN";
exports.WEIGHT = 0.035;
exports.COUNTRY = "INDIA";
exports.PAYMENT_MODE = "prepaid";
exports.COD_AMT = 0;
exports.RETURN_ADDRESS = "Uttar Pardesh";
exports.RETURN_PIN = 201301;
exports.SELLER_NAME = "BeSmarty Technologies Pvt. Ltd.";
exports.SELLER_ADDRESS = "J-43,SECTOR -63,NOIDA, U.P,201301";
exports.HSN = 3926099;
exports.LOGISTICS_DELHIVERY_PINCODE = `${delhivery_production_url}/c/api/pin-codes/json/?token=${prod_token}&filter_codes=`;
exports.LOGISTICS_DELHIVERY_TRACK_ORDER = `${delhivery_production_url}/api/v1/packages/json/?token=${prod_token}&verbose=0&waybill=`;
exports.LOGISTICS_DELHIVERY_GENERATE_WAYBILL = `${delhivery_production_url}/waybill/api/fetch/json/?cl=${prod_client_name}&token=${prod_token}`;

exports.PINCODE_DTDC =
  "http://fareyesvc.ctbsplus.dtdc.com/ratecalapi/PincodeApiCall";
exports.DTDTC_LOGIN =
  "https://blktracksvc.dtdc.com/dtdc-api/api/dtdc/authenticate?username=SL1834_trk&password=YeyrixNMBc";
exports.DTDC_TRACK =
  "https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/getTrackDetails";
exports.PAYMENT_STATUS = "SUCCESS";
exports.COD_MODE = "COD";
exports.COD_MIN_AMT = 200;
exports.ANDROID_PATH_ENV =
  "https://play.google.com/store/search?q=pub%3ABeSmarty%20Marketplace%20Pvt.%20Ltd.&c=apps&hl=en";
exports.IOS_PATH_ENV = "https://apps.apple.com/in/app/madfornails/id1481830012";
exports.WEBSITE_ENV = "https://madfornails.com";
