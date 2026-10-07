const WHATSAPP_NUMBER = "50685197615";

export function crearMensajeWhatsApp(producto) {
  const adelanto = producto.precio * 0.50;

  const precioFormateado =
    producto.precio.toLocaleString("es-CR");

  const adelantoFormateado =
    adelanto.toLocaleString("es-CR");

  const mensaje = `¡Hola CRStreetGear! 

Me interesa encargar la siguiente pieza:

${producto.marca} — ${producto.nombre}

Precio: ₡${precioFormateado}
Adelanto requerido (50%): ₡${adelantoFormateado}

Me gustaría coordinar el pedido. `;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}