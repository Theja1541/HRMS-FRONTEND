import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import EmployeeStepForm from "./EmployeeStepForm";
import "../../styles/addEmployee.css";
import api from "../../api/axios"; // ✅ use same axios instance everywhere

export default function AddEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchEmployee = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/employees/${id}/`);
        setEmployeeToEdit(res.data);

      } catch (err) {
        console.error("Failed to fetch employee:", err);

        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          setTimeout(() => navigate("/login"), 1500);
        } else if (err.response?.status === 403) {
          setError("You do not have permission to edit this employee.");
        } else if (err.response?.status === 404) {
          setError("Employee not found.");
        } else {
          setError("Failed to load employee details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, isEditMode, navigate]);

  return (
    <div className="add-employee-page">
      {/* ================= HEADER ================= */}
      <div className="add-employee-header">
        <h2>{isEditMode ? "Edit Employee" : "Add New Employee"}</h2>
        <p>
          {isEditMode
            ? "Update employee details"
            : "Step-by-step employee onboarding"}
        </p>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="form-error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading ? (
        <div className="loading-state">
          Loading employee data...
        </div>
      ) : (
        <EmployeeStepForm employee={employeeToEdit} />
      )}
    </div>
  );
}