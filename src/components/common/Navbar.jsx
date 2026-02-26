import "../../styles/navbar.css";

export default function Navbar({ title }) {
  return (
    <header className="navbar">
      <h3>{title}</h3>
      <div className="navbar-user">
        <span>Admin</span>
      </div>
    </header>
  );
}
