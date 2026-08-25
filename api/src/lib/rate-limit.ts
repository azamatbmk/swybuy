const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((time) => now - time < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    const oldest = hits.keys().next().value;
    if (oldest) {
      hits.delete(oldest);
    }
  }
  return true;
}

export function clientIp(request: {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
}) {
  if (process.env.TRUST_PROXY === '1') {
    const forwarded = request.headers['x-forwarded-for'];
    const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const fromHeader = value?.split(',')[0]?.trim();
    if (fromHeader) {
      return fromHeader;
    }
  }
  return request.ip || request.socket?.remoteAddress || 'unknown';
}
