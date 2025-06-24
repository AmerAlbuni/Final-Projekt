import '../styles/Sidebar.css'; // Ensure you have the correct path to your CSS file
import { Home, ListCheck, Users, Calendar, Settings, LogOut } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: <Home />, href: '#' },
  { name: 'Aufgaben', icon: <ListCheck />, href: '#' },
  { name: 'Team', icon: <Users />, href: '#' },
  { name: 'Kalender', icon: <Calendar />, href: '#' },
  { name: 'Einstellungen', icon: <Settings />, href: '#' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        TeamTasks
      </div>

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
  );
}
