import { createContext, useContext, useEffect, useState } from "react";
import { getPayrollDashboardSummary } from "../api/payroll";
import { useAuth } from "../auth/AuthContext";

const PayrollContext = createContext();

export const PayrollProvider = ({ children }) => {
  const { user } = useAuth();
  const [payrollStatus, setPayrollStatus] = useState("OPEN");
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    fetchStatus();
  }, [month]);

  const fetchStatus = async () => {
    try {
      const res = await getPayrollDashboardSummary(month);
      setPayrollStatus(res.data.status);
    } catch {
      setPayrollStatus("OPEN");
    }
  };

  const isLocked =
    payrollStatus === "CLOSED" &&
    user?.role !== "SUPER_ADMIN";

  return (
    <PayrollContext.Provider
      value={{
        payrollStatus,
        isLocked,
        month,
        setMonth,
        refreshPayrollStatus: fetchStatus,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export const usePayroll = () => useContext(PayrollContext);