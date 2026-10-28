
import { useEffect, useState } from "react";
import { crearMensajeWhatsApp } from "../data/whatsapp";

export default function ProductModal({ producto, onClose }) {
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const [inicioDeslizamiento, setInicioDeslizamiento] = useState(null);
  const [direccion, setDireccion] = useState("next");

  const imagenes = producto?.imagenes ?? [];
  const cantidadImagenes = imagenes.length;

  useEffect(() => {
    setImagenSeleccionada(0);
    setInicioDeslizamiento(null);
    setDireccion("next");
  }, [producto?.id]);

  useEffect(() => {
    if (cantidadImagenes === 0) return;

    const indiceSeguro = Math.min(
      imagenSeleccionada,
      cantidadImagenes - 1
    );

    const url = imagenes[indiceSeguro];

    if (!url) return;

    const imagen = new Image();
    imagen.src = url;
  }, [imagenes, cantidadImagenes, imagenSeleccionada]);

  if (!producto) {
    return null;
  }

  const precio = Number(producto.precio) || 0;
  const adelanto = precio * 0.5;

  const precioFormateado = precio.toLocaleString("es-CR");
  const adelantoFormateado = adelanto.toLocaleString("es-CR");

  const siguienteImagen = () => {
    if (cantidadImagenes <= 1) return;

    setDireccion("next");
    setImagenSeleccionada(
      (actual) => (actual + 1) % cantidadImagenes
    );
  };

  const imagenAnterior = () => {
    if (cantidadImagenes <= 1) return;

    setDireccion("prev");
    setImagenSeleccionada(
      (actual) => (actual - 1 + cantidadImagenes) % cantidadImagenes
    );
  };

  const comenzarDeslizamiento = (e) => {
    setInicioDeslizamiento(e.touches[0].clientX);
  };

  const terminarDeslizamiento = (e) => {
    if (inicioDeslizamiento === null) return;

    const finalX = e.changedTouches[0].clientX;
    const diferencia = inicioDeslizamiento - finalX;

    if (Math.abs(diferencia) >= 50) {
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
          aria-label="Cerrar detalles de la pieza"
        >
          ×
        </button>

        <div
          className="modal-image"
          onTouchStart={comenzarDeslizamiento}
          onTouchEnd={terminarDeslizamiento}
        >
          {cantidadImagenes > 0 ? (
            
<img
  key={`${producto.id}-${imagenSeleccionada}`}
  className={`gallery-image gallery-${direccion}`}
  src={imagenes[imagenSeleccionada]}
  alt={`${producto.marca} ${producto.nombre}`}
  decoding="async"
  draggable="false"
/>

          ) : (
            <p>No hay imágenes disponibles para esta pieza.</p>
          )}

          {cantidadImagenes > 1 && (
            <>
              <button
                className="gallery-arrow gallery-arrow-left"
                onClick={imagenAnterior}
                aria-label="Ver imagen anterior"
              >
                ‹
              </button>

              <button
                className="gallery-arrow gallery-arrow-right"
                onClick={siguienteImagen}
                aria-label="Ver imagen siguiente"
              >
                ›
              </button>

              <div className="gallery-counter">
                {imagenSeleccionada + 1} / {cantidadImagenes}
              </div>
            </>
          )}
        </div>

        <div className="modal-info">
          <p className="product-brand">{producto.marca}</p>

          <h2>{producto.nombre}</h2>

          <p className="modal-price">₡{precioFormateado}</p>

          <p className="modal-description">
            {producto.descripcion}
          </p>

          <div className="modal-condition">
            <strong>PIEZA POR ENCARGO</strong>

            <p>
              Para iniciar el encargo se requiere un adelanto
              del 50% del valor total.
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
