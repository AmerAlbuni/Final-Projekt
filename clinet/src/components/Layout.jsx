import Sidebar from "./AdminSidebar";
import Header from "./Header";


const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <main className="main-content">
        <Sidebar className="sidebar" />
        <div className="content-area">
        {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

// const Layout = ({ children, user }) => {
//   const renderSidebar = (user) => {
//     if (user && user.role === "Admin") {
//       return <Sidebar className="sidebar" />;
//     }
//     if (user && user.role === "TeamLead") {
//       return <TeamLeadSidebar className="sidebar" />;
//     }
//     return null; // or a default sidebar for other roles
//   };

//   return (
//     <div>
//       <Header />
//       <main className="main-content">
//         <div>
//           {renderSidebar(user)}
//         </div>
       
//         <div className="content-area">
//         {children}
//         </div>
//       </main>
//     </div>
//   );
// };