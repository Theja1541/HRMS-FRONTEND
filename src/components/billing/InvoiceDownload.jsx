import React, { useState } from "react";
import api from "../../api/axios";

export default function InvoiceDownload({ url, invoiceNumber }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!url) return;

    try {
      setDownloading(true);
      
      // We can open the URL in a new window or initiate an axios blob download
      // Since it's stored on backend media, we can prepend backend host if needed
      // api.defaults.baseURL is usually http://127.0.0.1:8000/api/
      // media folder is http://127.0.0.1:8000/media/
      const baseURL = (api.defaults?.baseURL || "").replace(/\/api\/?$/i, "");
      const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;

      // Open in new tab which triggers PDF browser viewer/download
      window.open(fullUrl, "_blank");
      
    } catch (error) {
      console.error("Failed to download invoice:", error);
      alert("Failed to download invoice PDF. Please contact support.");
    } finally {
      setDownloading(false);
    }
  };

  if (!url) return <span style={{ color: "#94a3b8" }}>—</span>;

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      style={{
        background: "transparent",
        border: "none",
        color: "#2563eb",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        padding: "4px 8px",
        borderRadius: "6px",
        transition: "all 0.2s",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#eff6ff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      📄 {downloading ? "Opening..." : invoiceNumber || "Download"}
    </button>
  );
}
