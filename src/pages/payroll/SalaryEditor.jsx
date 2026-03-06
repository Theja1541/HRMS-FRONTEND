import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAllSalaries,
  updateSalary
} from "../../api/payroll";
import "../../styles/payroll.css";

export default function SalaryEditor() {

  const [salaries, setSalaries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const res = await getAllSalaries();
      setSalaries(res.data);
    } catch {
      toast.error("Failed to load salaries");
    }
  };

  const handleEdit = (salary) => {
    setEditingId(salary.id);
    setForm({
      basic: salary.basic,
      hra: salary.hra,
      allowances: salary.allowances,
      deductions: salary.deductions,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({});
  };

  const handleSave = async (salaryId) => {
    if (
      form.basic < 0 ||
      form.hra < 0 ||
      form.allowances < 0 ||
      form.deductions < 0
    ) {
      toast.error("Values cannot be negative");
      return;
    }

    try {
      setSaving(true);
      await updateSalary(salaryId, form);
      toast.success("Salary updated successfully ✅");
      setEditingId(null);
      fetchSalaries();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="payroll-page">

      <div className="page-header">
        <h2>Salary Structure Management</h2>
      </div>

      <div className="table-wrapper">
        <table className="payroll-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Username</th>
              <th>Basic</th>
              <th>HRA</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {salaries.length === 0 ? (
              <tr>
                <td colSpan="8" className="loading-text">
                  No salary records found
                </td>
              </tr>
            ) : (
              salaries.map((salary) => {

                const gross =
                  Number(salary.basic) +
                  Number(salary.da) +
                  Number(salary.hra) +
                  Number(salary.conveyance) +
                  Number(salary.medical) +
                  Number(salary.special_allowance);

                const deductions =
                  Number(salary.employee_pf) +
                  Number(salary.professional_tax) +
                  Number(salary.employee_esi) +
                  Number(salary.tds) +
                  Number(salary.medical_insurance);

                const net = gross - deductions;

                const employer =
                  Number(salary.employer_pf) +
                  Number(salary.employer_esi) +
                  Number(salary.gratuity);

                const ctc = gross + employer;

                return (
                  <tr key={salary.id}>
                    <td>{salary.employee}</td>
                    <td>{salary.username}</td>

                    {editingId === salary.id ? (
                      <>
                        <td>
                          <input
                            type="number"
                            value={form.basic}
                            onChange={(e) =>
                              setForm({ ...form, basic: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={form.hra}
                            onChange={(e) =>
                              setForm({ ...form, hra: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={form.allowances}
                            onChange={(e) =>
                              setForm({ ...form, allowances: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={form.deductions}
                            onChange={(e) =>
                              setForm({ ...form, deductions: e.target.value })
                            }
                          />
                        </td>
                        <td>—</td>
                        <td>
                          <button
                            className="btn-payslip"
                            onClick={() => handleSave(salary.id)}
                            disabled={saving}
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>

                          <button
                            className="btn-disabled"
                            onClick={handleCancel}
                            style={{ marginLeft: "8px" }}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>₹ {salary.basic}</td>
                        <td>₹ {salary.hra}</td>
                        <td>₹ {salary.allowances}</td>
                        <td>₹ {salary.deductions}</td>
                        <td>
                          <strong>₹ {total}</strong>
                        </td>
                        <td>
                          <button
                            className="btn-payslip"
                            onClick={() => {
                              setEditingId(salary.id);
                              setForm(salary);
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}