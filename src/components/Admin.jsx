
import { useEffect, useState } from "react";

import {
  subirImagen,
  agregarProducto,
  actualizarProducto,
  eliminarImagenesStorage
} from "../services/productosService";

import { supabase } from "../lib/supabase";

export default function Admin() {
  const [formulario, setFormulario] = useState({
    sku: "",
    marca: "",
    nombre: "",
    precio: "",
    categoria: "Hoodies",
    descripcion: ""
  });

  const [imagenes, setImagenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);

  // Estado global de los encargos
  const [encargosAbiertos, setEncargosAbiertos] = useState(true);
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [cargandoEstado, setCargandoEstado] = useState(true);

  // Cargar productos
  useEffect(() => {
    const cargarProductos = async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar productos:", error);
        return;
      }

      setProductos(data || []);
    };

    cargarProductos();
  }, []);

  // Cargar configuración global de encargos
  useEffect(() => {
    const cargarEstadoEncargos = async () => {
      const { data, error } = await supabase
        .from("configuracion_tienda")
        .select("encargos_abiertos")
        .eq("id", 1)
        .maybeSingle();

      if (error || !data) {
        console.error(
          "Error al cargar el estado de encargos:",
          error
        );

        alert(
          "No fue posible cargar el estado de los encargos. " +
          "Revisa la configuración de Supabase."
        );
      } else {
        setEncargosAbiertos(data.encargos_abiertos);
      }

      setCargandoEstado(false);
    };

    cargarEstadoEncargos();
  }, []);

  // Abrir o cerrar encargos
  const cambiarEstadoEncargos = async () => {
    if (guardandoEstado || cargandoEstado) return;

    const nuevoEstado = !encargosAbiertos;

    setGuardandoEstado(true);

    try {
      const { data, error } = await supabase
        .from("configuracion_tienda")
        .update({
          encargos_abiertos: nuevoEstado,
          actualizado_en: new Date().toISOString()
        })
        .eq("id", 1)
        .select("encargos_abiertos")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "No se actualizó ninguna fila. Revisa los permisos de Supabase."
        );
      }

      setEncargosAbiertos(data.encargos_abiertos);
    } catch (error) {
      console.error("Error al cambiar los encargos:", error);

      alert(
        "No fue posible cambiar el estado de los encargos. " +
        "Revisa los permisos de Supabase."
      );
    } finally {
      setGuardandoEstado(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value
    }));
  };

  const manejarImagenes = (e) => {
    const archivos = Array.from(e.target.files || []);
    setImagenes(archivos);
  };

  const eliminarImagenSeleccionada = (index) => {
    setImagenes((actuales) =>
      actuales.filter((_, i) => i !== index)
    );
  };

  const eliminarImagenExistente = (index) => {
    setImagenesExistentes((actuales) =>
      actuales.filter((_, i) => i !== index)
    );
  };

  const cambiarEstadoProducto = async (producto) => {
    const nuevoEstado = !producto.activo;

    const { error } = await supabase
      .from("productos")
      .update({ activo: nuevoEstado })
      .eq("id", producto.id);

    if (error) {
      console.error("Error al cambiar estado:", error);
      alert("No fue posible cambiar el estado de la pieza.");
      return;
    }

    setProductos((actuales) =>
      actuales.map((item) =>
        item.id === producto.id
          ? { ...item, activo: nuevoEstado }
          : item
      )
    );
  };

  const editarProducto = (producto) => {
    setProductoEditando(producto);

    setFormulario({
      sku: producto.sku || "",
      marca: producto.marca || "",
      nombre: producto.nombre || "",
      precio: producto.precio ?? "",
      categoria: producto.categoria || "Hoodies",
      descripcion: producto.descripcion || ""
    });

    setImagenes([]);
    setImagenesExistentes(producto.imagenes || []);
  };

  const limpiarFormulario = () => {
    setFormulario({
      sku: "",
      marca: "",
      nombre: "",
      precio: "",
      categoria: "Hoodies",
      descripcion: ""
    });

    setImagenes([]);
    setImagenesExistentes([]);
    setProductoEditando(null);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    try {
      let urlsImagenes = productoEditando
        ? [...imagenesExistentes]
        : [];

      let imagenesEliminadas = [];

      if (productoEditando) {
        imagenesEliminadas = (
          productoEditando.imagenes || []
        ).filter(
          (imagen) => !imagenesExistentes.includes(imagen)
        );
      }

      // Subir nuevas imágenes
      for (let i = 0; i < imagenes.length; i++) {
        const url = await subirImagen(
          imagenes[i],
          formulario.sku,
          urlsImagenes.length + 1
        );

        urlsImagenes.push(url);
      }

      // Validar imágenes para productos nuevos
      if (!productoEditando && urlsImagenes.length === 0) {
        alert("Debes seleccionar al menos una imagen.");
        return;
      }

      const datosProducto = {
        sku: formulario.sku,
        marca: formulario.marca,
        nombre: formulario.nombre,
        precio: Number(formulario.precio),
        categoria: formulario.categoria,
        descripcion: formulario.descripcion,
        imagenes: urlsImagenes
      };

      if (productoEditando) {
        const productoActualizado = await actualizarProducto(
          productoEditando.id,
          datosProducto
        );

        if (imagenesEliminadas.length > 0) {
          await eliminarImagenesStorage(imagenesEliminadas);
        }

        setProductos((actuales) =>
          actuales.map((producto) =>
            producto.id === productoActualizado.id
              ? productoActualizado
              : producto
          )
        );

        alert("Pieza actualizada correctamente.");
      } else {
        const nuevoProducto = await agregarProducto(
          datosProducto
        );

        setProductos((actuales) => [
          nuevoProducto,
          ...actuales
        ]);

        alert("Pieza guardada correctamente.");
      }

      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar la pieza:", error);

      alert(
        "No fue posible guardar la pieza. Revisa la consola."
      );
    }
  };

  return (
    <section className="admin">
      <div className="admin-header">
        <p className="section-subtitle">
          CRSTREETGEAR
        </p>

        <h1>Administración</h1>

        <p>
          Agrega y administra las piezas del catálogo.
        </p>
      </div>

      {/* CONTROL GLOBAL DE ENCARGOS */}
      <section className="admin-encargos">
        <div className="admin-encargos-info">
          <p className="section-subtitle">
            DISPONIBILIDAD
          </p>

          <h2>
            {cargandoEstado
              ? "Cargando disponibilidad..."
              : encargosAbiertos
                ? "Encargos abiertos"
                : "Encargos cerrados"}
          </h2>

          <p>
            {cargandoEstado
              ? "Consultando configuración..."
              : encargosAbiertos
                ? "El catálogo está disponible para los visitantes."
                : "Los visitantes verán la pantalla de espera."}
          </p>
        </div>

        <button
          type="button"
          className={`admin-encargos-toggle ${
            encargosAbiertos ? "abierto" : "cerrado"
          }`}
          onClick={cambiarEstadoEncargos}
          disabled={cargandoEstado || guardandoEstado}
          role="switch"
          aria-checked={encargosAbiertos}
          aria-label="Abrir o cerrar encargos"
        >
          <span className="admin-encargos-toggle-circle" />
        </button>

        <span className="admin-encargos-estado">
          {cargandoEstado
            ? "CARGANDO"
            : guardandoEstado
              ? "GUARDANDO"
              : encargosAbiertos
                ? "ACTIVO"
                : "INACTIVO"}
        </span>
      </section>

      {/* FORMULARIO DE PRODUCTOS */}
      <form
        className="admin-form"
        onSubmit={manejarEnvio}
      >
        <div className="admin-field">
          <label htmlFor="sku">SKU</label>

          <input
            id="sku"
            name="sku"
            type="text"
            value={formulario.sku}
            onChange={manejarCambio}
            placeholder="Ej. HST-HOOD-001"
            required
          />
        </div>

        <div className="admin-field">
          <label htmlFor="marca">Marca</label>

          <input
            id="marca"
            name="marca"
            type="text"
            value={formulario.marca}
            onChange={manejarCambio}
            placeholder="Ej. HELLSTAR"
            required
          />
        </div>

        <div className="admin-field">
          <label htmlFor="nombre">
            Nombre de la pieza
          </label>

          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formulario.nombre}
            onChange={manejarCambio}
            placeholder="Ej. Hoodie Hellstar"
            required
          />
        </div>

        <div className="admin-field">
          <label htmlFor="precio">Precio</label>

          <div className="admin-price-control">
            <input
              id="precio"
              name="precio"
              type="number"
              value={formulario.precio}
              onChange={manejarCambio}
              placeholder="29900"
              min="0"
              required
            />

            <div className="admin-price-arrows">
              <button
                type="button"
                onClick={() => {
                  setFormulario((actual) => ({
                    ...actual,
                    precio:
                      Number(actual.precio || 0) + 1000
                  }));
                }}
                aria-label="Aumentar precio"
              >
                ▲
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormulario((actual) => ({
                    ...actual,
                    precio: Math.max(
                      0,
                      Number(actual.precio || 0) - 1000
                    )
                  }));
                }}
                aria-label="Disminuir precio"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="categoria">Categoría</label>

          <select
            id="categoria"
            name="categoria"
            value={formulario.categoria}
            onChange={manejarCambio}
          >
            <option value="Hoodies">Hoodies</option>
            <option value="Camisetas">Camisetas</option>
            <option value="Pantalones">Pantalones</option>
            <option value="Accesorios">Accesorios</option>
          </select>
        </div>

        <div className="admin-field admin-field-full">
          <label htmlFor="descripcion">Descripción</label>

          <textarea
            id="descripcion"
            name="descripcion"
            value={formulario.descripcion}
            onChange={manejarCambio}
            placeholder="Describe la pieza..."
            rows="5"
            required
          />
        </div>

        <div className="admin-field admin-field-full">
          <label htmlFor="imagenes">
            IMÁGENES DE LA PIEZA
          </label>

          <label
            htmlFor="imagenes"
            className="admin-file-button"
          >
            SELECCIONAR IMÁGENES
          </label>

          <input
            id="imagenes"
            className="admin-file-input"
            type="file"
            accept="image/*"
            multiple
            onChange={manejarImagenes}
          />

          {imagenes.length > 0 && (
            <p className="admin-file-count">
              {imagenes.length}{" "}
              {imagenes.length === 1
                ? "imagen seleccionada"
                : "imágenes seleccionadas"}
            </p>
          )}

          {productoEditando &&
            imagenesExistentes.length > 0 && (
              <div className="admin-existing-images">
                <p className="admin-existing-title">
                  IMÁGENES ACTUALES
                </p>

                <div className="admin-image-preview">
                  {imagenesExistentes.map(
                    (imagen, index) => (
                      <div
                        className="admin-image-preview-item"
                        key={imagen}
                      >
                        <img
                          src={imagen}
                          alt={`Imagen actual ${index + 1}`}
                        />

                        <span className="admin-image-number">
                          {index + 1}
                        </span>

                        <button
                          type="button"
                          className="admin-image-remove"
                          onClick={() =>
                            eliminarImagenExistente(index)
                          }
                          aria-label={`Eliminar imagen actual ${index + 1}`}
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {imagenes.length > 0 && (
            <div className="admin-image-preview">
              {imagenes.map((imagen, index) => (
                <div
                  className="admin-image-preview-item"
                  key={`${imagen.name}-${index}`}
                >
                  <img
                    src={URL.createObjectURL(imagen)}
                    alt={`Vista previa ${index + 1}`}
                  />

                  <span className="admin-image-number">
                    {index + 1}
                  </span>

                  <button
                    type="button"
                    className="admin-image-remove"
                    onClick={() =>
                      eliminarImagenSeleccionada(index)
                    }
                    aria-label={`Eliminar imagen seleccionada ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="admin-save-button"
        >
          {productoEditando
            ? "ACTUALIZAR PIEZA"
            : "GUARDAR PIEZA"}
        </button>

        {productoEditando && (
          <button
            type="button"
            className="admin-cancel-button"
            onClick={limpiarFormulario}
          >
            CANCELAR EDICIÓN
          </button>
        )}
      </form>

      {/* CATÁLOGO ADMINISTRATIVO */}
      <div className="admin-products">
        <div className="admin-products-header">
          <p className="section-subtitle">
            CATÁLOGO
          </p>

          <h2>Piezas registradas</h2>
        </div>

        <div className="admin-products-grid">
          {productos.map((producto) => (
            <div
              className="admin-product-card"
              key={producto.id}
            >
              <img
                src={producto.imagenes?.[0]}
                alt={producto.nombre}
              />

              <div className="admin-product-info">
                <span>{producto.marca}</span>

                <h3>{producto.nombre}</h3>

                <p>SKU: {producto.sku}</p>

                <strong>
                  ₡{Number(producto.precio).toLocaleString("es-CR")}
                </strong>

                <button
                  type="button"
                  className={`admin-status-button ${
                    producto.activo ? "activo" : "inactivo"
                  }`}
                  onClick={() =>
                    cambiarEstadoProducto(producto)
                  }
                >
                  {producto.activo
                    ? "OCULTAR PIEZA"
                    : "ACTIVAR PIEZA"}
                </button>

                <button
                  type="button"
                  className="admin-edit-button"
                  onClick={() => editarProducto(producto)}
                >
                  EDITAR PIEZA
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
