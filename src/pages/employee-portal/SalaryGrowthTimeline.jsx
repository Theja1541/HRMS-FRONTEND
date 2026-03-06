import { useEffect, useState } from "react";
import api from "../../api/axios";

import SalaryTimeline from "../../components/payroll/SalaryTimeline";
import SalaryGrowthChart from "../../components/payroll/SalaryGrowthChart";
import SalaryRevisionTable from "../../components/payroll/SalaryRevisionTable";

export default function SalaryGrowthTimeline() {

  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {

    const fetchSummary = async () => {

      const res = await api.get("/payroll/my-summary/");
      setEmployeeId(res.data.employee_id);

    };

    fetchSummary();

  }, []);

  return (
    <div className="page-container">

      <h2>Salary Growth</h2>

      {/* Timeline */}
      {employeeId && (
        <SalaryTimeline employeeId={employeeId} />
      )}

      {/* Growth Chart */}
      {employeeId && (
        <SalaryGrowthChart employeeId={employeeId} />
      )}

      {employeeId && (
        <SalaryRevisionTable employeeId={employeeId} />
    )}

    </div>
  );
}