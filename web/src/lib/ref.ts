export const REF_COOKIE = 'swybuy_ref';
export const REF_DAYS = 30;

export function readRefFromDocument() {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${REF_COOKIE}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}
