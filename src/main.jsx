import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import "semantic-ui-css/semantic.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const Root = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register />} />
    </Routes>
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
