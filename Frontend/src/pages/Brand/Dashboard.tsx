import React, { useState } from "react";
import { Menu, Settings, Search, Plus, Home, BarChart3, MessageSquare, FileText, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserNav } from "../../components/user-nav";

const PRIMARY = "#0B00CF";
const SECONDARY = "#300A6E";
const ACCENT = "#FF2D2B";

const TABS = [
  { label: "Discover", route: "/brand/dashboard", icon: Home },
  { label: "Contracts", route: "/brand/contracts", icon: FileText },
  { label: "Messages", route: "/brand/messages", icon: MessageSquare },
  { label: "Tracking", route: "/brand/tracking", icon: BarChart3 },
  ];

export default function BrandDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        display: "flex",
        color: "#ffffff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Left Sidebar */}
      <div style={{
        width: sidebarCollapsed ? "80px" : "280px",
        background: "rgba(26, 26, 26, 0.8)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(42, 42, 42, 0.6)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        transition: "width 0.3s ease",
        position: "relative",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarCollapsed ? "0 16px 32px 16px" : "0 24px 32px 24px",
          borderBottom: "1px solid rgba(42, 42, 42, 0.6)",
          marginBottom: "24px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              background: PRIMARY,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "16px" }}>I</span>
            </div>
            {!sidebarCollapsed && (
              <span style={{ 
                fontSize: "16px", 
                fontWeight: 600, 
                color: "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}>
                INPACT AI<br />
                <span style={{ fontSize: "12px", color: "#a0a0a0", fontWeight: 400 }}>
                  for BRANDS
                </span>
                </span>
            )}
          </div>
          </div>

        {/* New Button */}
        <div style={{ padding: sidebarCollapsed ? "0 16px 24px 16px" : "0 24px 24px 24px" }}>
          <button style={{
            width: "100%",
            background: PRIMARY,
            border: "none",
            borderRadius: "12px",
            padding: sidebarCollapsed ? "12px" : "12px 16px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "center",
            gap: "8px",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#0a00b3"}
          onMouseLeave={(e) => e.currentTarget.style.background = PRIMARY}
          >
            <Plus size={16} />
            {!sidebarCollapsed && "New Campaign"}
          </button>
          </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: "0 12px" }}>
          {TABS.map((tab) => {
            const isActive = location.pathname === tab.route;
            const Icon = tab.icon;
            return (
              <button
                key={tab.route}
                onClick={() => navigate(tab.route)}
                style={{
                  width: "100%",
                  background: isActive ? "rgba(42, 42, 42, 0.8)" : "transparent",
                  border: "none",
                  borderRadius: "8px",
                  padding: sidebarCollapsed ? "12px" : "12px 16px",
                  color: isActive ? "#fff" : "#a0a0a0",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  gap: "12px",
                  marginBottom: "4px",
                  transition: "all 0.2s ease",
                  textAlign: sidebarCollapsed ? "center" : "left",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(42, 42, 42, 0.8)";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#a0a0a0";
                  }
                }}
              >
                <Icon size={18} />
                {!sidebarCollapsed && tab.label}
              </button>
            );
          })}
              </div>

        {/* Bottom Section - Profile and Settings */}
        <div style={{
          padding: sidebarCollapsed ? "24px 16px" : "24px",
          borderTop: "1px solid rgba(42, 42, 42, 0.6)",
        }}>
          {/* Profile */}
          <button
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              padding: sidebarCollapsed ? "12px" : "12px 16px",
              color: "#a0a0a0",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              gap: "12px",
              marginBottom: "4px",
              transition: "all 0.2s ease",
              textAlign: sidebarCollapsed ? "center" : "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(42, 42, 42, 0.8)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#a0a0a0";
            }}
          >
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: PRIMARY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <User size={14} color="#fff" />
                </div>
            {!sidebarCollapsed && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>John Doe</span>
                <span style={{ fontSize: "12px", color: "#808080" }}>john@example.com</span>
              </div>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate("/brand/settings")}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              padding: sidebarCollapsed ? "12px" : "12px 16px",
              color: "#a0a0a0",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              gap: "12px",
              marginBottom: "4px",
              transition: "all 0.2s ease",
              textAlign: sidebarCollapsed ? "center" : "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(42, 42, 42, 0.8)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#a0a0a0";
            }}
          >
            <Settings size={18} />
            {!sidebarCollapsed && "Settings"}
          </button>
              </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            position: "absolute",
            right: "-12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(26, 26, 26, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(42, 42, 42, 0.6)",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#a0a0a0",
            transition: "all 0.2s ease",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(42, 42, 42, 0.9)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(26, 26, 26, 0.9)";
            e.currentTarget.style.color = "#a0a0a0";
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div style={{
          height: "64px",
          background: "#0f0f0f",
          borderBottom: "1px solid #2a2a2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ 
            fontSize: "24px", 
            fontWeight: 600, 
            color: "#fff",
            transition: "all 0.3s ease",
            transform: sidebarCollapsed ? "translateX(-100px)" : "translateX(0)",
            opacity: sidebarCollapsed ? 0 : 1,
          }}>
            INPACT Brands
                          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Settings button removed from top bar since it's now in sidebar */}
                        </div>
                      </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          padding: "48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* INPACT AI Title with animated gradient */}
          <h1 style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "48px",
            letterSpacing: "-0.02em",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span>INPACT</span>
            <span style={{
              background: "linear-gradient(90deg, #87CEEB 0%, #1E90FF 50%, #000080 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientFlow 3s ease-in-out infinite",
            }}>
              AI
                        </span>
          </h1>

          {/* Main Search */}
          <div style={{
            width: "100%",
            maxWidth: "600px",
            marginBottom: "48px",
          }}>
            <div style={{
              background: "rgba(26, 26, 26, 0.6)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "50px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
              position: "relative",
              overflow: "hidden",
              width: "100%",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#87CEEB";
              e.currentTarget.style.background = "rgba(26, 26, 26, 0.8)";
              e.currentTarget.style.backdropFilter = "blur(10px)";
              e.currentTarget.style.padding = "12px 16px";
              e.currentTarget.style.gap = "8px";
              e.currentTarget.style.width = "110%";
              e.currentTarget.style.transform = "translateX(-5%)";
              // Remove glass texture
              const overlay = e.currentTarget.querySelector('[data-glass-overlay]');
              if (overlay) overlay.style.opacity = "0";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.background = "rgba(26, 26, 26, 0.6)";
              e.currentTarget.style.backdropFilter = "blur(20px)";
              e.currentTarget.style.padding = "16px 20px";
              e.currentTarget.style.gap = "12px";
              e.currentTarget.style.width = "100%";
              e.currentTarget.style.transform = "translateX(0)";
              // Restore glass texture
              const overlay = e.currentTarget.querySelector('[data-glass-overlay]');
              if (overlay) overlay.style.opacity = "1";
            }}
            >
              {/* Glass texture overlay */}
              <div 
                data-glass-overlay
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 20%, transparent 80%, rgba(255,255,255,0.05) 100%)",
                  borderRadius: "50px",
                  pointerEvents: "none",
                  transition: "opacity 0.3s ease",
                }} 
              />
              <Search size={20} color="#a0a0a0" style={{ position: "relative", zIndex: 1 }} />
              <input
                type="text"
                placeholder="Ask anything about your brand campaigns, creator matches, or analytics..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: "16px",
                  outline: "none",
                  position: "relative",
                  zIndex: 1,
                }}
              />
              <button style={{
                background: PRIMARY,
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s ease",
                width: "44px",
                height: "44px",
                position: "relative",
                zIndex: 1,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#0a00b3"}
              onMouseLeave={(e) => e.currentTarget.style.background = PRIMARY}
              >
                <Search size={18} />
              </button>
                          </div>
                        </div>

          {/* Quick Actions */}
          <div style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: "900px",
          }}>
            {[
              { label: "Find Creators", icon: "👥", color: "#3b82f6" },
              { label: "Campaign Stats", icon: "📊", color: "#10b981" },
              { label: "Draft Contract", icon: "📄", color: "#f59e0b" },
              { label: "Analytics", icon: "📈", color: "#8b5cf6" },
              { label: "Messages", icon: "💬", color: "#ef4444" },
            ].map((action, index) => (
              <button
                key={index}
                style={{
                  background: "rgba(26, 26, 26, 0.6)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "50px",
                  padding: "12px 20px",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(42, 42, 42, 0.8)";
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(26, 26, 26, 0.6)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)";
                }}
              >
                {/* Glass texture overlay */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 20%, transparent 80%, rgba(255,255,255,0.05) 100%)",
                  borderRadius: "50px",
                  pointerEvents: "none",
                }} />
                <span style={{ fontSize: "16px", position: "relative", zIndex: 1 }}>{action.icon}</span>
                <span style={{ position: "relative", zIndex: 1 }}>{action.label}</span>
              </button>
                  ))}
                </div>
              </div>
      </div>

      {/* CSS for gradient animation */}
      <style>
        {`
          @keyframes gradientFlow {
            0% {
              background-position: 0% 50%;
            }
            25% {
              background-position: 100% 50%;
            }
            50% {
              background-position: 0% 50%;
            }
            75% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}
      </style>
    </div>
  );
}
