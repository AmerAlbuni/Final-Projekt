import '../styles/Sidebar.css';
import { Home, ListCheck, Users, Calendar, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', icon: <Home />, href: "/admin", label: "Dashboard" },
  { name: 'Analytics', icon: <ListCheck />, href: "/admin/analytics", label: "Analytics" },
  { name: 'Team', icon: <Users />, href: "/admin/teams", label: "Teams"  },
  { name: 'Projects', icon: <Calendar />, href: "/admin/projects", label: "Projects"  },
  { name: 'Users', icon: <Settings />, href: "/admin/users", label: "Users"  },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        <Menu />
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
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
    </>
  );
}
