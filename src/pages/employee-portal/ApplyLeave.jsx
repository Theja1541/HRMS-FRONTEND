import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../../styles/applyLeave.css";

export default function ApplyLeave() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  /* ================================
     FETCH LEAVE TYPES
  ================================= */
  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get("/leaves/types/");
      setLeaveTypes(res.data);
    } catch {
      toast.error("Failed to load leave types");
    }
  };

  /* ================================
     HANDLE CHANGE
  ================================= */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* ================================
     HANDLE SUBMIT
  ================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { leaveTypeId, fromDate, toDate, reason } = form;

    if (!leaveTypeId || !fromDate || !toDate || !reason) {
      toast.error("All fields are required");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("From Date cannot be after To Date");
      return;
    }

    try {
      setLoading(true);

      await api.post("/leaves/apply/", {
        leave_type_id: leaveTypeId,
        start_date: fromDate,
        end_date: toDate,
        reason,
      });

      toast.success("Leave applied successfully ✅");

      setForm({
        leaveTypeId: "",
        fromDate: "",
        toDate: "",
        reason: "",
      });

    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to apply leave"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     UI
  ================================= */
  return (
    <div className="employee-page">
      <div className="page-header">
        <div>
          <h2>Apply Leave</h2>
          <p>Submit your leave request</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>

          {/* Leave Type */}
          <div className="form-group">
            <label>Leave Type *</label>
            <select
              name="leaveTypeId"
              value={form.leaveTypeId}
              onChange={handleChange}
            >
              <option value="">Select leave type</option>

              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Row */}
          <div className="form-row">
            <div className="form-group">
              <label>From Date *</label>
              <input
                type="date"
                name="fromDate"
                value={form.fromDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>To Date *</label>
              <input
                type="date"
                name="toDate"
                value={form.toDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Reason */}
          <div className="form-group">
            <label>Reason *</label>
            <textarea
              name="reason"
              rows="4"
              placeholder="Enter reason for leave"
              value={form.reason}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Leave"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}