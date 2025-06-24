import Sidebar from "./Sidebar";
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
