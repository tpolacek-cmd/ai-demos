// facturas-config.js
// Catalogo de facturas (PDFs) para el canal de llegada "QR en Factura".
// Cada marca tiene su propio PDF de factura. El dropdown en qr.html se
// popula desde aca y elige cual mostrar. El QR de la factura NO depende
// de esta seleccion (la marca del portal va por rebrand aparte).
//
// Para agregar una factura:
//   1. Dejar el PDF en assets/facturas/ (ej. factura-nueva.pdf)
//   2. Sumar una linea al array FACTURAS de abajo.

var FACTURAS = [
    { id: 'telcel',    label: 'Telcel',    pdf: 'assets/facturas/factura-telcel.pdf' },
    { id: 'totalplay', label: 'Totalplay', pdf: 'assets/facturas/factura-totalplay.pdf' },
    { id: 'att',       label: 'AT&T',      pdf: 'assets/facturas/factura-att.pdf' },
    { id: 'aguakan',   label: 'Aguakan',   pdf: 'assets/facturas/factura-aguakan.pdf' },
    { id: 'cfe',       label: 'CFE',       pdf: 'assets/facturas/factura-cfe.pdf' },
    { id: 'izzi',      label: 'Izzi',      pdf: 'assets/facturas/factura-izzi.pdf' },
    { id: 'megacable', label: 'Megacable', pdf: 'assets/facturas/factura-megacable.pdf' },
    { id: 'movistar',  label: 'Movistar',  pdf: 'assets/facturas/factura-movistar.pdf' },
    { id: 'natura',    label: 'Natura',    pdf: 'assets/facturas/factura-natura.pdf' },
    { id: 'naturgy',   label: 'Naturgy',   pdf: 'assets/facturas/factura-naturgy.pdf' },
    { id: 'pase',      label: 'PASE',      pdf: 'assets/facturas/factura-pase.pdf' },
    { id: 'sky',       label: 'Sky',       pdf: 'assets/facturas/factura-sky.pdf', qr: { page: 2, top: 0.81 } },
    { id: 'telnor',    label: 'Telnor',    pdf: 'assets/facturas/factura-telnor.pdf' },
];

// Devuelve la factura por id, o la primera del catalogo como fallback.
function getFacturaById(id) {
    for (var i = 0; i < FACTURAS.length; i++) {
        if (FACTURAS[i].id === id) return FACTURAS[i];
    }
    return FACTURAS[0];
}
