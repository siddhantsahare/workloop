import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import App from "./App";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { auth } from "./firebase";
import "semantic-ui-css/semantic.min.css";
import { Provider, useDispatch, useSelector } from "react-redux";
import {store} from "./store/store";
import { clearUser, setUser } from "./actions";
import Spinner from "./components/Spinner";

const Root = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.user.isLoading);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(setUser(user));
        navigate("/");
      } else {
        dispatch(clearUser());
        navigate("/login");
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [navigate, dispatch]);

  return (
    isLoading ? 
      <Spinner /> 
        :
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
      <Router>
        <Root />
      </Router>
    </Provider>
);
