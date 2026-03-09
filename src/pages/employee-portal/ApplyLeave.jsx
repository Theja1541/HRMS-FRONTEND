import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../../styles/applyLeave.css";

export default function ApplyLeave() {

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);

  const [form, setForm] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  /* FETCH DATA */

  useEffect(() => {
    fetchLeaveTypes();
    fetchLeaveBalance();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get("/leaves/types/");
      setLeaveTypes(res.data);
    } catch {
      toast.error("Failed to load leave types");
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const res = await api.get("/leaves/my-balance/");
      setLeaveBalance(res.data);
    } catch {
      toast.error("Failed to load leave balance");
    }
  };

  /* AUTO CALCULATE DAYS */

  useEffect(() => {

    if (form.fromDate && form.toDate) {

      const start = new Date(form.fromDate);
      const end = new Date(form.toDate);

      if (start <= end) {
        const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
        setTotalDays(diff);
      } else {
        setTotalDays(0);
      }

    } else {
      setTotalDays(0);
    }

  }, [form.fromDate, form.toDate]);

  /* HANDLE CHANGE */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });

    if (name === "leaveTypeId") {
      const selected = leaveTypes.find(t => t.id === parseInt(value));
      setSelectedLeaveType(selected);
    }

  };

  /* HANDLE SUBMIT */

  const handleSubmit = async (e) => {

    e.preventDefault();

    const { leaveTypeId, fromDate, toDate, reason } = form;

    if (!leaveTypeId || !fromDate || !toDate || !reason) {
      toast.error("All fields are required");
      return;
    }

    if (totalDays <= 0) {
      toast.error("Invalid date selection");
      return;
    }

    try {

      setLoading(true);

      await api.post("/leaves/apply/", {
        leave_type: leaveTypeId,
        start_date: fromDate,
        end_date: toDate,
        reason
      });

      toast.success("Leave applied successfully ✅");

      setForm({
        leaveTypeId: "",
        fromDate: "",
        toDate: "",
        reason: ""
      });

      setTotalDays(0);

    } catch (err) {

      toast.error(
        err.response?.data?.error || "Failed to apply leave"
      );

    } finally {
      setLoading(false);
    }

  };

  const today = new Date().toISOString().split("T")[0];

  /* UI */

  return (

    <div className="employee-page">

      {/* HEADER */}

      <div className="page-header">
        <h2>Apply Leave</h2>
        <p>Submit your leave request</p>
      </div>

      <div className="apply-leave-layout">

        {/* LEFT FORM */}

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

                {leaveTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.annual_quota} days/year)
                  </option>
                ))}

              </select>

            </div>

            {/* Leave Info */}

            {selectedLeaveType && (

              <div className="leave-info-box">

                <h4>{selectedLeaveType.name} Details</h4>

                <div className="info-grid">

                  <div>
                    <strong>Annual Quota:</strong> {selectedLeaveType.annual_quota}
                  </div>

                  <div>
                    <strong>Type:</strong> {selectedLeaveType.is_paid ? "Paid" : "Unpaid"}
                  </div>

                </div>

              </div>

            )}

            {/* DATE ROW */}

            <div className="form-row">

              <div className="form-group">

                <label>From Date *</label>

                <input
                  type="date"
                  name="fromDate"
                  min={today}
                  value={form.fromDate}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>To Date *</label>

                <input
                  type="date"
                  name="toDate"
                  min={form.fromDate || today}
                  value={form.toDate}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* TOTAL DAYS */}

            {totalDays > 0 && (

              <div className="leave-days-info">
                Total Leave Days: {totalDays}
              </div>

            )}

            {/* REASON */}

            <div className="form-group">

              <label>Reason *</label>

              <textarea
                name="reason"
                placeholder="Enter reason for leave"
                value={form.reason}
                onChange={handleChange}
              />

            </div>

            {/* SUBMIT */}

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

        {/* RIGHT SIDEBAR */}

        <div className="leave-sidebar">

          <div className="balance-card">

            <h3>Your Leave Balance</h3>

            {leaveBalance.map((b, index) => (

              <div key={index} className="balance-item">

                <span>{b.leave_type}</span>

                <span className="balance-value">
                  {b.remaining}
                </span>

              </div>

            ))}

          </div>

          <div className="policy-card">

            <h4>Leave Guidelines</h4>

            <ul>
              <li>Apply leave at least 1 day before</li>
              <li>Manager approval required</li>
              <li>Maximum 10 days per request</li>
            </ul>

          </div>

        </div>

      </div>

    </div>

  );

}