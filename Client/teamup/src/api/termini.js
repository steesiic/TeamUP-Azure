import { get, post, patch, del } from './http';

export async function getTerminiApi(search = {}) {
  const params = new URLSearchParams(search).toString();
  const res = await get(`/termini${params ? `?${params}` : ''}`);
  return res.json();
}

export async function getTerminApi(id) {
  const res = await get(`/termini/${id}`);
  return res.json();
}

export async function createTerminApi(dto) {
  await post('/termini', dto);
}

export async function deleteTerminApi(id) {
  await del(`/termini/${id}`);
}

export function buildVremeOdDo(vremeOd, sati) {
  const [h, m] = vremeOd.split(':').map(Number);
  const odMin  = h * 60 + m;
  const doMin  = odMin + sati * 60;
  const doH    = Math.floor(doMin / 60).toString().padStart(2, '0');
  const doM    = (doMin % 60).toString().padStart(2, '0');
  return {
    vremeOd: `${vremeOd}:00`,
    vremeDo: `${doH}:${doM}:00`,
  };
}

  export async function updateTerminApi(id, dto) {
  await patch(`/termini/${id}`, dto);
}