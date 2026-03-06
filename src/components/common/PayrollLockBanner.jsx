import { usePayroll } from "../../context/PayrollContext";

export default function PayrollLockBanner() {
  const { payrollStatus } = usePayroll();

  if (payrollStatus !== "CLOSED") return null;

  return (
    <div style={{
      background: "#fff3cd",
      color: "#856404",
      padding: "10px",
      marginBottom: "15px",
      borderRadius: "6px"
    }}>
      ⚠ Payroll is CLOSED for this month.
      Only Super Admin can modify records.
    </div>
  );
}