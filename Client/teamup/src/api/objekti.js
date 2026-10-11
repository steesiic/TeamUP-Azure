import { get, post, patch, del } from './http';

export async function getObjektiApi(search = {}) {
  const params = new URLSearchParams(search).toString();
  const res = await get(`/objekti${params ? `?${params}` : ''}`);
  return res.json();
}

export async function getObjekatApi(id) {
  const res = await get(`/objekti/${id}`);
  return res.json();
}

export async function createObjekatApi(dto) {
  const res = await post('/objekti', dto);
  return res.json();
}

export async function updateObjekatApi(id, dto) {
  await patch(`/objekti/${id}`, dto);
}

export async function deleteObjekatApi(id) {
  await del(`/objekti/${id}`);
}

export function mapObjekatZaKartu(objekat) {
  return {
    ...objekat,
    lokacija:  objekat.adresa,
    vlasnik:   `${objekat.vlasnikIme} ${objekat.vlasnikPrezime}`,
    amenities: objekat.sportovi ?? [],
    cena:      0,
    ocena:     '-',
    boja:      'color-default',
    badge:     objekat.sportovi?.[0] ?? '🏟',
    slikaUrl:  objekat.slikaUrl ?? null,
  };
}