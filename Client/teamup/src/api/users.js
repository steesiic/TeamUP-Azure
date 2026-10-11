import { get, patch, del } from './http';

export async function getUserApi(id) {
  const res = await get(`/users/${id}`);
  return res.json();
}

export async function getUsersApi(search = {}) {
  const params = new URLSearchParams(search).toString();
  const res = await get(`/users${params ? `?${params}` : ''}`);
  return res.json();
}

export async function updateUserApi(id, dto) {
  await patch(`/users/${id}`, dto);
}

export async function deleteUserApi(id) {
  await del(`/users/${id}`);
}