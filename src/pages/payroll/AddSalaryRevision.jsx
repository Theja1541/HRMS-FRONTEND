import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { formatINR } from "../../utils/currency";
import toast from "react-hot-toast";
import SalaryComparison from "./SalaryComparison";
import {
  buildCalculatedSalaryPayload,
  calculatePayroll,
  yearlyAmount,
} from "../../utils/payrollCalculations";
import "../../styles/addSalaryRevision.css";

export default function AddSalaryRevision() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [saving, setSaving] = useState(false);
  const [currentSalary, setCurrentSalary] = useState({});

  const [form, setForm] = useState({
    effective_from: "",
    reason: "",
    notes: "",
  });

  const [salary, setSalary] = useState({
    basic: "",
    da: "",
    hra: "",
    conveyance: "",
    medical: "",
    special_allowance: "",
    employee_pf: "",
    professional_tax: "",
    employee_esi: "",
    tds: "",
    medical_insurance: "",
    employer_pf: "",
    employer_esi: "",
    gratuity: "",
  });

  /* ================= FETCH CURRENT SALARY ================= */

  useEffect(() => {

    const fetchSalary = async () => {

      try {

        const res = await api.get(`/employees/${id}/salary/`);

        setCurrentSalary(res.data || {});
        setSalary(res.data || {});

      } catch (error) {
        console.error("Failed to load salary", error);
      }

    };

    fetchSalary();

  }, [id]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSalary = (field, value) => {
    setSalary((prev) => ({ ...prev, [field]: value }));
  };

  /* ================= CALCULATIONS ================= */

  const payroll = useMemo(() => calculatePayroll(salary), [salary]);
  const salaryPayload = useMemo(() => buildCalculatedSalaryPayload(salary), [salary]);
  const gross = payroll.gross;
  const deductions = payroll.totalDeductions;
  const netSalary = payroll.netSalary;
  const additionalBenefits = payroll.additionalBenefits;
  const ctc = payroll.ctc;

  /* ================= SAVE ================= */

  const handleSave = async () => {

    if (!form.effective_from) {
      toast.error("Please select effective date");
      return;
    }

    try {

      setSaving(true);

      await api.post("/payroll/salary-revisions/", {
        employee: id,
        effective_from: form.effective_from,
        reason: form.reason,
        notes: form.notes,
        ...salaryPayload,
      });

      toast.success("Salary revision added");

      navigate(`/employees/${id}`);

    } catch (error) {

      console.error(error);
      toast.error("Failed to add salary revision");

    } finally {
      setSaving(false);
    }
  };

  return (

    <div className="salary-revision-page">

      {/* HEADER */}

      <div className="page-header">
        <h2>Add Salary Revision</h2>

        <button className="btn ghost" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {/* REVISION INFO */}

      <div className="revision-card">

        <h3>Revision Details</h3>

        <div className="form-grid">

          <Input
            label="Effective From"
            type="date"
            value={form.effective_from}
            onChange={(e) => updateForm("effective_from", e.target.value)}
          />

          <Input
            label="Reason"
            value={form.reason}
            onChange={(e) => updateForm("reason", e.target.value)}
            placeholder="Promotion / Annual Increment"
          />

          <div className="form-field full">
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
            />
          </div>

        </div>

      </div>

      {/* SALARY STRUCTURE */}

      <div className="revision-card">

        <h3>Salary Structure</h3>

        <table className="salary-table">

          <thead>
            <tr>
              <th>Component</th>
              <th>Monthly</th>
              <th>Yearly</th>
            </tr>
          </thead>

          <tbody>
            <SectionRow label="Earnings (A)" />

            <SalaryRow label="Basic" field="basic" salary={salary} setSalary={updateSalary} />
            <SalaryRow label="DA" field="da" salary={salary} setSalary={updateSalary} />
            <SalaryRow label="HRA" field="hra" salary={salary} setSalary={updateSalary} />
            <SalaryRow label="Conveyance Allowance" field="conveyance" salary={salary} setSalary={updateSalary} />
            <SalaryRow label="Medical Allowance" field="medical" salary={salary} setSalary={updateSalary} />
            <SalaryRow label="Special Allowance" field="special_allowance" salary={salary} setSalary={updateSalary} />

            <SummaryRow label="Gross Salary (A)" value={gross} />

            <SectionRow label="Deductions (B)" />
            <SalaryRow label="Employee PF" field="employee_pf" salary={salary} setSalary={updateSalary} />
            <SalaryRow label="Professional Tax" field="professional_tax" salary={salary} setSalary={updateSalary} />
            <SalaryRow label="Employee ESI" field="employee_esi" salary={salary} setSalary={updateSalary} />
            <SalaryRow label="TDS" field="tds" salary={salary} setSalary={updateSalary} />
            <SalaryRow label="Medical Insurance" field="medical_insurance" salary={salary} setSalary={updateSalary} />

            <SummaryRow label="Total Deductions (B)" value={deductions} />
            <SummaryRow label="Net Salary (A - B)" value={netSalary} />

            <SectionRow label="Employer Contributions" />
            <SalaryRow label="Employer PF" field="employer_pf" salary={salary} setSalary={updateSalary} />
            <SalaryRow label="Employer ESI" field="employer_esi" salary={salary} setSalary={updateSalary} />
            <SalaryRow label="Gratuity" field="gratuity" salary={salary} setSalary={updateSalary} />

            <SummaryRow label="Additional Benefits (C)" value={additionalBenefits} />
            <SummaryRow label="CTC (A + C)" value={ctc} />

          </tbody>

        </table>

      </div>

      {/* SALARY COMPARISON */}

      <SalaryComparison
        oldSalary={currentSalary}
        newSalary={salary}
      />

      {/* SAVE BUTTON */}

      <div className="save-bar">
        <button className="btn primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Salary Revision"}
        </button>
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

const Input = ({ label, ...props }) => (
  <div className="form-field">
    <label>{label}</label>
    <input {...props} />
  </div>
);

const SectionRow = ({ label }) => (
  <tr className="summary-row">
    <td colSpan="3"><strong>{label}</strong></td>
  </tr>
);

const SalaryRow = ({
  label,
  field,
  salary,
  setSalary,
}) => {
  const value = salary[field] ?? "";

  return (
    <tr>

      <td>{label}</td>

      <td>
        <input
          type="number"
          value={value}
          onChange={(e) => setSalary(field, e.target.value)}
          step="0.01"
          min="0"
        />
      </td>

      <td>{formatINR(yearlyAmount(value))}</td>

    </tr>
  );
};

const SummaryRow = ({ label, value }) => (

  <tr className="summary-row">

    <td>{label}</td>

    <td>{formatINR(value)}</td>

    <td>{formatINR(yearlyAmount(value))}</td>

  </tr>

);