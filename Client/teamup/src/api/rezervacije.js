import { get, post, patch, del } from './http';

export async function getRezervacijeApi(search = {}) {
  const params = new URLSearchParams(search).toString();
  const res = await get(`/rezervacije${params ? `?${params}` : ''}`);
  return res.json();
}

export async function getRezervacijaApi(id) {
  const res = await get(`/rezervacije/${id}`);
  return res.json();
}

export async function createRezervacijaApi(dto) {
  await post('/rezervacije', dto);
}

export async function joinTerminApi(rezervacijaId, igracId) {
  await post(`/rezervacije/${rezervacijaId}/join?igracId=${igracId}`);
}

export async function leaveTerminApi(rezervacijaId, igracId) {
  await del(`/rezervacije/${rezervacijaId}/leave?igracId=${igracId}`);
}

export async function updateIgracStatusApi(rezervacijaId, igracId, status) {
  await patch(`/rezervacije/${rezervacijaId}/igraci/${igracId}`, status);
}

export async function otkaziRezervacijuApi(id) {
  await del(`/rezervacije/${id}`);
}