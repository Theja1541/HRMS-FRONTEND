import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { formatINR } from "../../services/subscriptionService";

export default function PaymentSuccess({ subscription, invoiceNumber, amountPaid, onClose }) {
  
  useEffect(() => {
    // Pop stunning confetti on mount to wow the user!
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#2563eb", "#3b82f6", "#10b981", "#86198f"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#2563eb", "#3b82f6", "#10b981", "#86198f"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const planName = subscription?.plan_details?.name || "Premium Plan";
  const billingCycle = subscription?.billing_cycle || "monthly";

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
      {/* Dynamic Success Checkmark with glowing ripple */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "#dcfce7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px auto",
          boxShadow: "0 0 20px rgba(22, 163, 74, 0.2)",
        }}
      >
        <span style={{ fontSize: "40px", color: "#16a34a", fontWeight: "bold" }}>✓</span>
      </div>

      <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
        Payment Successful!
      </h2>
      <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 32px 0", lineHeight: "1.5" }}>
        Your subscription is now active. All advanced features and employee limits have been synchronized successfully.
      </p>

      {/* Payment details card */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: "16px",
          padding: "20px",
          textAlign: "left",
          border: "1px solid #f1f5f9",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Subscription Plan</span>
          <strong style={{ fontSize: "13px", color: "#0f172a" }}>{planName}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Billing Cycle</span>
          <strong style={{ fontSize: "13px", color: "#0f172a", textTransform: "capitalize" }}>{billingCycle}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Invoice reference</span>
          <strong style={{ fontSize: "13px", color: "#0f172a" }}>{invoiceNumber || "INV-Pending"}</strong>
        </div>
        <hr style={{ border: 0, borderTop: "1px solid #e2e8f0", margin: "12px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "14px", color: "#0f172a", fontWeight: "700" }}>Total Amount Paid</span>
          <strong style={{ fontSize: "16px", color: "#16a34a", fontWeight: "800" }}>
            {formatINR(amountPaid / 100)}
          </strong>
        </div>
      </div>

      {/* Done button */}
      <button
        type="button"
        onClick={onClose}
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
        Go to Billing Dashboard
      </button>
    </div>
  );
}
