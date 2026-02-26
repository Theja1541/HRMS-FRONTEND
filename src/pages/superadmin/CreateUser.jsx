import { useState } from "react";
import { createUser } from "../../api/users";

export default function CreateUser() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createUser(form);
      alert("User created successfully ✅");

      setForm({
        username: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
      });

    } catch (err) {
      alert(
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        "Error creating user"
      );
    }
  };

  return (
    <div>
      <h2>Create User</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="HR">HR</option>
          <option value="EMPLOYEE">EMPLOYEE</option>
        </select>

        <button type="submit" style={{ marginTop: 10 }}>
          Create User
        </button>
      </form>
    </div>
  );
}
