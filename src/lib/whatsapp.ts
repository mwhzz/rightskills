export function bdMobile(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let phone = digits;
  if (phone.startsWith("880")) phone = phone.slice(3);
  if (phone.length === 10 && phone.startsWith("1")) phone = `0${phone}`;
  if (/^01[3-9]\d{8}$/.test(phone)) return phone;
  return null;
}

export function whatsappChatUrl(phone: string, text: string): string | null {
  const local = bdMobile(phone);
  if (!local) return null;
  return `https://wa.me/88${local}?text=${encodeURIComponent(text)}`;
}
