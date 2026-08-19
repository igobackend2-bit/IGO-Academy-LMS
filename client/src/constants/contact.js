/**
 * Central place for the Academy's real-world contact details.
 * TODO: replace WHATSAPP_NUMBER and PHONE_NUMBER with the Academy's real
 * numbers once provided, then redeploy — no other code needs to change.
 */
export const WHATSAPP_NUMBER = '919876543210'; // placeholder — country code + number, no + or spaces
export const PHONE_NUMBER = '+91 98765 43210'; // placeholder — display format
export const CONTACT_EMAIL = 'info@igoacademy.in';

export function whatsAppLink(message = "Hi, I'd like to know more about IGO Academy courses.") {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
