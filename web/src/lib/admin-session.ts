const STORAGE_KEY = 'swybuy_admin_key';

export function readAdminKey() {
  if (typeof window === 'undefined') {
    return '';
  }
  return sessionStorage.getItem(STORAGE_KEY) || '';
}

export function writeAdminKey(key: string) {
  sessionStorage.setItem(STORAGE_KEY, key);
}

export function clearAdminKey() {
  sessionStorage.removeItem(STORAGE_KEY);
}
