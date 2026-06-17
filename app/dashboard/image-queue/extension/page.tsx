"use client";

import { useState } from "react";
import { Copy, Check, Download, Upload, ArrowLeft, Info, ExternalLink, Zap, RefreshCw } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useImageQueue } from "@/hooks/useImageQueue";

export default function ExtensionBridgePage() {
  const { jobs, exportQueueAsJson, importResultsFromJson } = useImageQueue();
  const [exportFilter, setExportFilter] = useState<"pending" | "all">("pending");
  const [copied, setCopied] = useState(false);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultsJson, setResultsJson] = useState("");
  const [importResult, setImportResult] = useState<{ updated: number; errors: string[] } | null>(null);

  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const preview = exportQueueAsJson(exportFilter === "pending" ? { status: "pending" } : {});

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(preview).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([preview], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bcj-queue-${exportFilter}-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToApi = async () => {
    const data = JSON.parse(preview);
    if (!data.jobs?.length) { setApiError("No jobs to send."); return; }
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/flow-worker/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: preview,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setApiStatus(`✓ Batch seeded: ${json.jobCount} jobs in batch ${json.batchId}. Configure the extension to use:\n${siteOrigin}`);
    } catch (err) {
      setApiError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchResults = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/flow-worker/batch");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      if (!json.results?.length) {
        setApiStatus("No completed results yet. Wait for the extension to process jobs.");
        return;
      }
      const resultStr = JSON.stringify(json, null, 2);
      const result = importResultsFromJson(resultStr);
      setImportResult(result);
      setApiStatus(`Fetched from API: ${result.updated} job(s) updated.`);
    } catch (err) {
      setApiError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualImport = () => {
    if (!resultsJson.trim()) return;
    const result = importResultsFromJson(resultsJson);
    setImportResult(result);
    if (result.updated > 0) setResultsJson("");
  };

  const pendingJobs = jobs.filter((j) => j.status === "pending");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, backgroundColor: "#F8F9FB" }}>
      <DashboardHeader title="Extension Bridge" />

      <div style={{ padding: "10px 24px", borderBottom: "1px solid #E5E7EB", backgroundColor: "#FAFAFA" }}>
        <Link href="/dashboard/image-queue" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#263B5E", textDecoration: "none", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
          <ArrowLeft size={13} /> Back to Image Queue
        </Link>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {/* API integration banner */}
        <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <Zap size={16} style={{ color: "#16A34A", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#166534", fontFamily: "'Nunito', sans-serif", marginBottom: "6px" }}>Direct API Integration (Recommended)</div>
              <div style={{ fontSize: "12px", color: "#15803D", fontFamily: "'Nunito', sans-serif", lineHeight: "1.7" }}>
                <strong>1.</strong> Click <strong>"Seed API"</strong> below — this loads your pending jobs into a server-side queue.<br />
                <strong>2.</strong> In the Flow Image Worker extension, set <code style={{ backgroundColor: "#DCFCE7", padding: "1px 4px", borderRadius: "4px" }}>Studio URL</code> to: <code style={{ backgroundColor: "#DCFCE7", padding: "1px 4px", borderRadius: "4px", fontWeight: 700 }}>{siteOrigin}</code><br />
                <strong>3.</strong> Start the extension — it will automatically process all jobs with correct orientation (Portrait/Landscape).<br />
                <strong>4.</strong> Click <strong>"Fetch Results"</strong> to pull completed images back and update the queue.
              </div>
            </div>
          </div>
        </div>

        {/* API Status / Error feedback */}
        {apiStatus && (
          <div style={{ marginBottom: "16px", padding: "12px 16px", backgroundColor: "#F0FDF4", borderRadius: "10px", border: "1px solid #BBF7D0", fontSize: "12px", color: "#166534", fontFamily: "'Nunito', sans-serif", whiteSpace: "pre-line", display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <Check size={14} style={{ flexShrink: 0, marginTop: "1px" }} /> {apiStatus}
          </div>
        )}
        {apiError && (
          <div style={{ marginBottom: "16px", padding: "12px 16px", backgroundColor: "#FEF2F2", borderRadius: "10px", border: "1px solid #FECACA", fontSize: "12px", color: "#991B1B", fontFamily: "'Nunito', sans-serif" }}>
            {apiError}
          </div>
        )}

        {/* Quick API actions */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button onClick={handleSendToApi} disabled={isLoading || pendingCount === 0} style={{ padding: "10px 20px", border: "none", borderRadius: "10px", backgroundColor: isLoading || pendingCount === 0 ? "#9CA3AF" : "#263B5E", color: "#FFFFFF", fontWeight: 700, fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: isLoading || pendingCount === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <Upload size={14} /> Seed API ({pendingCount} pending jobs)
          </button>
          <button onClick={handleFetchResults} disabled={isLoading} style={{ padding: "10px 20px", border: "1px solid #E5E7EB", borderRadius: "10px", backgroundColor: "#FFFFFF", color: "#263B5E", fontWeight: 700, fontSize: "13px", fontFamily: "'Nunito', sans-serif", cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <RefreshCw size={14} style={{ animation: isLoading ? "spin 1s linear infinite" : "none" }} /> Fetch Results from API
          </button>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "0 0 20px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Export JSON */}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "#263B5E", marginBottom: "10px" }}>Manual Export (Fallback)</h2>
            <p style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", marginBottom: "10px", lineHeight: "1.5" }}>Use this if you prefer to manually paste the JSON into the extension's import field.</p>

            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <button onClick={() => setExportFilter("pending")} style={{ padding: "5px 12px", border: `1px solid ${exportFilter === "pending" ? "#263B5E" : "#E5E7EB"}`, borderRadius: "8px", backgroundColor: exportFilter === "pending" ? "#263B5E" : "#FFFFFF", color: exportFilter === "pending" ? "#FFFFFF" : "#6B7280", fontSize: "11px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, cursor: "pointer" }}>
                Pending ({pendingCount})
              </button>
              <button onClick={() => setExportFilter("all")} style={{ padding: "5px 12px", border: `1px solid ${exportFilter === "all" ? "#263B5E" : "#E5E7EB"}`, borderRadius: "8px", backgroundColor: exportFilter === "all" ? "#263B5E" : "#FFFFFF", color: exportFilter === "all" ? "#FFFFFF" : "#6B7280", fontSize: "11px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, cursor: "pointer" }}>
                All ({jobs.length})
              </button>
            </div>

            {pendingJobs.length > 0 && exportFilter === "pending" && (
              <div style={{ marginBottom: "8px", display: "flex", flexDirection: "column", gap: "3px" }}>
                {pendingJobs.slice(0, 5).map((j) => (
                  <div key={j.id} style={{ fontSize: "11px", fontFamily: "'Nunito', sans-serif", color: "#374151", backgroundColor: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: "6px", padding: "4px 8px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{j.title}</span>
                    <span style={{ color: j.orientation === "PORTRAIT" ? "#8B5CF6" : "#3B82F6", fontWeight: 700, fontSize: "10px", marginLeft: "8px" }}>
                      {j.orientation === "PORTRAIT" ? "↕" : "↔"} {j.orientation}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
              <button onClick={handleCopy} style={{ flex: 1, padding: "7px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "11px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: copied ? "#16A34A" : "#374151", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                {copied ? <Check size={11} /> : <Copy size={11} />} Copy JSON
              </button>
              <button onClick={handleDownload} style={{ flex: 1, padding: "7px", border: "1px solid #E5E7EB", borderRadius: "8px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "11px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                <Download size={11} /> Download
              </button>
            </div>

            <pre style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "10px", fontSize: "10px", fontFamily: "monospace", color: "#374151", maxHeight: "280px", overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
              {preview || "No jobs to export."}
            </pre>
          </div>

          {/* Manual Import results */}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "#263B5E", marginBottom: "10px" }}>Manual Import Results</h2>
            <p style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", marginBottom: "10px", lineHeight: "1.5" }}>
              If you're using manual export (not API), paste the results JSON from the extension here.
            </p>

            <textarea
              value={resultsJson}
              onChange={(e) => setResultsJson(e.target.value)}
              placeholder={`Paste results JSON:\n{\n  "results": [\n    {\n      "jobId": "job-1234",\n      "status": "generated",\n      "localFileName": "image.png"\n    }\n  ]\n}`}
              style={{ width: "100%", height: "160px", padding: "10px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "10px", fontFamily: "monospace", color: "#374151", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />

            <button onClick={handleManualImport} disabled={!resultsJson.trim()} style={{ width: "100%", padding: "9px", border: "none", borderRadius: "8px", backgroundColor: resultsJson.trim() ? "#263B5E" : "#9CA3AF", color: "#FFFFFF", fontWeight: 700, fontSize: "12px", fontFamily: "'Nunito', sans-serif", cursor: resultsJson.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "8px" }}>
              <Upload size={13} /> Import Results
            </button>

            {importResult && (
              <div style={{ marginTop: "10px", padding: "10px 14px", backgroundColor: importResult.updated > 0 ? "#F0FDF4" : "#FEF2F2", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: importResult.updated > 0 ? "#166534" : "#991B1B", fontFamily: "'Nunito', sans-serif" }}>
                  {importResult.updated > 0 ? `✓ ${importResult.updated} job(s) updated` : "No jobs matched"}
                </div>
                {importResult.errors.length > 0 && importResult.errors.map((e, i) => (
                  <div key={i} style={{ fontSize: "10px", color: "#991B1B", fontFamily: "monospace", marginTop: "4px" }}>{e}</div>
                ))}
              </div>
            )}

            {/* Info box */}
            <div style={{ marginTop: "16px", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400E", fontFamily: "'Nunito', sans-serif", marginBottom: "6px" }}>
                Extension Configuration
              </div>
              <div style={{ fontSize: "10px", color: "#78350F", fontFamily: "'Nunito', sans-serif", lineHeight: "1.8" }}>
                <strong>Studio URL:</strong> <code style={{ backgroundColor: "#FEF3C7", padding: "0 3px" }}>{siteOrigin}</code><br />
                <strong>Token:</strong> any value (e.g. <code style={{ backgroundColor: "#FEF3C7", padding: "0 3px" }}>bcj-token</code>)<br />
                <strong>Portrait jobs</strong> will auto-generate in 9:16 vertical format.<br />
                <strong>Landscape jobs</strong> will generate in 16:9 format.
              </div>
            </div>

            <div style={{ marginTop: "14px" }}>
              <Link href="/dashboard/image-queue" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#263B5E", textDecoration: "none", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                <ExternalLink size={12} /> View full Image Queue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
