import React, { useEffect, useState } from "react";
import { getTransactions, deleteTransaction } from "../services/daybookApi";
import { useNavigate } from "react-router-dom";
import "../../../styles/daybook.css";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransactions();
      const data = response.data;
      setTransactions(Array.isArray(data) ? data : (data?.results || []));
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
        fetchTransactions();
      } catch (error) {
        console.error("Failed to delete transaction", error);
      }
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.transaction_number?.toLowerCase().includes(search.toLowerCase()) ||
    t.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="daybook-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Transactions</h2>
          <p className="page-subtitle">View and manage all daybook entries</p>
        </div>
        <div className="header-actions">
          <button 
            className="add-daybook-btn btn primary"
            onClick={() => navigate("/daybook/transactions/add")}
          >
            + Add Transaction
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by txn number or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">Loading transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">No transactions found.</div>
        ) : (
          <table className="daybook-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Txn Number</th>
                <th>Details</th>
                <th>Category</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>GST</th>
                <th>Mode</th>
                <th>Vendor</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td><strong>{t.transaction_number}</strong></td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.details}>{t.details}</td>
                  <td>
                    <span style={{
                      padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600",
                      background: '#f1f5f9', color: '#475569'
                    }}>
                      {t.category_name || "-"}
                    </span>
                  </td>
                  <td style={{ color: t.debit_amount > 0 ? '#dc2626' : 'inherit', fontWeight: t.debit_amount > 0 ? '600' : 'normal' }}>
                    {t.debit_amount > 0 ? `₹ ${t.debit_amount}` : "-"}
                  </td>
                  <td style={{ color: t.credit_amount > 0 ? '#16a34a' : 'inherit', fontWeight: t.credit_amount > 0 ? '600' : 'normal' }}>
                    {t.credit_amount > 0 ? `₹ ${t.credit_amount}` : "-"}
                  </td>
                  <td>{t.gst_amount > 0 ? `₹ ${t.gst_amount}` : "-"}</td>
                  <td>{t.payment_mode}</td>
                  <td>{t.from_vendor_name || t.to_vendor_name || "-"}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button className="action-btn" style={{ backgroundColor: "#3b82f6", color: "#fff", border: "none" }} onClick={(e) => { e.preventDefault(); navigate(`/daybook/transactions/invoice/${t.id}`); }}>Invoice</button>
                      <button className="action-btn action-btn-edit" onClick={() => navigate(`/daybook/transactions/edit/${t.id}`)}>Edit</button>
                      <button className="action-btn action-btn-deactivate" onClick={() => handleDelete(t.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
