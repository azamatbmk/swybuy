import { slugify } from './slugify';

export function parseSocialHandle(raw: string) {
  let value = raw.trim();
  value = value.replace(/^@/, '');
  value = value.replace(/^https?:\/\//i, '');
  value = value.replace(
    /^(www\.)?(instagram\.com|t\.me|tiktok\.com|vm\.tiktok\.com)\//i,
    '',
  );
  value = value.split(/[/?#]/)[0] || '';
  value = value.replace(/^@/, '').trim();

  const latin = value
    .toLowerCase()
    .replace(/[^a-z0-9._]+/g, '')
    .slice(0, 40);
  const slug = latin || slugify(value).slice(0, 40);

  return {
    handle: value.replace(/^@/, '').slice(0, 40),
    slug,
    name: value ? `@${value.replace(/^@/, '')}` : '',
  };
}
