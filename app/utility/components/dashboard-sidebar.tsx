import { useEffect, useState, useRef } from "react";
import type {
  TransformerSummaryItem,
  SimplifiedAuditTrail,
} from "../lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "./status-badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@/components/ui/tabs";
import { useSimplifiedUtilDataStore } from "../lib/stores/utility-store";

interface DashboardSidebarProps {
  transformerSummaries: TransformerSummaryItem[];
  // auditTrail: SimplifiedAuditTrail[]; // Removed as per edit hint
  // fetchAuditTrails: (loader?: boolean) => Promise<void>; // Removed as per edit hint
}

export function DashboardSidebar({
  transformerSummaries,
  // auditTrail, // Removed as per edit hint
  // fetchAuditTrails, // Removed as per edit hint
}: DashboardSidebarProps) {
  const [tab, setTab] = useState<'feeder'>('feeder');
  const { isLoading: isFeederSummaryLoading, fetchAndStore } = useSimplifiedUtilDataStore();

  // Cache the last non-empty transformerSummaries
  const [cachedSummaries, setCachedSummaries] = useState<TransformerSummaryItem[]>([]);
  useEffect(() => {
    if (transformerSummaries && transformerSummaries.length > 0) {
      setCachedSummaries(transformerSummaries);
    }
  }, [transformerSummaries]);

  // Poll for updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAndStore(); // Update transformer summaries and other data
      // fetchAuditTrails(); // Update audit trails // Removed as per edit hint
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchAndStore]); // Removed fetchAuditTrails from dependency array

  // Use cached data if loading
  const displaySummaries = isFeederSummaryLoading ? cachedSummaries : transformerSummaries;

  return (
    <aside className="w-full h-full flex flex-col bg-card p-0 rounded-lg border border-border shadow-lg">
      {/* Sticky Tabs */}
      <div className="sticky top-0 z-10 bg-card rounded-t-lg px-4 pt-3 pb-2">
        <div className="flex gap-2">
          <Tabs
            defaultValue="Transformers"
            value={tab}
            onValueChange={() => {}}
            className="w-full"
          >
            <TabsList className="flex flex-row justify-between w-full bg-[#232e47] rounded-lg shadow border border-[#232e47]">
              <TabsTrigger
                value="feeder"
                className="custom-tab font-semibold rounded text-white transition-colors cursor-pointer"
              >
                Feeder Summary
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ScrollArea className="flex-1 min-h-0 px-3 pb-3">
          <div className="space-y-3 mt-2">
            {displaySummaries.length > 0 ? (
              displaySummaries.map((item) => (
                <div key={item.id}>
                  <div className="pt-3 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className="font-semibold text-foreground text-base truncate"
                        title={item.name}
                      >
                        {item.name.length > 22
                          ? `${item.name.slice(0, 22)}...`
                          : item.name}
                      </h3>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                      <span>Region: {item.city}</span>
                      <span>Margin: {item.margin}%</span>
                    </div>
                    <div className="w-full h-2 rounded bg-white dark:bg-white mb-1">
                      <div
                        className={`h-2 rounded ${
                          item.status === "Critical" || item.status === "Overloaded"
                            ? "bg-red-500"
                            : item.status === "Warning"
                            ? "bg-yellow-400"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${((item.currentLoad / item.maxCapacity) * 100).toFixed(2)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{((item.currentLoad / item.maxCapacity) * 100).toFixed(2)}%</span>
                      <span>{item.maxCapacity} kW</span>
                    </div>
                  </div>
                  <div className="border-t-2 border-border mt-2"></div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-sm text-center py-10">
                No transformer data available.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
