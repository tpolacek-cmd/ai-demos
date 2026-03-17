// demos-config.js
// Metadata de demos disponibles. Controla que demos aparecen en el launcher
// y cuales soportan modo mobile (iPhone viewer).

const DEMOS = [
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        url: 'whatsapp.html',
        mobileSupported: true,
        description: 'Chat interactivo',
    },
    {
        id: 'qr',
        name: 'QR en Factura',
        url: 'qr.html',
        mobileSupported: false,
        description: 'Factura PDF + QR',
    },
];

// Helper: buscar demo por id
function getDemoById(id) {
    return DEMOS.find(function(d) { return d.id === id; }) || null;
}
