export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        CRStreetGear
      </div>

      <div className="navbar-links">
        <a href="#inicio">Inicio</a>
        <a href="#catalogo">Catálogo</a>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#contacto">Contacto</a>
      </div>
    </nav>
  );
}