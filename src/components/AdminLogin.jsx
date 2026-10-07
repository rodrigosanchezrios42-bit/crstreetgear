import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminLogin({ onLogin }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    onLogin(data.user);
    setCargando(false);
  };

  return (
    <section className="admin-login">

      <div className="admin-login-box">

        <p className="section-subtitle">
          CRSTREETGEAR
        </p>

        <h1>
          Administración
        </h1>

        <p className="admin-login-description">
          Inicia sesión para administrar el catálogo.
        </p>

        <form onSubmit={manejarLogin}>

          <div className="admin-field">

            <label htmlFor="email">
              CORREO
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@crstreetgear.com"
              required
            />

          </div>

          <div className="admin-field">

            <label htmlFor="password">
              CONTRASEÑA
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

          </div>

          {error && (
            <p className="admin-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={cargando}
          >
            {cargando
              ? "INICIANDO SESIÓN..."
              : "INICIAR SESIÓN"}
          </button>

        </form>

      </div>

    </section>
  );
}