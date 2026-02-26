import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../../styles/layout.css";

export default function Layout() {
  return (
    <div className="layout-root">
      <Sidebar />
      <main className="layout-main">
        <div className="layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
