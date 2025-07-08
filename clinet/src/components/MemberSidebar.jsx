import '../styles/Sidebar.css';
import { Home, ListCheck, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', icon: <Home />, href: "/member", label: "Dashboard" },
  { name: 'My Tasks', icon: <ListCheck />, href: "/member/tasks", label: "My Tasks" },
];

export default function MemberSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="admin-sidebar">
      {/* 📱 Mobile Toggle */}
      {!isOpen && (
        <button className="mobile-toggle outside-toggle" onClick={() => setIsOpen(true)}>
          <Menu />
        </button>
      )}

      <div className={`main-content-wrapper ${isOpen ? 'push-content' : ''}`}>
        {/* 🧱 Sidebar */}
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
          {isOpen && (
            <button className="mobile-toggle inside-toggle" onClick={() => setIsOpen(false)}>
              <Menu />
            </button>
          )}

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} className="sidebar-link">
                {item.icon}
                <span>{item.name}</span>
              </a>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button
              className="sidebar-link logout-button"
              onClick={() => (window.location.href = '/')}
            >
              <LogOut />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* 🧱 Content Area */}
        <div className="content-area">{/* Your Member view here */}</div>
      </div>
    </div>
  );
}
