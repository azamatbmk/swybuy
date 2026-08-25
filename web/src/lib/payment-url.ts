export function isSafePaymentUrl(url: string) {
  if (url.startsWith('/pay/mock/')) {
    return true;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'yookassa.ru' ||
      host.endsWith('.yookassa.ru') ||
      host === 'yoomoney.ru' ||
      host.endsWith('.yoomoney.ru')
    );
  } catch {
    return false;
  }
}
