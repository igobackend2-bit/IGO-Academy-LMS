/**
 * Phone number normalization — India-only (+91) for now, matching the
 * Academy's audience and the existing MSG91/TN-focused setup.
 *
 * Existing stored phone numbers are inconsistent (some '9876543210', some
 * '+919876543210') from before this was a lookup key. New writes always
 * normalize to E.164; lookups try both forms so old rows keep matching.
 * @module utils/phone
 */

/** Strip everything but digits, then drop a leading '91' from an
 *  already-11/12-digit number so we're left with the bare 10-digit form. */
function bareDigits(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

/** E.164 form ('+91XXXXXXXXXX') — used where a strict E.164 shape is needed. */
function toE164(input) {
  const bare = bareDigits(input);
  return bare.length === 10 ? `+91${bare}` : null;
}

/** APITxT's expected form for the `mobile` param: '91XXXXXXXXXX', no '+'. */
function toApiFormat(input) {
  const bare = bareDigits(input);
  return bare.length === 10 ? `91${bare}` : null;
}

/** Every form an existing DB row might have this number stored as. */
function lookupVariants(input) {
  const bare = bareDigits(input);
  if (bare.length !== 10) return [String(input || '').trim()];
  return [bare, `91${bare}`, `+91${bare}`];
}

module.exports = { bareDigits, toE164, toApiFormat, lookupVariants };
