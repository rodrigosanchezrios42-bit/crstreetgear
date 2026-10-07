import { supabase } from "../lib/supabase";

function obtenerRutaStorage(url) {
  const marcador = "/storage/v1/object/public/productos/";

  if (!url.includes(marcador)) {
    return null;
  }

  return url.split(marcador)[1];
}

export async function eliminarImagenesStorage(urls) {
  const rutas = urls
    .map((url) => {
      try {
        const urlObj = new URL(url);

        const marcador =
          "/storage/v1/object/public/productos/";

        const posicion =
          urlObj.pathname.indexOf(marcador);

        if (posicion === -1) {
          return null;
        }

        return decodeURIComponent(
          urlObj.pathname.substring(
            posicion + marcador.length
          )
        );

      } catch (error) {
        console.error(
          "No se pudo obtener la ruta de la imagen:",
          url,
          error
        );

        return null;
      }
    })
    .filter(Boolean);

  if (rutas.length === 0) {
    return;
  }

  console.log(
  "URLs originales:",
  urls
);

console.log(
  "RUTAS ENVIADAS A STORAGE:",
  rutas
);

console.log(
  "PRIMERA RUTA EXACTA:",
  JSON.stringify(rutas[0])
);

const { data: archivoExiste, error: errorExiste } =
  await supabase.storage
    .from("productos")
    .download(rutas[0]);

console.log(
  "DOWNLOAD DEL ARCHIVO:",
  archivoExiste
);

console.log(
  "ERROR DOWNLOAD:",
  errorExiste
);

const { data: archivos, error: errorListar } =
  await supabase.storage
    .from("productos")
    .list("HS-0106");

console.log("ARCHIVOS EN HS-0106:", archivos);
console.log("ERROR AL LISTAR HS-0106:", errorListar);

  const ruta = rutas[0];

console.log("INTENTANDO ELIMINAR:", ruta);

const { data, error } = await supabase.storage
  .from("productos")
  .remove([ruta]);

console.log("RESULTADO REMOVE:", data);
console.log("ERROR REMOVE:", error);

const { data: despues, error: errorDespues } =
  await supabase.storage
    .from("productos")
    .download(ruta);

console.log(
  "ARCHIVO DESPUÉS DE REMOVE:",
  despues
);

console.log(
  "ERROR DESPUÉS DE REMOVE:",
  errorDespues
);

  if (error) {
    console.error(
      "Error eliminando imágenes de Storage:",
      error
    );

    throw error;
  }

  console.log(
  "RESPUESTA DE STORAGE AL ELIMINAR:",
  data
);

  return data;
}

export async function subirImagen(archivo, sku, indice) {
  const extension = archivo.name.split(".").pop();

  const nombreArchivo =
    `${sku}/${Date.now()}-${indice}.${extension}`;

  const { error } = await supabase.storage
    .from("productos")
    .upload(nombreArchivo, archivo);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("productos")
    .getPublicUrl(nombreArchivo);

  return data.publicUrl;
}


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