import { get } from './http';

export async function getSportoviApi() {
  const res = await get('/sportovi');
  return res.json();
}