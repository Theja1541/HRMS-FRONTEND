import React from "react";

export default function PaymentFailure({ errorMessage, onRetry, onClose }) {
  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        maxWidth: "500px",
        margin: "40px auto",
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Danger Crossmark with ripple */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px auto",
          boxShadow: "0 0 20px rgba(220, 38, 38, 0.15)",
        }}
      >
        <span style={{ fontSize: "36px", color: "#dc2626", fontWeight: "bold" }}>✕</span>
      </div>

      <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
        Payment Failed
      </h2>
      <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 32px 0", lineHeight: "1.5" }}>
        We were unable to process your subscription order. Any amount debited will be refunded back to your account automatically within 5-7 business days.
      </p>

      {/* Error Details */}
      <div
        style={{
          backgroundColor: "#fef2f2",
          borderRadius: "16px",
          padding: "16px 20px",
          textAlign: "left",
          border: "1px solid #fee2e2",
          marginBottom: "32px",
        }}
      >
        <strong style={{ fontSize: "13px", color: "#991b1b", display: "block", marginBottom: "4px" }}>
          Reason for failure:
        </strong>
        <span style={{ fontSize: "13px", color: "#b91c1c", lineHeight: "1.4", wordBreak: "break-word" }}>
          {errorMessage || "The transaction was cancelled or declined by the provider."}
        </span>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          type="button"
          onClick={onRetry}
          style={{
            width: "100%",
            padding: "14px 24px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          Retry Subscription Payment
        </button>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            padding: "14px 24px",
            borderRadius: "12px",
            background: "#f1f5f9",
            color: "#475569",
            fontWeight: "700",
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
        >
          Close &amp; Exit
        </button>
      </div>
    </div>
  );
}
