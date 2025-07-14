import { create } from 'zustand';
import { strapiClient } from './strapi';
import { type SimplifiedMeter, simplifyUtilData } from './utility';

type SimplifiedDataState = {
    data: SimplifiedMeter[];
    setData: (data: SimplifiedMeter[]) => void;
    clear: () => void;
    fetchAndStore: () => Promise<void>;
    selectedHouse: SimplifiedMeter | null;
    setSelectedHouse: (house: SimplifiedMeter | null) => void;
};

export const useSimplifiedUtilData = create<SimplifiedDataState>((set) => ({
    data: [],

    selectedHouse: null,
    setSelectedHouse: (house) => set({ selectedHouse: house }),
    
    setData: (data) => set({ data }),
    clear: () => set({ data: [] }),
    fetchAndStore: async () => {
        const { data, error } = await strapiClient.GET();
        if (error) {
            set({ data: [] });
            return;
        }
        if (data && data.results && data.results.bus_details) {
            // We'll map this in the next step
            set({ data: data.results.bus_details });
        }
    }
}));