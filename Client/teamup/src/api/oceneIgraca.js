import { get, post, patch } from './http';

export async function getOceneIgracaApi(ocenjeniId) {
  const res = await get(`/ocene-igraca?ocenjeniId=${ocenjeniId}`);
  return res.json();
}

export async function createOcenaIgracaApi(dto) {
  await post('/ocene-igraca', dto);
}

export async function updateOcenaIgracaApi(id, dto) {
  await patch(`/ocene-igraca/${id}`, dto);
}