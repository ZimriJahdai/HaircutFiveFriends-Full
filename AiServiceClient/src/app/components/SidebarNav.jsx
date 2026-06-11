import { NavLink } from 'react-router-dom';

const navItems = [
  {
    to: '/',
    label: 'Resumen',
    description: 'Estado general y atajos',
    end: true,
  },
  {
    to: '/chat',
    label: 'Chat',
    description: 'Conversacion operativa',
  },
  {
    to: '/voice',
    label: 'Voz',
    description: 'Live API en tiempo real',
  },
  {
    to: '/vision',
    label: 'Vision',
    description: 'Analisis facial y cortes',
  },
  {
    to: '/reviews',
    label: 'Resenas',
    description: 'Insights y sentimiento',
  },
  {
    to: '/login',
    label: 'Login',
    description: 'Inicia sesion para herramientas',
  },
];

export default function SidebarNav() {
  return (
    <nav className="nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <span className="nav-title">{item.label}</span>
          <span className="nav-desc">{item.description}</span>
        </NavLink>
      ))}
    </nav>
  );
}
