import { useState } from "react";
import "./App.css";

import Header from "./components/Header";
import InputField from "./components/InputField";
import Button from "./components/Button";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function submitForm() {
    if (name === "") {
      setMessage("Name IS BLANK");
    }
    else {

      if (email === "") {
        setMessage("Email IS BLANK");
      }
      else {

        if (password === "") {
          setMessage("Password IS BLANK");
        }
        else {

          setMessage("Registration Successful!");

          setName("");
          setEmail("");
          setPassword("");

        }

      }

    }

  }

  return (
    <div className="container">

      <Header />

      <div className="form-box">

        <InputField
          label="Full Name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <InputField
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          title="Register"
          onClick={submitForm}
        />

        <p className="message">{message}</p>

      </div>

    </div>
  );
}

export default App;