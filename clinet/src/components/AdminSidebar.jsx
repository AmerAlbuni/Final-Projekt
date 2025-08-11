import '../styles/Sidebar.css';
import { Home, ListCheck, Users, Calendar, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', icon: <Home />, href: "/admin", label: "Dashboard" },
  { name: 'Analytics', icon: <ListCheck />, href: "/admin/analytics", label: "Analytics" },
  { name: 'Projects', icon: <Calendar />, href: "/admin/projects", label: "Projects" },
  { name: 'Team', icon: <Users />, href: "/admin/teams", label: "Teams" },
  { name: 'Users', icon: <Settings />, href: "/admin/users", label: "Users" },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
   <div className="admin-sidebar">
  {/* ✅ Toggle button OUTSIDE (shows when sidebar is closed) */}
  {!isOpen && (
    <button className="mobile-toggle outside-toggle" onClick={() => setIsOpen(true)}>
      <Menu />
    </button>
  )}

  <div className={`main-content-wrapper ${isOpen ? 'push-content' : ''}`}>
    {/* Sidebar */}
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* ✅ Toggle INSIDE (shows when sidebar is open) */}
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
          onClick={() => {
            const link = '/';
            window.location.href = link;
          }}
        >
          <LogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    {/* Content */}
    <div className="content-area">{/* Your content */}</div>
  </div>
</div>

  );
}
