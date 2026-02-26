import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../context/EmployeesContext";
import "../../styles/employees.css";

export default function Employees() {
  const navigate = useNavigate();

  const {
    employees,
    count,
    page,
    search,
    department,
    loading,
    setSearch,
    setDepartment,
    fetchEmployees,
    deactivateEmployee,
  } = useEmployees();

  const totalPages = Math.ceil(count / 10);

  useEffect(() => {
    fetchEmployees(1, search, department);
  }, [search, department]);

  return (
    <div className="employees-page">
      {/* Floating Background */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* HEADER */}
      <div className="employees-header">
        <h2>Employees</h2>
        <button
          className="btn primary"
          onClick={() => navigate("/employees/add")}
        >
          + Add Employee
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="employees-controls">
        <input
          type="text"
          placeholder="Search by name, email, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="HR">HR</option>
          <option value="IT">IT</option>
          <option value="Finance">Finance</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="employees-card">
        {loading ? (
          <div className="employees-empty">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="employees-empty">No employees found</div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.employee_id}</td>
                  <td>{emp.full_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.mobile}</td>
                  <td className="actions-cell">
                    <ActionMenu
                      onView={() => navigate(`/employees/${emp.id}`)}
                      onEdit={() => navigate(`/employees/edit/${emp.id}`)}
                      onDeactivate={() => {
                        if (window.confirm("Deactivate this employee?")) {
                          deactivateEmployee(emp.id);
                        }
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => fetchEmployees(page - 1)}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => fetchEmployees(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ================= ACTION MENU ================= */

function ActionMenu({ onView, onEdit, onDeactivate }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const handleAction = (action) => {
    setOpen(false);
    action();
  };

  return (
    <div
      className="action-dropdown"
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="action-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        ⋮
      </button>

      {open && (
        <div className="dropdown-menu">
          <button onClick={() => handleAction(onView)}>
            View
          </button>
          <button onClick={() => handleAction(onEdit)}>
            Edit
          </button>
          <button
            onClick={() => handleAction(onDeactivate)}
          >
            Deactivate
          </button>
        </div>
      )}
    </div>
  );
}