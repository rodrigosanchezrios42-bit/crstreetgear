
export default function ProductCard({
  producto,
  onVerProducto,
  prioritaria = false,
}) {
  const precio = Number(producto.precio) || 0;
  const adelanto = precio * 0.5;

  const precioFormateado = precio.toLocaleString("es-CR");
  const adelantoFormateado = adelanto.toLocaleString("es-CR");

  const imagenPrincipal = producto.imagenes?.[0];

  return (
    <article className="product-card">
      <div className="product-image">
        {imagenPrincipal && (
          <img
            src={imagenPrincipal}
            alt={`${producto.marca} ${producto.nombre}`}
            loading={prioritaria ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={prioritaria ? "high" : "auto"}
          />
        )}

        <span className="product-status">
          POR ENCARGO
        </span>
      </div>

      <div className="product-info">
        <p className="product-brand">{producto.marca}</p>

        <h3>{producto.nombre}</h3>

        <div className="product-prices">
          <p className="product-price">
            ₡{precioFormateado}
          </p>

          <p className="product-deposit">
            50% para encargar: ₡{adelantoFormateado}
          </p>
        </div>

        <button
          className="product-button"
          onClick={() => onVerProducto(producto)}
        >
          VER PIEZA
        </button>
      </div>
    </article>
  );
}
