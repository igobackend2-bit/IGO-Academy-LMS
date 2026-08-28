/**
 * SMS delivery — APITxT (apitxt.com), pay-as-you-go OTP SMS for India.
 *
 * APITxT is a pure delivery channel: WE generate the OTP (same
 * generateOtp() already used for the email flow) and just ask them to
 * text it to a number — there's no separate "verify" call on their side,
 * verification is a local comparison against what we stored, exactly
 * like the existing email-OTP flow. This keeps phone and email OTP on
 * the same mechanism, just a different delivery channel.
 * @module services/sms
 */
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * @param {{ mobile: string, otp: string }} opts - mobile in apitxt's bare
 *   '91XXXXXXXXXX' form (utils/phone.util.js's toApiFormat)
 */
async function sendOtpSms({ mobile, otp }) {
  const authkey = process.env.APITXT_API_KEY;
  if (!authkey) {
    throw new Error('APITXT_API_KEY is not configured');
  }

  const { data } = await axios.post(
    'https://apitxt.com/api/sendOTP',
    new URLSearchParams({ authkey, mobile, otp }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 }
  );

  if (data?.status !== 'success') {
    throw new Error(data?.message || 'SMS provider did not confirm delivery');
  }

  logger.info(`[SMS] OTP sent to ${mobile} (request_id: ${data.data?.request_id})`);
  return data;
}

module.exports = { sendOtpSms };
