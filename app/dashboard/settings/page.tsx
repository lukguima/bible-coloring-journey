"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { FormField, Input, Textarea, Select } from "@/components/dashboard/FormField";
import { useSettings } from "@/hooks/useAdminData";
import { Save, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (confirm("Reset all settings to defaults?")) {
      setForm(settings);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <DashboardHeader title="Settings" />
      <div style={{ padding: "24px", overflowY: "auto" }}>
        <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Brand */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#374151", fontFamily: "'Nunito', sans-serif", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Brand</h2>
            </div>
            <div style={{ padding: "20px" }}>
              <FormField label="Site Name"><Input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} /></FormField>
              <FormField label="Brand Slogan"><Textarea value={form.brandSlogan} onChange={(e) => setForm({ ...form, brandSlogan: e.target.value })} /></FormField>
              <FormField label="Support Email"><Input type="email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} /></FormField>
            </div>
          </div>

          {/* Checkout */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#374151", fontFamily: "'Nunito', sans-serif", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Checkout & Payment</h2>
            </div>
            <div style={{ padding: "20px" }}>
              <FormField label="Default Checkout URL" hint="Hotmart, Stripe, Gumroad, or any payment link. Leave empty to show 'Coming Soon' modal.">
                <Input value={form.checkoutUrl} onChange={(e) => setForm({ ...form, checkoutUrl: e.target.value })} placeholder="https://pay.hotmart.com/..." />
              </FormField>
              <FormField label="Currency"><Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}><option value="USD">USD ($)</option><option value="BRL">BRL (R$)</option><option value="EUR">EUR (€)</option></Select></FormField>
              <div style={{ padding: "12px 14px", backgroundColor: "#F0FDF4", borderRadius: "8px", fontSize: "12px", color: "#166534", fontFamily: "'Nunito', sans-serif", marginTop: "4px" }}>
                ✓ You can also set individual checkout URLs per product in the Products section.
              </div>
            </div>
          </div>

          {/* Platform */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#374151", fontFamily: "'Nunito', sans-serif", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Platform</h2>
            </div>
            <div style={{ padding: "20px" }}>
              {[
                { key: "freeAccessEnabled" as const, label: "Free Access Enabled", hint: "Allow users to access free stories and games without purchasing." },
                { key: "announcementBarEnabled" as const, label: "Announcement Bar", hint: "Show active announcements on public pages." },
                { key: "maintenanceMode" as const, label: "Maintenance Mode", hint: "Show a maintenance message instead of the public site." },
              ].map(({ key, label, hint }) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #F3F4F6" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151", fontFamily: "'Nunito', sans-serif" }}>{label}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", marginTop: "2px" }}>{hint}</div>
                  </div>
                  <button
                    onClick={() => setForm({ ...form, [key]: !form[key] })}
                    style={{
                      width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
                      backgroundColor: form[key] ? "#263B5E" : "#D1D5DB",
                      position: "relative", flexShrink: 0, transition: "background-color 0.2s ease",
                    }}
                  >
                    <span style={{ position: "absolute", top: "2px", left: form[key] ? "22px" : "2px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#FFFFFF", transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </button>
                </div>
              ))}
              <FormField label="Default Language"><Select value={form.defaultLanguage} onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })}><option value="en">English</option><option value="pt">Portuguese (Brazil)</option><option value="es">Spanish</option></Select></FormField>
            </div>
          </div>

          {/* License */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#374151", fontFamily: "'Nunito', sans-serif", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>License Text</h2>
            </div>
            <div style={{ padding: "20px" }}>
              <FormField label="License" hint="Displayed on printable pages and download screens."><Textarea value={form.licenseText} onChange={(e) => setForm({ ...form, licenseText: e.target.value })} /></FormField>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleReset} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px", fontWeight: 600, fontFamily: "'Nunito', sans-serif", cursor: "pointer", color: "#6B7280" }}>
              <RotateCcw size={13} /> Reset
            </button>
            <button onClick={handleSave} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 20px", backgroundColor: saved ? "#10B981" : "#263B5E", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer", transition: "background-color 0.3s ease" }}>
              <Save size={14} /> {saved ? "Saved!" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
