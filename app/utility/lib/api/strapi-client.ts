import type { StrapiApiRoot } from "../types"

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export const strapiClient = {
  GET: async () => {
    const url = `${STRAPI_BASE_URL}/get_node_data`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      });
      if (!response.ok) {
        const errorBody = await response.text();
        return {
          data: null,
          error: {
            status: response.status,
            message: `Failed to fetch: ${response.statusText}. Body: ${errorBody}`,
          },
        };
      }
      const responseData = await response.json();
      return { data: responseData, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || "Network error" } };
    }
  },
};
