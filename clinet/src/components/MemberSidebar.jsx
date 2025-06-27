import '../styles/Sidebar.css';
import { Home, ListCheck, Users, Calendar, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', icon: <Home />, href: "/member", label: "Dashboard" },
  { name: 'Analytics', icon: <ListCheck />, href: "/member/tasks", label: "My Tasks"  },

];

export default function MemberSidebar() {
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
