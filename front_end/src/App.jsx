import { Routes, Route } from "react-router-dom";
import UI from "./ui.jsx";
import Landing from "./Landing.jsx";

import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentProfile from "./pages/StudentProfile";
import TeacherProfile from "./pages/Teacherprofile";

import ProtectedRoute from "./components/ProtectedRoute";
import StudentLayout from "./layouts/StudentLayout";
import CollaborationPage from "./pages/CollaborationPage";



export default function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<UI />} />
      <Route path="/login" element={<Landing />} />

      {/* Student Routes */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute role="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      <Route
        path="/student-profile"
        element={
          <ProtectedRoute role="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-profile"
        element={
          <ProtectedRoute role="teacher">
            <TeacherProfile />  {/* ✅ Fixed */}
          </ProtectedRoute>
        }
      />
      <Route path="/teacher-collaboration"
  element={<ProtectedRoute role="teacher"><CollaborationPage /></ProtectedRoute>}
/>

    </Routes>
  );
}