import '../styles/Sidebar.css';
import { Home, ListCheck, Users, Calendar, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', icon: <Home />, href: "/lead", label: "Dashboard" },
  { name: 'Analytics', icon: <ListCheck />, href: "/lead/analytics", label: "Analytics" },
  { name: 'Team', icon: <Users />, href: "/lead/team", label: "Team" },
  { name: 'Projects', icon: <Calendar />, href: "/lead/projects", label: "Projects" },
  { name: 'Kanban', icon: <Settings />, href: "/lead/kanban", label: "Kanban" },
];

export default function TeamLeadSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="admin-sidebar">
      {/* 🔘 Mobile toggle outside */}
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

        {/* 🧱 Main Content Area */}
        <div className="content-area">{/* Add your page content here */}</div>
      </div>
    </div>
  );
}
