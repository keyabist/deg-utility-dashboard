import createClient from "openapi-react-query";
import { strapiClient } from "./strapi";
import { useEffect, useState } from "react";

export const api = createClient(strapiClient);

export async function fetchNodeData() {
  return await strapiClient();
}
