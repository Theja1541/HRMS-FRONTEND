import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { EmployeesProvider } from "./context/EmployeesContext";
import { AuthProvider } from "./auth/AuthContext";

import { Toaster } from "react-hot-toast";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <EmployeesProvider>
        <AuthProvider>
          <App />
          <Toaster position="top-right" reverseOrder={false} />
        </AuthProvider>
      </EmployeesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
