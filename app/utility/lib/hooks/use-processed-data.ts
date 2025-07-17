"use client";

import { useMemo } from "react";
import { useSimplifiedUtilDataStore } from "../stores/utility-store";
import type {
  AssetMarker,
  TransformerSummaryItem,
  StrapiMeter,
  StrapiSubstation,
  StrapiTransformer,
} from "../types";

// Helper to calculate status
const calculateStatus = (
  currentLoad: number,
  capacity: number
): "Critical" | "Warning" | "Normal" => {
  if (capacity === 0) return "Normal"; // Avoid division by zero
  const loadPercentage = (currentLoad / capacity) * 100;
  if (loadPercentage > 85) return "Critical";
  if (loadPercentage > 60) return "Warning";
  return "Normal";
};

export function useProcessedData() {
  const { data } = useSimplifiedUtilDataStore();
  const { transformers = [], meters = [] } = data || {};

  return useMemo(() => {
    if (!meters || meters.length === 0) {
      return {
        allAssets: [],
        systemMetrics: {
          der: { current: 0, peak: 0, total: 0 },
          load: { current: 0, peak: 0, total: 0 },
          mitigation: { current: 0, peak: 0, total: 0 },
        },
        transformerSummaries: [],
      };
    }

    const allAssets: AssetMarker[] = [];

    // Transformers
    const transformerSummaries: TransformerSummaryItem[] = [];
    transformers.forEach((tr: StrapiTransformer) => {
      // Use normalized latitude/longitude and city/state from simplifyUtilData
      const lat = typeof tr.latitude === 'string' ? parseFloat(tr.latitude) : tr.latitude;
      const lon = typeof tr.longtitude === 'string' ? parseFloat(tr.longtitude) : tr.longtitude;
      if (!isNaN(lat) && !isNaN(lon)) {
        allAssets.push({
          id: `trans_${tr.id}`,
          name: tr.name,
          type: "transformer",
          coordinates: [lat, lon],
          status: tr.status || "Normal",
          emergencyService: tr.emergencyService || false,
        });
      }
      transformerSummaries.push({
        id: tr.id.toString(),
        name: tr.name,
        substationName: "", // No substations
        city: [tr.city, tr.state].filter(Boolean).join(", "),
        currentLoad: tr.currentLoad || 0,
        status: tr.status || "Normal",
        metersCount: tr.meters ? tr.meters.length : 0,
        maxCapacity: tr.max_capacity_KW,
        margin: tr.margin || 0,
        emergencyService: tr.emergencyService || false,
      });
    });

    // Households (Meters)
    meters.forEach((meter: any) => {
      // Use normalized latitude/longitude from simplifyUtilData
      const lat = typeof meter.latitude === 'string' ? parseFloat(meter.latitude) : meter.latitude;
      const lon = typeof meter.longitude === 'string' ? parseFloat(meter.longitude) : meter.longitude;
      if (!isNaN(lat) && !isNaN(lon)) {
        allAssets.push({
          id: `house_${meter.id}`,
          name: meter.code,
          type: "household",
          coordinates: [lat, lon],
          status: "Normal",
          hasDers: meter.ders && meter.ders.length > 0,
        });
      }
    });

    // --- Calculate System Metrics (optional, can be improved) ---
    const systemMetrics = {
      der: { current: 0, peak: 0, total: 0 },
      load: { current: 0, peak: 0, total: 0 },
      mitigation: { current: 0, peak: 0, total: 0 },
    };

    return {
      allAssets,
      systemMetrics,
      transformerSummaries,
    };
  }, [transformers, meters]);
}
