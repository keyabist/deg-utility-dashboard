import { create } from 'zustand';
import type { SimplifiedItem } from './convetor';
import { simplifyData } from './convetor';
import { strapiClient } from './strapi';
import { simplifyUtilData } from './utility';

type SimplifiedDataState = {
    data: SimplifiedItem[];
    setData: (data: SimplifiedItem[]) => void;
    clear: () => void;
    fetchAndStore: () => Promise<void>;
    selectedHouse: SimplifiedItem | null;
    setSelectedHouse: (house: SimplifiedItem | null) => void;
};

export const useSimplifiedData = create<SimplifiedDataState>((set) => ({
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