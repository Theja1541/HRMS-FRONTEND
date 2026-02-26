import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/employeeProfile.css";

export default function MyDocuments() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/employees/me/");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <p style={{ padding: 24 }}>Loading documents...</p>;
  }

  if (!profile) {
    return <p style={{ padding: 24 }}>No documents found</p>;
  }

  const documents = [
    { label: "Resume", key: "resume" },
    { label: "Offer Letter", key: "offer_letter" },
    { label: "ID Proof", key: "id_proof" },
    { label: "Address Proof", key: "address_proof" },
    { label: "Education Certificate", key: "education_cert" },
    { label: "Experience Certificate", key: "experience_cert" },
  ];

  return (
    <div className="profile-wrapper">

      {/* HEADER */}
      <div className="profile-header">
        <h2>My Documents</h2>
      </div>

      {/* DOCUMENT GRID */}
      <div className="profile-section">
        <div className="documents-grid">

          {documents.map((doc) => {
            const file = profile[doc.key];
            if (!file) return null;

            const fileUrl = `http://127.0.0.1:8000${file}`;
            const isImage = file.match(/\.(jpg|jpeg|png|webp)$/i);

            return (
              <div className="document-card" key={doc.key}>

                <div className="doc-header">
                  <span className="doc-title">{doc.label}</span>
                </div>

                {isImage && (
                  <img
                    src={fileUrl}
                    alt={doc.label}
                    className="doc-preview"
                  />
                )}

                <div className="doc-actions">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="doc-btn"
                  >
                    View / Download
                  </a>
                </div>

              </div>
            );
          })}

          {/* EMPTY STATE */}
          {documents.every((doc) => !profile[doc.key]) && (
            <div style={{ padding: "20px" }}>
              No documents uploaded yet.
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
