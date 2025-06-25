import { Menu, X, User, FileText, Sliders, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { ProfilePanel } from "./profile-panel";
import { AuditLogsPanel } from "./audit-logs-panel";
import { ControlsPanel } from "./controls-panel";

interface DashboardHeaderProps {
  onSelectPanel: (panel: "profile" | "audit" | "controls") => void;
  activePanel: "profile" | "audit" | "controls";
}

export function DashboardHeader({
  onSelectPanel,
  activePanel,
}: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openModal, setOpenModal] = useState<
    null | "profile" | "audit" | "controls"
  >(null);

  return (
    <>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40  bg-opacity-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Modal Overlay */}
      {openModal && (
        <div
          className="fixed inset-0 z-50  bg-opacity-40 transition-opacity"
          onClick={() => setOpenModal(null)}
        />
      )}
      {/* Sidebar Drawer */}
      <aside
        className={`absolute top-0 left-0 z-50 border-r border-border transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          display: 'flex',
          width: '250px',
          height: '100%',
          padding: '20px 0 20px 0',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '10px',
          borderTopLeftRadius: '16px',
          borderBottomLeftRadius: '16px',
          background: '#1E293B',
          boxShadow: '2px 0 12px 0 rgba(30,41,59,0.15)',
          backdropFilter: 'blur(10px)',
          transitionProperty: 'transform',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full mb-2" style={{height: '40px', borderBottom: '1px solid #273352', marginBottom: '16px', paddingRight: '16px', paddingLeft: '10px'}}>
          <span className="text-lg font-bold text-white">Menu</span>
          <button
            onClick={() => {
              setOpenModal(null);
              setSidebarOpen(false);
            }}
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6 text-white cursor-pointer" />
          </button>
        </div>
        <nav className="flex flex-col gap-4 w-full mt-2">
          <button
            className={`flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[#273352] transition-colors text-white font-medium w-full justify-between cursor-pointer ${
              activePanel === "profile" ? "bg-[#232e47]" : ""
            }`}
            style={{paddingLeft: '8px'}}
            onClick={() => {
              setOpenModal("profile");
            }}
          >
            <span className="flex items-center gap-3">
              <User className="w-5 h-5 text-white" /> Profile
            </span>
            <ChevronRight className="w-4 h-4 text-white" style={{marginRight: '4px'}} />
          </button>
          <button
            className={`flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[#273352] transition-colors text-white font-medium w-full justify-between cursor-pointer ${
              activePanel === "audit" ? "bg-[#232e47]" : ""
            }`}
            style={{paddingLeft: '8px'}}
            onClick={() => {
              setOpenModal("audit");
            }}
          >
            <span className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-white" /> Audit Logs
            </span>
            <ChevronRight className="w-4 h-4 text-white" style={{marginRight: '4px'}} />
          </button>
          <button
            className={`flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[#273352] transition-colors text-white font-medium w-full justify-between cursor-pointer ${
              activePanel === "controls" ? "bg-[#232e47]" : ""
            }`}
            style={{paddingLeft: '8px'}}
            onClick={() => {
              setOpenModal("controls");
            }}
          >
            <span className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-white" /> Controls
            </span>
            <ChevronRight className="w-4 h-4 text-white" style={{marginRight: '4px'}} />
          </button>
        </nav>
      </aside>
      {/* Side Modal */}
      {openModal && (
        <aside
          className="fixed top-0 h-full min-w-[400px] max-w-full bg-card border-r border-border shadow-lg transform transition-transform duration-200 z-[60]"
          style={{
            left: '250px',
            minWidth: '400px',
            maxWidth: '100vw',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            transitionProperty: 'transform',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 overflow-y-auto h-[calc(100%-4rem)]">
            {openModal === "profile" && <ProfilePanel />}
            {openModal === "audit" && <AuditLogsPanel />}
            {openModal === "controls" && <ControlsPanel />}
          </div>
        </aside>
      )}
      <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border shadow-sm">
        {/* Hamburger Menu */}
        <button
          className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer mr-4"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6 text-primary" />
          </button>
          <span className="text-xl font-semibold tracking-tight text-primary">
            Utility Administration Portal
          </span>
        <div className="flex items-center gap-4">
          {/* Avatar or user icon can go here */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span role="img" aria-label="avatar">
              👤
            </span>
          </div>
        </div>
      </header>
    </>
  );
}
