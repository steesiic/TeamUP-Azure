import { API_URL } from './config';

function getToken() {
  return localStorage.getItem('token');
}

export async function http(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 400) {
  const body = await res.json().catch(() => ({}));
  let msg = body.error ?? body.message;
  if (!msg && body.errors) {
    const prviKljuc = Object.keys(body.errors)[0];
    msg = body.errors[prviKljuc]?.[0];
  }
  throw new Error(msg ?? 'Neispravni podaci.');
}

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/';
    throw new Error('Sesija je istekla.');
  }

  if (res.status === 403)  throw new Error('Nemate dozvolu za ovu akciju.');
  if (res.status === 404)  throw new Error('Nije pronađeno.');



  if (res.status === 409) {
  const body = await res.json().catch(() => ({}));
  throw new Error(body.error ?? body.message ?? 'Konflikt podataka.');
}

if (res.status === 500) {
  const body = await res.json().catch(() => ({}));
  throw new Error(body.error ?? body.message ?? 'Greška na serveru.');
}

  return res;
}

export const get  = (path)        => http(path, { method: 'GET' });
export const post = (path, body)  => http(path, { method: 'POST',  body: JSON.stringify(body) });
export const patch = (path, body) => http(path, { method: 'PATCH', body: JSON.stringify(body) });
export const del  = (path)        => http(path, { method: 'DELETE' });