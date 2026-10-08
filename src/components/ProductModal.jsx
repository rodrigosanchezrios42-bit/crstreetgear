import { useState } from "react";
import { crearMensajeWhatsApp } from "../data/whatsapp";

export default function ProductModal({
  producto,
  onClose
}) {

  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const [inicioDeslizamiento, setInicioDeslizamiento] = useState(null);
  const [direccion, setDireccion] = useState("next");

  if (!producto) {
    return null;
  }

  const adelanto = producto.precio * 0.50;

  const precioFormateado =
    producto.precio.toLocaleString("es-CR");

  const adelantoFormateado =
    adelanto.toLocaleString("es-CR");

  const siguienteImagen = () => {
    setDireccion("next");

    setImagenSeleccionada(
      (imagenSeleccionada + 1) % producto.imagenes.length
    );
  };

  const imagenAnterior = () => {
    setDireccion("prev");

    setImagenSeleccionada(
      (imagenSeleccionada - 1 + producto.imagenes.length) %
      producto.imagenes.length
    );
  };

  const comenzarDeslizamiento = (e) => {
    setInicioDeslizamiento(e.touches[0].clientX);
  };

  const terminarDeslizamiento = (e) => {

    if (inicioDeslizamiento === null) {
      return;
    }

    const finalX = e.changedTouches[0].clientX;
    const diferencia = inicioDeslizamiento - finalX;

    const distanciaMinima = 50;

    if (Math.abs(diferencia) >= distanciaMinima) {

      if (diferencia > 0) {
        siguienteImagen();
      } else {
        imagenAnterior();
      }

    }

    setInicioDeslizamiento(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>

      <div
        className="product-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <div
          className="modal-image"
          onTouchStart={comenzarDeslizamiento}
          onTouchEnd={terminarDeslizamiento}
        >

          <img
            key={`${imagenSeleccionada}-${direccion}`}
            className={`gallery-image gallery-${direccion}`}
            src={producto.imagenes[imagenSeleccionada]}
            alt={`${producto.marca} ${producto.nombre}`}
            draggable="false"
          />

          <button
            className="gallery-arrow gallery-arrow-left"
            onClick={imagenAnterior}
          >
            ‹
          </button>

          <button
            className="gallery-arrow gallery-arrow-right"
            onClick={siguienteImagen}
          >
            ›
          </button>

          <div className="gallery-counter">
            {imagenSeleccionada + 1} / {producto.imagenes.length}
          </div>

        </div>

        <div className="modal-info">

          <p className="product-brand">
            {producto.marca}
          </p>

          <h2>
            {producto.nombre}
          </h2>

          <p className="modal-price">
            ₡{precioFormateado}
          </p>

          <p className="modal-description">
            {producto.descripcion}
          </p>

          <div className="modal-condition">

            <strong>
              PIEZA POR ENCARGO
            </strong>

            <p>
              Para iniciar el encargo se requiere
              un adelanto del 50% del valor total.
            </p>

            <p>
              Adelanto requerido:
              <strong> ₡{adelantoFormateado}</strong>
            </p>

          </div>

          <a
            className="whatsapp-button"
            href={crearMensajeWhatsApp(producto)}
            target="_blank"
            rel="noopener noreferrer"
          >
            ENCARGAR POR WHATSAPP
          </a>

        </div>

      </div>

    </div>
  );
}

