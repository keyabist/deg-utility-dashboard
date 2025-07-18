"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { strapiClient } from "../api/strapi-client";
import {
  simplifyAuditTrailData,
  simplifyUtilData,
  simplifyUtilDataForDashboard,
} from "../utils/data-processor";
import type {
  SimplifiedData,
  MeterWithTransformer,
  StrapiTransformer,
  TransformerWithSubstation,
  StrapiAuditTrail,
  SimplifiedAuditTrail,
} from "../types";

type SimplifiedDataState = {
  data: SimplifiedData;
  transformerData: StrapiTransformer[];
  setData: (data: SimplifiedData) => void;
  clear: () => void;
  fetchAndStore: (
    cityBounds?: { latMin: number, latMax: number, lonMin: number, lonMax: number },
    cityName?: string,
    stateName?: string
  ) => Promise<void>;
  selectedHouse: MeterWithTransformer | null;
  setSelectedHouse: (house: MeterWithTransformer | null) => void;
  isLoading: boolean;
  updateDerSettings: (
    meterId: number,
    newDersSettings: Array<{ id: number; isEnabled: boolean }>
  ) => void;
  fetchAndStoreTransformerData: (transformerId: number) => Promise<void>;
  startStream: (transformerId: number) => Promise<void>;
  citySelection: {
    cityBounds: { latMin: number, latMax: number, lonMin: number, lonMax: number } | null;
    cityName: string;
    stateName: string;
  } | null;
  setCitySelection: (selection: { cityBounds: { latMin: number, latMax: number, lonMin: number, lonMax: number }, cityName: string, stateName: string }) => void;
  clearCitySelection: () => void;
};

export const useSimplifiedUtilDataStore = create(
  persist(
    (set, get) => ({
      data: {
        substations: [],
        transformers: [],
        meters: [],
        auditTrail: [],
      },
      selectedHouse: null,
      isLoading: false,
      transformerData: [],
      citySelection: null,
      setCitySelection: (selection: { cityBounds: { latMin: number, latMax: number, lonMin: number, lonMax: number }, cityName: string, stateName: string }) => set({ citySelection: selection }),
      clearCitySelection: () => set({ citySelection: null }),
      setSelectedHouse: (house: MeterWithTransformer | null) => set({ selectedHouse: house }),

      setData: (data: SimplifiedData) => set({ data }),

      clear: () =>
        set({ data: { substations: [], transformers: [], meters: [] } }),

      fetchAndStore: async (
        cityBounds?: { latMin: number, latMax: number, lonMin: number, lonMax: number },
        cityName?: string,
        stateName?: string
      ) => {
        set({ isLoading: true });
        // Use citySelection from store if arguments are not provided
        const selection = get().citySelection;
        const bounds = cityBounds || (selection?.cityBounds ? selection.cityBounds : undefined);
        const city = cityName || selection?.cityName;
        const state = stateName || selection?.stateName;
        const { data, error } = await strapiClient.GET();
        if (error) {
          set({ data: { substations: [], transformers: [], meters: [] }, isLoading: false });
          return;
        }
        if (data) {
          const simplified = simplifyUtilData(data, bounds, city, state);
          set({ data: simplified, isLoading: false });
        } else {
          set({ data: { substations: [], transformers: [], meters: [] }, isLoading: false });
        }
      },

      fetchAndStoreTransformerData: async (transformerId: number) => {
        try {
          get().startStream(transformerId);
        } catch (error) {
          console.error("Error fetching transformer data:", error);
        }
      },

      startStream: async (transformerId: number) => {
        set({ isLoading: true });
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
        const url = `${baseUrl}/meter-data-simulator/transformer-load-streamed/${transformerId}`;

        const connect = async () => {
          try {
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Connection': 'keep-alive'
              }
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
              throw new Error("ReadableStream not supported");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            const readChunk = async () => {
              try {
                const { done, value } = await reader.read();

                if (done) {
                  console.log("Stream complete.");
                  return;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  if (line.trim()) {
                    try {
                      const parsedArr = JSON.parse(line);
                      const newObj = Array.isArray(parsedArr)
                        ? parsedArr[0]
                        : parsedArr;
                      const newTransformerData = {
                        id: newObj.transformer.id,
                        name: newObj.transformer.name,
                        city: newObj.transformer.city,
                        state: newObj.transformer.state,
                        latitude: newObj.transformer.latitude,
                        longtitude: newObj.transformer.longtitude,
                        pincode: newObj.transformer.pincode,
                        max_capacity_KW: newObj.transformer.max_capacity_KW,
                        status: newObj.health_status,
                        currentLoad: newObj.load_percentage,
                        margin: newObj.margin_percentage,
                        emergencyService: newObj?.transformer?.emergency_service || false,
                      } as TransformerWithSubstation;

                      set((state: SimplifiedDataState) => {
                        const transformers = [...state.data.transformers];
                        const index = transformers.findIndex((t: StrapiTransformer) => t.id === newTransformerData.id);
                        if (index !== -1) {
                          transformers[index] = newTransformerData;
                        } else {
                          transformers.push(newTransformerData);
                        }
                        return {
                          data: {
                            ...state.data,
                            transformers,
                          },
                        };
                      });
                    } catch (e) {
                      console.warn("Error parsing line:", e);
                    }
                  }
                }
                return readChunk();
              } catch (error: any) {
                if (error.name === "AbortError") {
                  console.log("Stream aborted");
                  return;
                }
                console.error("Error reading chunk:", error);
                connect();
                throw error;
              }
            };

            return readChunk();
          } catch (err) {
            console.error("Connection error");
            connect();
          } finally {
            set({ isLoading: false });
          }
        };

        // Start the connection
        connect();
      },

      updateDerSettings: (meterId: number, newDersSettings: Array<{ id: number; isEnabled: boolean }>) => {
        set((state: SimplifiedDataState) => {
          const updatedData = state.data.meters.map((meter: MeterWithTransformer) => {
            if (meter.id === meterId) {
              const updatedDers = meter.ders.map((der: any) => {
                const setting = newDersSettings.find((s) => s.id === der.id);
                return setting ? { ...der, switched_on: setting.isEnabled } : der;
              });
              return { ...meter, ders: updatedDers };
            }
            return meter;
          });
          return {
            data: {
              substations: state.data.substations,
              transformers: state.data.transformers,
              meters: updatedData,
            },
          };
        });
      },
    }),
    {
      name: "utility-store",
      partialize: (state: any) => ({ citySelection: state.citySelection }),
    }
  )
);
