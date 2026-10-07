import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";


export default function Catalog() {

 

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
  const cargarProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("activo", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar productos:", error);
      setCargando(false);
      return;
    }

    setProductos(data || []);
    setCargando(false);
  };

  cargarProductos();
}, []);
  

  const categorias = [
    "Todos",
    "Hoodies",
    "Camisetas",
    "Pantalones",
    "Accesorios"
  ];

  const productosFiltrados =
    categoriaSeleccionada === "Todos"
      ? productos
      : productos.filter(
          (producto) =>
            producto.categoria === categoriaSeleccionada
        );

  return (
    <section id="catalogo" className="catalog">

      <div className="section-heading">

        <p className="section-subtitle">
          CRSTREETGEAR
        </p>

        <h2>
  Catálogo
</h2>

<p className="section-description">
  Explora nuestras piezas disponibles para encargo.
</p>

<div className="catalog-notice">

  <span className="catalog-notice-label">
    IMPORTANTE
  </span>

  <h3>
    Todas las piezas son únicamente por encargo
  </h3>

  <p>
    Para iniciar el proceso de encargo se requiere
    un adelanto del 50% del valor de la pieza.
    La orden se coordina directamente por WhatsApp.
  </p>

</div>

</div>

<div className="catalog-filters">
        {categorias.map((categoria) => (

          <button
            key={categoria}
            className={
              categoriaSeleccionada === categoria
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() => setCategoriaSeleccionada(categoria)}
          >
            {categoria}
          </button>

        ))}

      </div>

      {cargando && (
  <p style={{ textAlign: "center", color: "#888888" }}>
    Cargando piezas...
  </p>
)}

      <div className="products-grid">

        {productosFiltrados.map((producto) => (

          <ProductCard
  key={producto.id}
  producto={producto}
  onVerProducto={setProductoSeleccionado}
/>

        ))}

      </div>
<ProductModal
  producto={productoSeleccionado}
  onClose={() => setProductoSeleccionado(null)}
/>
    </section>
  );
}
