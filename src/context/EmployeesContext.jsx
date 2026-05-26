import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import {
  createEmployee,
  deactivateEmployeeById,
  getEmployees,
  updateEmployeeById,
} from "../api/employees";
import { useAuth } from "../auth/AuthContext";

const EmployeesContext = createContext(null);

function getErrorMessage(error, fallbackMessage) {
  const data = error?.response?.data;
  if (!data) return fallbackMessage;

  const candidates = [
    data.message,
    data.error,
    data.detail,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
    if (Array.isArray(candidate) && candidate.length > 0) {
      return String(candidate[0]);
    }
  }

  for (const value of Object.values(data)) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    if (Array.isArray(value) && value.length > 0) {
      return String(value[0]);
    }
  }

  return fallbackMessage;
}

export function EmployeesProvider({ children }) {
  const { user } = useAuth() || {};

  /* ================= EMPLOYEES STATE ================= */
  const [employees, setEmployees] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= ATTENDANCE STATE ================= */
  const [attendance, setAttendance] = useState({});

  /* ================= FETCH EMPLOYEES ================= */
  const fetchEmployees = useCallback(
    async (pageNumber = 1, searchQuery = search, dept = department, roleFilter = role) => {
      try {
        setLoading(true);

        const params = { page: pageNumber };
        if (searchQuery) params.search = searchQuery;
        if (dept) params.department = dept;
        if (roleFilter) params.role = roleFilter;

        const res = await getEmployees(params);

        setEmployees(res.data.results || []);
        setCount(res.data.count || 0);
        setPage(pageNumber);
      } catch (error) {
        console.error("Fetch employees failed:", error.response?.data);
      } finally {
        setLoading(false);
      }
    },
    [search, department, role]
  );

  const refreshEmployees = async () => {
    await fetchEmployees(page, search, department, role);
  };

  /* ================= FETCH ATTENDANCE ================= */
  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance/");
      setAttendance(res.data || {});
    } catch (error) {
      console.error("Fetch attendance failed:", error.response?.data);
    }
  };

  const refreshAttendance = async () => {
    await fetchAttendance();
  };

  /* ================= MARK SINGLE ATTENDANCE ================= */
  const markAttendance = async (date, employeeId, status) => {
    try {
      await api.post("/attendance/mark/", {
        date,
        employee_id: employeeId,
        status,
      });
      await refreshAttendance();
      await fetchAttendance();
      return { success: true };
    } catch (error) {
      console.error("Mark attendance failed:", error.response?.data);
      throw error;
    }
  };

  /* ================= BULK ATTENDANCE ================= */
  const bulkMarkAttendance = async (date, status) => {
    try {
      await api.post("/attendance/bulk-mark/", {
        date,
        status,
      });
      
      await refreshAttendance(); 
      await fetchAttendance();
    } catch (error) {
      console.error("Bulk attendance failed:", error.response?.data);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (user) {
      fetchEmployees(1);
      fetchAttendance();
    }
  }, [user, fetchEmployees]);

  return (
    <EmployeesContext.Provider
      value={{
        /* Employees */
        employees,
        count,
        page,
        search,
        department,
        role,
        loading,
        setSearch,
        setDepartment,
        setRole,
        fetchEmployees,
        refreshEmployees,
        addEmployee: async (formData) => {
          try {
            await createEmployee(formData);
            await refreshEmployees();
            return { success: true };
          } catch (error) {
            console.error("Add employee failed:", error.response?.data);
            return {
              success: false,
              error: getErrorMessage(error, "Failed to add employee"),
            };
          }
        },
        updateEmployee: async (id, formData) => {
          try {
            await updateEmployeeById(id, formData);
            await refreshEmployees();
            return { success: true };
          } catch (error) {
            console.error("Update employee failed:", error.response?.data);
            return {
              success: false,
              error: getErrorMessage(error, "Failed to update employee"),
            };
          }
        },
        deactivateEmployee: async (id) => {
          try {
            await deactivateEmployeeById(id);
            await refreshEmployees();
          } catch (error) {
            console.error("Deactivate failed:", error.response?.data);
          }
        },

        /* Attendance */
        attendance,
        markAttendance,
        bulkMarkAttendance,
        refreshAttendance,
      }}
    >
      {children}
    </EmployeesContext.Provider>
  );
}

export function useEmployees() {
  return useContext(EmployeesContext);
}