import { API_URL } from './config';

export async function loginApi(email, password) {
  const res = await fetch(`${API_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (res.status === 401) throw new Error('Pogrešan email ili lozinka.');
  if (!res.ok)           throw new Error('Greška na serveru.');

  const data = await res.json();
  return data.token;
}

export async function registerApi(dto) {
  const res = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (res.status === 409) throw new Error('Korisnik sa tim emailom već postoji.');
  if (!res.ok)            throw new Error('Greška pri registraciji.');
}