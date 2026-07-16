// facturas-config.js
// Catalogo de facturas (PDFs) para el canal de llegada "QR en Factura".
// Cada marca tiene su propio PDF de factura. El dropdown en qr.html se
// popula desde aca y elige cual mostrar. El QR de la factura NO depende
// de esta seleccion (la marca del portal va por rebrand aparte).
//
// Para agregar una factura:
//   1. Dejar el PDF en assets/facturas/ (ej. factura-cfe.pdf)
//   2. Sumar una linea al array FACTURAS de abajo.

var FACTURAS = [
    { id: 'totalplay', label: 'Totalplay', pdf: 'assets/facturas/factura-totalplay.pdf' },
];

// Devuelve la factura por id, o la primera del catalogo como fallback.
function getFacturaById(id) {
    for (var i = 0; i < FACTURAS.length; i++) {
        if (FACTURAS[i].id === id) return FACTURAS[i];
    }
    return FACTURAS[0];
}
