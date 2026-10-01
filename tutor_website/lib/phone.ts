// Turns what a person typed into digits only, with the country code, which is
// the format WhatsApp links need (e.g. "96170123456"). Lebanon (961) is
// assumed when no country code is given. Returns null if it can't be a phone
// number. The database applies the same final check (8-15 digits).
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = "961" + digits.slice(1);
  } else if (digits.length <= 8) {
    digits = "961" + digits;
  }

  return /^[0-9]{8,15}$/.test(digits) ? digits : null;
}
