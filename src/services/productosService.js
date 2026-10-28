
import { supabase } from "../lib/supabase";

// Optimiza imágenes antes de subirlas a Supabase.
async function optimizarImagen(archivo) {
  const tiposCompatibles = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  // Los archivos no compatibles se conservan sin modificaciones.
  if (!tiposCompatibles.includes(archivo.type)) {
    return archivo;
  }

  if (typeof createImageBitmap !== "function") {
    return archivo;
  }

  let imagen;

  try {
    imagen = await createImageBitmap(archivo);

    // Limitar la dimensión máxima a 1600 píxeles.
    const dimensionMaxima = 1600;

    const escala = Math.min(
      1,
      dimensionMaxima / Math.max(imagen.width, imagen.height)
    );

    const ancho = Math.round(imagen.width * escala);
    const alto = Math.round(imagen.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;

    const contexto = canvas.getContext("2d");

    if (!contexto) {
      return archivo;
    }

    contexto.drawImage(imagen, 0, 0, ancho, alto);

    // Convertir a WebP con buena calidad visual.
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.82);
    });

    // Si no se pudo convertir o el archivo aumenta de tamaño,
    // conservar el original.
    if (!blob || blob.size >= archivo.size) {
      return archivo;
    }

    const nombreSinExtension = archivo.name.replace(/\.[^.]+$/, "");

    return new File(
      [blob],
      `${nombreSinExtension}.webp`,
      {
        type: "image/webp",
        lastModified: Date.now(),
      }
    );
  } catch (error) {
    console.warn(
      "No se pudo optimizar la imagen. Se utilizará el archivo original.",
      error
    );

    return archivo;
  } finally {
    imagen?.close();
  }
}

// Sube una imagen optimizada y devuelve su URL pública.
export async function subirImagen(archivo, sku, indice) {
  const archivoOptimizado = await optimizarImagen(archivo);

  const extension =
    archivoOptimizado.type === "image/webp"
      ? "webp"
      : archivoOptimizado.name.split(".").pop();

  const nombreArchivo =
    `${sku}/${Date.now()}-${indice}.${extension}`;

  const { error } = await supabase.storage
    .from("productos")
    .upload(nombreArchivo, archivoOptimizado, {
      contentType: archivoOptimizado.type || undefined,
      cacheControl: "31536000",
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("productos")
    .getPublicUrl(nombreArchivo);

  return data.publicUrl;
}

// Obtiene la ruta de una imagen dentro del bucket productos.
function obtenerRutaStorage(url) {
  try {
    const urlObj = new URL(url);
    const marcador = "/storage/v1/object/public/productos/";
    const posicion = urlObj.pathname.indexOf(marcador);

    if (posicion === -1) {
      return null;
    }

    return decodeURIComponent(
      urlObj.pathname.substring(posicion + marcador.length)
    );
  } catch (error) {
    console.error("No se pudo obtener la ruta de la imagen:", error);
    return null;
  }
}

// Elimina una o varias imágenes del almacenamiento de Supabase.
export async function eliminarImagenesStorage(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    return;
  }

  const rutas = [
    ...new Set(
      urls
        .filter((url) => typeof url === "string")
        .map(obtenerRutaStorage)
        .filter(Boolean)
    ),
  ];

  if (rutas.length === 0) {
    return;
  }

  const { data, error } = await supabase.storage
    .from("productos")
    .remove(rutas);

  if (error) {
    console.error("Error eliminando imágenes de Storage:", error);
    throw error;
  }

  return data;
}

// Registra un producto nuevo.
export async function agregarProducto(producto) {
  const { data, error } = await supabase
    .from("productos")
    .insert([producto])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Actualiza un producto existente.
export async function actualizarProducto(id, producto) {
  const { data, error } = await supabase
    .from("productos")
    .update(producto)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
