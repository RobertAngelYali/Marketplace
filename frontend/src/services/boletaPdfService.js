const formatearMoneda = (valor) => `S/ ${Number(valor || 0).toFixed(2)}`;

const formatearFecha = (fecha = new Date()) => {
  const fechaValida = fecha ? new Date(fecha) : new Date();
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fechaValida);
};

const textoSeguro = (valor, fallback = '-') => {
  if (valor === null || valor === undefined || valor === '') return fallback;
  return String(valor);
};

const normalizarItems = ({ pedido, carrito }) => {
  if (pedido?.productos?.length) {
    return pedido.productos.map((item) => ({
      nombreProducto: item.nombreProducto,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal,
      nombreProveedor: item.nombreProveedor,
    }));
  }

  if (carrito?.items?.length) {
    return carrito.items.map((item) => ({
      nombreProducto: item.nombreProducto,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal,
      nombreProveedor: item.nombreProveedor,
    }));
  }

  return [];
};

const obtenerTotal = ({ pedido, carrito }) => {
  if (pedido?.total !== undefined && pedido?.total !== null) return Number(pedido.total);
  if (carrito?.subtotal !== undefined && carrito?.subtotal !== null) return Number(carrito.subtotal);
  return 0;
};

const boletaPdfService = {
  async generarBoleta({ pedido, carrito, datosEntrega, usuario }) {
    const { jsPDF } = await import('jspdf');
    const numeroPedido = pedido?.numeroPedido || `PED-${Date.now()}`;
    const fechaPedido = pedido?.fechaPedido || new Date();
    const total = obtenerTotal({ pedido, carrito });
    const items = normalizarItems({ pedido, carrito });
    const metodoPago = pedido?.metodoPago || datosEntrega?.metodoPago;
    const direccion = pedido?.direccionEntrega || datosEntrega?.direccionEntrega;
    const telefono = pedido?.telefonoContacto || datosEntrega?.telefonoContacto;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const cardX = 18;
    const cardW = pageWidth - 36;
    const margen = 26;
    let y = 18;

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX, 12, cardW, 270, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, 12, cardW, 270, 3, 3, 'S');

    doc.setFillColor(11, 44, 77);
    doc.roundedRect(cardX, 12, cardW, 30, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('TIENDA DON PEPITO', margen, 26);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Boleta de pago / Comprobante de compra', margen, 34);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`N° ${numeroPedido}`, 184, 25, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(formatearFecha(fechaPedido), 184, 33, { align: 'right' });

    y = 55;
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Datos del cliente', margen, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const nombreCliente = `${textoSeguro(usuario?.nombre, '')} ${textoSeguro(usuario?.apellido, '')}`.trim() || textoSeguro(usuario?.nombreUsuario, 'Cliente');
    doc.text(`Cliente: ${nombreCliente}`, margen, y);
    y += 6;
    doc.text(`Correo: ${textoSeguro(usuario?.email || usuario?.correo)}`, margen, y);
    y += 6;
    doc.text(`Teléfono: ${textoSeguro(telefono)}`, margen, y);
    y += 6;
    const direccionLineas = doc.splitTextToSize(`Dirección: ${textoSeguro(direccion)}`, 155);
    doc.text(direccionLineas, margen, y);
    y += direccionLineas.length * 5 + 2;
    doc.text(`Método de pago: ${textoSeguro(metodoPago)}`, margen, y);

    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Detalle de productos', margen, y);
    y += 8;

    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margen, y - 5, 158, 9, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(11, 44, 77);
    doc.text('Producto', margen + 2, y);
    doc.text('Cant.', 112, y, { align: 'right' });
    doc.text('P. Unit.', 145, y, { align: 'right' });
    doc.text('Subtotal', 184, y, { align: 'right' });
    y += 8;

    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'normal');
    if (items.length === 0) {
      doc.text('No se encontraron productos asociados al pedido.', margen + 2, y);
      y += 8;
    } else {
      items.forEach((item, index) => {
        if (y > 236) {
          doc.addPage();
          doc.setFillColor(248, 250, 252);
          doc.rect(0, 0, 210, 297, 'F');
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(cardX, 12, cardW, 270, 3, 3, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(cardX, 12, cardW, 270, 3, 3, 'S');
          y = 25;
        }

        const nombre = doc.splitTextToSize(`${index + 1}. ${textoSeguro(item.nombreProducto)}`, 78);
        doc.text(nombre, margen + 2, y);
        doc.text(String(item.cantidad || 0), 112, y, { align: 'right' });
        doc.text(formatearMoneda(item.precioUnitario), 145, y, { align: 'right' });
        doc.text(formatearMoneda(item.subtotal), 184, y, { align: 'right' });
        y += Math.max(8, nombre.length * 5 + 2);
      });
    }

    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.line(margen, y, 184, y);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Subtotal', 145, y, { align: 'right' });
    doc.text(formatearMoneda(total), 184, y, { align: 'right' });
    y += 7;
    doc.text('Envío', 145, y, { align: 'right' });
    doc.setTextColor(22, 163, 74);
    doc.text('Gratis', 184, y, { align: 'right' });
    y += 10;

    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('TOTAL PAGADO', 145, y, { align: 'right' });
    doc.setTextColor(37, 99, 235);
    doc.text(formatearMoneda(total), 184, y, { align: 'right' });

    y += 15;
    doc.setFillColor(220, 252, 231);
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(margen, y, 158, 15, 2, 2, 'FD');
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ESTADO: PAGO CONFIRMADO', 105, y + 9.5, { align: 'center' });

    y += 26;
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margen, y, 158, 26, 2, 2, 'S');
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('IMPORTANTE:', margen + 6, y + 9);
    doc.setFont('helvetica', 'normal');
    const importante = doc.splitTextToSize('Conserva esta boleta como constancia de compra. El pedido será validado y atendido según disponibilidad y coordinación de entrega.', 118);
    doc.text(importante, margen + 36, y + 9);

    y += 42;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('Este documento es una constancia de compra emitida por Tienda Don Pepito.', 105, y, { align: 'center' });
    doc.text('Gracias por comprar con nosotros.', 105, y + 5, { align: 'center' });

    doc.save(`boleta-${numeroPedido}.pdf`);
  },
};

export default boletaPdfService;
