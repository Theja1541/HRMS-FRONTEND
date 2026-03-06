import { useEffect, useState } from "react";
import { getSalaryTimeline } from "../../api/payroll";
import "../../styles/payroll.css";

export default function SalaryTimeline({ employeeId }) {

  const [timeline, setTimeline] = useState([]);

  useEffect(() => {

    const fetchTimeline = async () => {
      try {

        const res = await getSalaryTimeline(employeeId);
        setTimeline(res.data);

      } catch (err) {

        console.error("Timeline load failed", err);

      }
    };

    if (employeeId) {
      fetchTimeline();
    }

  }, [employeeId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });

  return (
    <div className="timeline-card">

      <h3>Salary Growth Timeline</h3>

      <div className="timeline">

        {timeline.map((rev) => (

          <div key={rev.id} className="timeline-item">

            <div className="timeline-dot"></div>

            <div className="timeline-content">

              <h4>{formatDate(rev.effective_from)}</h4>

              <p>
                Gross Salary:{" "}
                <strong>
                  {formatCurrency(rev.gross_salary)}
                </strong>
              </p>

              <div className="timeline-breakdown">

                <span>Basic: {formatCurrency(rev.basic)}</span>
                <span>HRA: {formatCurrency(rev.hra)}</span>
                <span>DA: {formatCurrency(rev.da)}</span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}