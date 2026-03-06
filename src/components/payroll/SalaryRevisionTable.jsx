import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function SalaryRevisionTable({ employeeId }) {

  const [revisions, setRevisions] = useState([]);

  useEffect(() => {

    const fetchRevisions = async () => {

      try {

        const res = await api.get(
          `/payroll/salary-revisions/employee/${employeeId}/`
        );

        setRevisions(res.data);

      } catch (err) {

        console.error("Failed to load salary revisions", err);

      }

    };

    if (employeeId) fetchRevisions();

  }, [employeeId]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric"
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(value || 0);

  if (!revisions.length) {
    return (
      <div className="revision-card">
        <h3>Salary Revision History</h3>
        <p>No salary revisions available</p>
      </div>
    );
  }

  return (
    <div className="revision-card">

      <h3>Salary Revision History</h3>

      <table className="revision-table">

        <thead>
          <tr>
            <th>Effective Date</th>
            <th>Previous CTC</th>
            <th>New CTC</th>
            <th>Change</th>
            <th>Reason</th>
          </tr>
        </thead>

        <tbody>

          {revisions.map((rev, index) => {

            const change =
              (rev.ctc || 0) - (rev.previous_ctc || 0);

            return (
              <tr key={rev.id}>

                <td>{formatDate(rev.effective_date)}</td>

                <td>{formatCurrency(rev.previous_ctc)}</td>

                <td>{formatCurrency(rev.ctc)}</td>

                <td
                  className={
                    change >= 0 ? "positive-change" : "negative-change"
                  }
                >
                  {change >= 0 ? "▲" : "▼"} {formatCurrency(Math.abs(change))}
                </td>

                <td>{rev.reason || "Revision"}</td>

              </tr>
            );

          })}

        </tbody>

      </table>

    </div>
  );
}