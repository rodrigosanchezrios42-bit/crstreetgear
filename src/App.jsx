
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Catalog from "./components/Catalog";
import "./App.css";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Admin from "./components/Admin";
import AdminLogin from "./components/AdminLogin";

function PantallaEspera() {
  return (
    <main className="pantalla-espera">
      <header className="espera-header">
        <a href="/" className="espera-logo">
          CRStreetGear<span>.</span>
        </a>

        <span className="espera-estado">
          ENCARGOS CERRADOS
        </span>
      </header>

      <section className="espera-contenido">
        <p className="espera-subtitulo">
          CRSTREETGEAR / DISPONIBILIDAD
        </p>

        <h1>
          Volvemos
          <br />
          <span>pronto.</span>
        </h1>

        <p className="espera-mensaje">
          En este momento, nuestros encargos están
          temporalmente cerrados. Estamos preparando
          lo próximo para ustedes.
        </p>

        <p className="espera-gracias">
          Gracias por formar parte de CRStreetGear.
        </p>

        <a
          className="espera-contacto"
          href="https://wa.me/50685197615"
          target="_blank"
          rel="noopener noreferrer"
        >
          Consultar por WhatsApp 
        </a>
      </section>

      <footer className="espera-footer">
        <span>CRSTREETGEAR © 2026</span>
        <span>COSTA RICA</span>
      </footer>
    </main>
  );
}

function App() {
  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [encargosAbiertos, setEncargosAbiertos] = useState(true);
  const [cargandoTienda, setCargandoTienda] = useState(true);

  useEffect(() => {
    const obtenerSesion = async () => {
      const { data } = await supabase.auth.getSession();

      setSesion(data.session);
      setCargandoSesion(false);
    };

    obtenerSesion();
  }, []);

  useEffect(() => {
    if (window.location.pathname === "/admin") {
      setCargandoTienda(false);
      return;
    }

    const obtenerEstadoTienda = async () => {
      const { data, error } = await supabase
        .from("configuracion_tienda")
        .select("encargos_abiertos")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error(
          "Error al consultar el estado de los encargos:",
          error
        );
      } else if (data) {
        setEncargosAbiertos(data.encargos_abiertos);
      }

      setCargandoTienda(false);
    };

    obtenerEstadoTienda();
  }, []);

  if (window.location.pathname === "/admin") {
    if (cargandoSesion) {
      return null;
    }

    if (!sesion) {
      return <AdminLogin onLogin={setSesion} />;
    }

    return <Admin />;
  }

  if (cargandoTienda) {
    return (
      <div className="tienda-cargando">
        CRSTREETGEAR.
      </div>
    );
  }

  if (!encargosAbiertos) {
    return <PantallaEspera />;
  }

  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <About />
        <Catalog />
        <Contact />
        <Footer />
      </main>
    </>
  );
}

export default App;
