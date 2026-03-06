import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../../styles/employeeProfile.css";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    mobile: "",
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= FETCH PROFILE ================= */

  const fetchProfile = async () => {
    try {
      const res = await api.get("/employees/me/");
      setProfile(res.data);
      setForm({ mobile: res.data.mobile || "" });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE MOBILE ================= */

  const handleProfileUpdate = async () => {
    try {
      await api.patch("/employees/me/", {
        mobile: form.mobile,
      });

      toast.success("Profile updated successfully");
      setEditing(false);
      fetchProfile();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  /* ================= CHANGE PASSWORD ================= */

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await api.post("/accounts/change-password/", passwordData);

      toast.success("Password changed successfully");

      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch {
      toast.error("Failed to change password");
    }
  };

  /* ================= UPLOAD PHOTO ================= */

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_photo", file);

    try {
      await api.patch("/employees/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile photo updated");
      fetchProfile();
    } catch {
      toast.error("Failed to upload photo");
    }
  };

  /* ================= LOADING STATES ================= */

  if (loading)
    return <p style={{ padding: 20 }}>Loading profile...</p>;

  if (!profile)
    return <p style={{ padding: 20 }}>No profile found</p>;

  /* ================= UI ================= */

  return (
    <div className="employee-profile-page">

      {/* HERO SECTION */}
      <div className="profile-hero">

        <div className="profile-avatar-wrapper">
          {profile.profile_photo ? (
            <img
              src={`http://127.0.0.1:8000${profile.profile_photo}`}
              alt="Profile"
              className="profile-avatar-img"
            />
          ) : (
            <div className="profile-avatar">
              {profile.first_name?.charAt(0)}
            </div>
          )}

          <label className="photo-upload-btn">
            Change Photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoUpload}
            />
          </label>
        </div>

        <div className="profile-info">
          <h2>
            {profile.first_name} {profile.last_name}
          </h2>
          <p>{profile.designation}</p>
          <span className={`status-badge ${profile.is_active ? "active" : "inactive"}`}>
            {profile.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <button
          className="edit-btn"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Cancel" : "Edit Profile"}
        </button>

      </div>

      {/* PROFILE DETAILS CARD */}
      <div className="profile-card">

        <div className="profile-grid">

          <div className="profile-item">
            <span>Employee ID</span>
            <strong>{profile.employee_id}</strong>
          </div>

          <div className="profile-item">
            <span>Email</span>
            <strong>{profile.email}</strong>
          </div>

          <div className="profile-item">
            <span>Department</span>
            <strong>{profile.department}</strong>
          </div>

          <div className="profile-item">
            <span>Joining Date</span>
            <strong>{profile.joining_date}</strong>
          </div>

          {/* Editable Mobile */}
          <div className="profile-item full-width">
            <span>Mobile</span>

            {editing ? (
              <div className="edit-row">
                <input
                  type="text"
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({ ...form, mobile: e.target.value })
                  }
                />
                <button
                  className="save-btn"
                  onClick={handleProfileUpdate}
                >
                  Save
                </button>
              </div>
            ) : (
              <strong>{profile.mobile}</strong>
            )}
          </div>

        </div>
      </div>

      {/* CHANGE PASSWORD SECTION */}
      <div className="profile-card">
        <h3>Change Password</h3>

        <div className="password-grid">

          <input
            type="password"
            placeholder="Old Password"
            value={passwordData.old_password}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                old_password: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="New Password"
            value={passwordData.new_password}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                new_password: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={passwordData.confirm_password}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirm_password: e.target.value,
              })
            }
          />

          <button
            className="save-btn"
            onClick={handlePasswordChange}
          >
            Update Password
          </button>

        </div>
      </div>

    </div>
  );
}