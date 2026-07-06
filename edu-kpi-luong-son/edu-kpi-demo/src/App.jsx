import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import Schools from "./pages/Schools.jsx";
import EducationRecords from "./pages/EducationRecords.jsx";
import DocumentArchivePage from "./pages/DocumentArchive.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route
        path="/hoc-sinh"
        element={
          <ProtectedRoute allowRoles={["ADMIN", "CAN_BO_VHXH"]}>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/truong-hoc"
        element={
          <ProtectedRoute allowRoles={["ADMIN", "CAN_BO_VHXH"]}>
            <Schools />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ho-so"
        element={
          <ProtectedRoute allowRoles={["ADMIN", "CAN_BO_VHXH"]}>
            <EducationRecords />
          </ProtectedRoute>
        }
      />
      <Route path="/van-ban" element={<ProtectedRoute><DocumentArchivePage /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
