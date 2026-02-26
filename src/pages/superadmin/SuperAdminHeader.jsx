import { useAuth } from "../../auth/AuthContext";

export default function SuperAdminHeader() {
  const { user } = useAuth();

  return (
    <div className="super-header">
      <div>
        <h3>Super Admin Control Panel</h3>
        <p>Logged in as: {user?.username}</p>
      </div>
    </div>
  );
}
