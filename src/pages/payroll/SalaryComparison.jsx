import { formatINR } from "../../utils/currency";
import "../../styles/salaryComparison.css";

export default function SalaryComparison({ oldSalary = {}, newSalary = {} }) {

  const rows = [
    { label: "Basic", field: "basic" },
    { label: "DA", field: "da" },
    { label: "HRA", field: "hra" },
    { label: "Conveyance", field: "conveyance" },
    { label: "Medical", field: "medical" },
    { label: "Special Allowance", field: "special_allowance" },
  ];

  /* ================= NUMBER SAFETY ================= */

  const getValue = (obj, field) => {
    return Number(obj?.[field] || 0);
  };

  /* ================= CHANGE CALCULATION ================= */

  const getChange = (oldVal, newVal) => {
    const diff = newVal - oldVal;

    if (diff === 0) {
      return { text: "-", class: "neutral" };
    }

    if (diff > 0) {
      return { text: `+${formatINR(diff)}`, class: "increase" };
    }

    return { text: `-${formatINR(Math.abs(diff))}`, class: "decrease" };
  };

  /* ================= TOTALS ================= */

  const calculateGross = (salary) =>
    getValue(salary, "basic") +
    getValue(salary, "da") +
    getValue(salary, "hra") +
    getValue(salary, "conveyance") +
    getValue(salary, "medical") +
    getValue(salary, "special_allowance");

  const calculateEmployerBenefits = (salary) =>
    getValue(salary, "employer_pf") +
    getValue(salary, "employer_esi") +
    getValue(salary, "gratuity");

  const oldGross = calculateGross(oldSalary);
  const newGross = calculateGross(newSalary);

  const oldCTC = oldGross + calculateEmployerBenefits(oldSalary);
  const newCTC = newGross + calculateEmployerBenefits(newSalary);

  return (
    <div className="salary-comparison">

      <h3>Salary Comparison</h3>

      <table className="comparison-table">

        <thead>
          <tr>
            <th>Component</th>
            <th>Current Salary</th>
            <th>Revised Salary</th>
            <th>Change</th>
          </tr>
        </thead>

        <tbody>

          {rows.map((row) => {

            const oldVal = getValue(oldSalary, row.field);
            const newVal = getValue(newSalary, row.field);

            const change = getChange(oldVal, newVal);

            return (
              <tr key={row.field}>

                <td>{row.label}</td>

                <td>{formatINR(oldVal)}</td>

                <td>{formatINR(newVal)}</td>

                <td className={`change ${change.class}`}>
                  {change.text}
                </td>

              </tr>
            );
          })}

          {/* GROSS SALARY */}

          {(() => {

            const change = getChange(oldGross, newGross);

            return (
              <tr className="summary-row">

                <td><strong>Gross Salary</strong></td>

                <td>{formatINR(oldGross)}</td>

                <td>{formatINR(newGross)}</td>

                <td className={`change ${change.class}`}>
                  {change.text}
                </td>

              </tr>
            );

          })()}

          {/* CTC */}

          {(() => {

            const change = getChange(oldCTC, newCTC);

            return (
              <tr className="summary-row">

                <td><strong>CTC</strong></td>

                <td>{formatINR(oldCTC)}</td>

                <td>{formatINR(newCTC)}</td>

                <td className={`change ${change.class}`}>
                  {change.text}
                </td>

              </tr>
            );

          })()}

        </tbody>

      </table>

    </div>
  );
}