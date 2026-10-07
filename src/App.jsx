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

function App() {

  const [sesion, setSesion] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    const obtenerSesion = async () => {
      const { data } = await supabase.auth.getSession();

      setSesion(data.session);
      setCargandoSesion(false);
    };

    obtenerSesion();
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