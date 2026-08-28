/**
 * Central place for the Academy's real-world contact details.
 * PHONE_NUMBER/CONTACT_EMAIL confirmed real by the IGO Academy team on
 * 25-26 Aug 2026 (see constants/brand.js's IGO_CONTACT for the full set,
 * including the secondary phone/email also confirmed then).
 * TODO: replace WHATSAPP_NUMBER with the Academy's real WhatsApp number
 * once provided, then redeploy — no other code needs to change.
 */
export const WHATSAPP_NUMBER = '919876543210'; // placeholder — country code + number, no + or spaces
export const PHONE_NUMBER = '+91 89258 93318'; // confirmed real
export const CONTACT_EMAIL = 'info@igoacademy.in';

export function whatsAppLink(message = "Hi, I'd like to know more about IGO Academy courses.") {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
