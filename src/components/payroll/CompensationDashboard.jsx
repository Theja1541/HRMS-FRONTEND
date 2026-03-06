import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function CompensationDashboard() {

  const [data, setData] = useState(null);

  useEffect(() => {

    const fetchSummary = async () => {

      try {

        const res = await api.get("/payroll/my-summary/");
        setData(res.data);

      } catch (err) {

        console.error("Failed to load payroll summary", err);

      }

    };

    fetchSummary();

  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value || 0);

  if (!data) return null;

  return (
    <div className="compensation-dashboard">

      <div className="comp-card">
        <h4>💰 Latest Net Pay</h4>
        <p>{formatCurrency(data.latest_net_pay)}</p>
      </div>

      <div className="comp-card">
        <h4>📈 Year-to-Date Earnings</h4>
        <p>{formatCurrency(data.ytd_earnings)}</p>
      </div>

      <div className="comp-card">
        <h4>🏦 PF Contribution</h4>
        <p>{formatCurrency(data.ytd_pf)}</p>
      </div>

      <div className="comp-card">
        <h4>🧾 Tax Paid (TDS)</h4>
        <p>{formatCurrency(data.ytd_tax)}</p>
      </div>

    </div>
  );
}