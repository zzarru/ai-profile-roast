'use client';

export interface SessionData {
  personaName: string;
  personaDescription: string;
  personaViewpoint: string;
  imageBase64: string;
  imageMediaType: string;
}

export function saveSession(data: Partial<SessionData>) {
  const existing = getSession();
  sessionStorage.setItem('roast_session', JSON.stringify({ ...existing, ...data }));
}

export function getSession(): Partial<SessionData> {
  if (typeof window === 'undefined') return {};
  const raw = sessionStorage.getItem('roast_session');
  return raw ? JSON.parse(raw) : {};
}

export function clearSession() {
  sessionStorage.removeItem('roast_session');
}
