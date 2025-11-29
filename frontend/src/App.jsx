import { Routes, Route } from "react-router-dom";
import SignupPage from "./components/signuppage";
import LoginPage from "./components/loginpage";
import Dashboard from "./components/userdashboard";
import AdminDashboard
 from "./components/adminDashboard";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SignupPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/admin" element={<AdminDashboard/>} />
    </Routes>
  );
}
