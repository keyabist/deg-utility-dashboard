import type { StrapiApiRoot,  SimplifiedData,  SubstationWithUtility, TransformerWithSubstation, MeterWithTransformer, StrapiAuditTrail, SimplifiedAuditTrail } from "../types"

// San Francisco bounding box (approx)
const SF_LAT_MIN = 37.708;
const SF_LAT_MAX = 37.810;
const SF_LON_MIN = -122.515;
const SF_LON_MAX = -122.355;

function normalizeCoord(x: number, y: number, xMin: number, xMax: number, yMin: number, yMax: number) {
  // Normalize x, y in [xMin, xMax], [yMin, yMax] to SF lat/lon
  const lat = SF_LAT_MIN + ((y - yMin) / (yMax - yMin)) * (SF_LAT_MAX - SF_LAT_MIN);
  const lon = SF_LON_MIN + ((x - xMin) / (xMax - xMin)) * (SF_LON_MAX - SF_LON_MIN);
  return { lat, lon };
}

export const simplifyUtilData = (data: any): SimplifiedData => {
  const substations: SubstationWithUtility[] = [];
  const transformers: TransformerWithSubstation[] = [];
  const meters: MeterWithTransformer[] = [];

  if (!data || !data.results || !Array.isArray(data.results.bus_details)) {
    return { substations, transformers, meters };
  }

  // Find min/max for normalization
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  data.results.bus_details.forEach((bus: any) => {
    if (bus.Coordinates) {
      if (bus.Coordinates.X < xMin) xMin = bus.Coordinates.X;
      if (bus.Coordinates.X > xMax) xMax = bus.Coordinates.X;
      if (bus.Coordinates.Y < yMin) yMin = bus.Coordinates.Y;
      if (bus.Coordinates.Y > yMax) yMax = bus.Coordinates.Y;
    }
  });
  // Fallback if all coordinates are the same
  if (xMin === xMax) { xMin -= 1; xMax += 1; }
  if (yMin === yMax) { yMin -= 1; yMax += 1; }

  // Map transformers first (buses with non-empty Transformers array)
  data.results.bus_details.forEach((bus: any, idx: number) => {
    if (bus.Transformers && Array.isArray(bus.Transformers) && bus.Transformers.length > 0) {
      let lat = 0, lon = 0;
      if (bus.Coordinates) {
        const norm = normalizeCoord(bus.Coordinates.X, bus.Coordinates.Y, xMin, xMax, yMin, yMax);
        lat = norm.lat;
        lon = norm.lon;
      }
      transformers.push({
        id: idx, // or bus.Bus if unique
        name: bus.Transformers[0].name || bus.name || bus.Bus || `Transformer ${idx}`,
        city: "San Francisco",
        state: "California",
        latitude: lat.toString(),
        longtitude: lon.toString(),
        pincode: "",
        max_capacity_KW: bus.Transformers[0]?.rated_kVA || 0,
        status: bus.Transformers[0]?.status || "Normal",
        currentLoad: bus.Transformers[0]?.current_kVA || 0,
        margin: bus.Transformers[0]?.current_kVA * 100 / bus.Transformers[0]?.rated_kVA || 0, // Not available
        meters: [], // Will fill below
        emergencyService: false,
        // SubstationWithUtility fields
        utilityId: 0,
        utilityName: "",
        utilityCity: "",
        utilityState: "",
        utilityLatitude: "",
        utilityLongtitude: "",
        utilityPincode: "",
        transformers: [], // Required by SubstationWithUtility, but not used
      });
    }
  });

  // Map households (buses)
  data.results.bus_details.forEach((bus: any, idx: number) => {
    let lat = 0, lon = 0;
    if (bus.Coordinates) {
      const norm = normalizeCoord(bus.Coordinates.X, bus.Coordinates.Y, xMin, xMax, yMin, yMax);
      lat = norm.lat;
      lon = norm.lon;
    }
    let transformerBus = null;
    if (bus.Transformers && Array.isArray(bus.Transformers) && bus.Transformers.length > 0) {
      transformerBus = bus.name || bus.Bus || `Transformer ${idx}`;
    }
    meters.push({
      id: idx, // or bus.Bus if unique
      code: bus.name || bus.Bus || `Household ${idx}`,
      type: "household",
      max_capacity_KW: 0,
      city: "San Francisco",
      state: "California",
      latitude: lat,
      longitude: lon,
      pincode: "",
      consumptionLoadFactor: 0,
      productionLoadFactor: 0,
      ders: [], // Map from bus.Devices if needed
      // Custom field for mapping to transformer
      // @ts-ignore
      transformerBus,
    });
    if (transformerBus !== null) {
      const transformer = transformers.find(t => t.name === transformerBus);
      if (transformer) {
        transformer.meters.push(meters[meters.length - 1]);
      }
    }
  });

  return { substations, transformers, meters };
}

export const simplifyUtilDataForDashboard = (data: StrapiApiRoot) => {
  return data.utilities.flatMap((utility) =>
    utility.substations.flatMap((substation) => substation.transformers)
  )
}

export const simplifyAuditTrailData = (data: StrapiApiRoot): SimplifiedAuditTrail[] => {
  return data.orders.map((item) => ({
    id: item.id,
    name: item.name || "",
    meterId: item.meter_id,
    orderId: item.order.id,
    consumption: item.current_consumption_kwh,
    percent: Math.abs(item.consumption_change_percentage),
    up: item.consumption_change_percentage > 0 ? false : true,
    accepted: item.dfp_accepted,
    timestamp: item.created_at,
  }))
}