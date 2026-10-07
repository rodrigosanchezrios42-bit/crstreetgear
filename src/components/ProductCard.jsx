export default function ProductCard({ producto, onVerProducto }) {

  const adelanto = producto.precio * 0.50;

  const precioFormateado =
    producto.precio.toLocaleString("es-CR");

  const adelantoFormateado =
    adelanto.toLocaleString("es-CR");

  return (
    <article className="product-card">

      <div className="product-image">

        <img
  src={producto.imagenes[0]}
  alt={`${producto.marca} ${producto.nombre}`}
/>

        <span className="product-status">
          POR ENCARGO
        </span>

      </div>

      <div className="product-info">

        <p className="product-brand">
          {producto.marca}
        </p>

        <h3>
          {producto.nombre}
        </h3>

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