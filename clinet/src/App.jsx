import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import "./styles/Language.css";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

import TeamLeadDashboard from "./pages/lead/TeamLeadDashboard";
import TeamLeadKanban from "./pages/lead/TeamLeadKanban";
import TeamLeadProjects from "./pages/lead/TeamLeadProjects";
import TeamLeadTeamMembers from "./pages/lead/TeamLeadTeamMembers";
import TeamLeadAnalytics from "./pages/lead/TeamLeadAnalytics";
import TeamLeadChat from "./pages/lead/TeamLeadChat";

import MemberDashboard from "./pages/member/MemberDashboard";
import MemberTaskBoard from "./pages/member/MemberTaskBoard";
import MemberTaskDetail from "./pages/member/MemberTaskDetail"; // ✅ NEW
import MemberTeamPage from "./pages/member/MemberTeamPage";
import MemberChat from "./pages/member/MemberChat";

import NotificationsPage from "./pages/NotificationsPage.jsx";

import ForgotPassword from "./pages/ForgotPassword"; // ✅ NEW
import ResetPassword from "./pages/ResetPassword"; // ✅ NEW

import ProtectedRoute from "./router/ProtectedRoute";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Layout>
                <AdminUsers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Layout>
                <AdminProjects />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teams"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Layout>
                <AdminTeams />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <Layout>
                <AdminAnalytics />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Team Lead Routes */}
        <Route
          path="/lead"
          element={
            <ProtectedRoute roles={["TeamLead"]}>
              <Layout>
                <TeamLeadDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lead/kanban"
          element={
            <ProtectedRoute roles={["TeamLead"]}>
              <Layout>
                <TeamLeadKanban />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lead/projects"
          element={
            <ProtectedRoute roles={["TeamLead"]}>
              <Layout>
                <TeamLeadProjects />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lead/team"
          element={
            <ProtectedRoute roles={["TeamLead"]}>
              <Layout>
                <TeamLeadTeamMembers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lead/analytics"
          element={
            <ProtectedRoute roles={["TeamLead"]}>
              <Layout>
                <TeamLeadAnalytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lead/chat"
          element={
            <ProtectedRoute roles={["TeamLead"]}>
              <Layout>
                <TeamLeadChat />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Member Routes */}
        <Route
          path="/member"
          element={
            <ProtectedRoute roles={["Member"]}>
              <Layout>
                <MemberDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/tasks"
          element={
            <ProtectedRoute roles={["Member"]}>
              <Layout>
                <MemberTaskBoard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/tasks/:id"
          element={
            <ProtectedRoute roles={["Member"]}>
              <Layout>
                <MemberTaskDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/team"
          element={
            <ProtectedRoute roles={["Member"]}>
              <Layout>
                <MemberTeamPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/chat"
          element={
            <ProtectedRoute roles={["Member"]}>
              <Layout>
                <MemberChat />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 🔔 Universal Notifications Route */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute roles={["Admin", "TeamLead", "Member"]}>
              <Layout>
                <NotificationsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
