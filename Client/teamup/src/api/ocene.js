import { get, post, patch, del } from './http';

export async function getOceneApi(objekatId) {
  const res = await get(`/ocene?objekatId=${objekatId}`);
  return res.json();
}

export async function createOcenaApi(dto) {
  await post('/ocene', dto);
}

export async function updateOcenaApi(id, dto) {
  await patch(`/ocene/${id}`, dto);
}

export async function deleteOcenaApi(id) {
  await del(`/ocene/${id}`);
}