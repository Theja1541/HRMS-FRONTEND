import "../../styles/delete-confirm-modal.css";

export default function DeleteConfirmModal({
  title = "Delete Employee",
  message = "Are you sure you want to delete this employee?",
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>

          <button className="btn danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
