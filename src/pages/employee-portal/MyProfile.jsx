import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/employeeProfile.css";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/employees/me/");
        setProfile(res.data);
      } catch {
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading profile...</p>;

  if (!profile) return <p>No profile found</p>;

  return (
    <div className="employee-profile-page">
      <div className="page-header">
        <div>
          <h2>My Profile</h2>
          <p>Personal & account information</p>
        </div>
      </div>

      <div className="profile-card">
        <p><strong>Employee ID:</strong> {profile.employee_id}</p>
        <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Mobile:</strong> {profile.mobile}</p>
        <p><strong>Department:</strong> {profile.department}</p>
        <p><strong>Designation:</strong> {profile.designation}</p>
        <p><strong>Joining Date:</strong> {profile.joining_date}</p>
        <p><strong>Status:</strong> {profile.status}</p>
      </div>
    </div>
  );
}
