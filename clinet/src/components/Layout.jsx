import AdminSidebar from "./AdminSidebar";
import TeamLeadSidebar from "./TeamLeadSidebar";
import MemberSidebar from "./MemberSidebar";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";


const Layout = ({ children }) => {
  const { user } = useAuth();
   const renderSidebar = (user) => {
    if (user && user.role === "Admin") {
      return <AdminSidebar className="sidebar" />;
    }
    if (user && user.role === "TeamLead") {
      return <TeamLeadSidebar className="sidebar" />;
    }
    if (user && user.role === "Member") {
      return <MemberSidebar className="sidebar" />;
    }
    return null; // or a default sidebar for other roles
  };
  return (
    <div>
      <Header />
      <main className="main-content">
        <div>
          {renderSidebar(user)}
        </div>
        <div className="content-area">
        {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;