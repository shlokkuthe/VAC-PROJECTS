import React, { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    ageChecked: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = () => {
    let newErrors = {};

    if (form.username.trim() === "") {
      newErrors.username = "Username is required";
    }

    if (form.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (form.password === "") {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }

    if (form.confirmPassword === "") {
      newErrors.confirmPassword = "Confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.ageChecked) {
      newErrors.ageChecked = "You must be 18+";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const response = await fetch("http://localhost:5001/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      alert(data.message);

      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        ageChecked: false,
      });

      setErrors({});
    } catch (error) {
      console.log(error);
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">

        <h2>Registration Form</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
        <p>{errors.username}</p>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <p>{errors.email}</p>

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <p>{errors.password}</p>

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />
        <p>{errors.confirmPassword}</p>

        <label className="checkbox">
          <input
            type="checkbox"
            name="ageChecked"
            checked={form.ageChecked}
            onChange={handleChange}
          />
          <span>I am 18 years or older</span>
        </label>

        <p>{errors.ageChecked}</p>

        <button type="submit">
          Register
        </button>

      </form>
    </div>
  );
}

export default App;