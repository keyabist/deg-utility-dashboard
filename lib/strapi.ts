import type { paths } from '@/types/openapi';

export const strapiClient = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const url = `${baseUrl}/get_node_data`;
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new Error('Failed to fetch node data');
  return response.json();
};