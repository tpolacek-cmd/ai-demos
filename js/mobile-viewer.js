// ============================================
// MOBILE VIEWER
// Controla el shell del iPhone frame que carga demos en un iframe.
// Depende de: config/demos-config.js, config/brand-config.js
// ============================================

(function initMobileViewer() {
    var urlParams = new URLSearchParams(window.location.search);
    var demoId = urlParams.get('demo');
    var flow = urlParams.get('flow') || '';

    // Buscar la demo en config
    var demo = getDemoById(demoId);

    if (!demo) {
        // Demo no encontrada, volver al index
        window.location.href = 'index.html';
        return;
    }

    // Actualizar titulo de la pagina
    document.title = BRAND.name + ' - ' + demo.name + ' (Mobile)';

    // Actualizar header
    var titleEl = document.getElementById('mvDemoTitle');
    if (titleEl) titleEl.textContent = demo.name;

    var subtitleEl = document.getElementById('mvDemoSubtitle');
    if (subtitleEl) subtitleEl.textContent = 'Vista mobile';

    // Construir URL del iframe
    var demoUrl = demo.url;
    var separator = demoUrl.indexOf('?') !== -1 ? '&' : '?';
    demoUrl += separator + 'embedded=1';

    if (flow) {
        demoUrl += '&flow=' + encodeURIComponent(flow);
    }

    // Cargar iframe
    var iframe = document.getElementById('mvIframe');
    var loading = document.getElementById('mvLoading');

    if (iframe) {
        iframe.src = demoUrl;

        iframe.addEventListener('load', function() {
            // Ocultar loading cuando carga
            if (loading) {
                loading.classList.add('hidden');
            }
        });
    }

    // Escuchar mensajes del iframe
    window.addEventListener('message', function(event) {
        if (!event.data) return;

        // Cerrar viewer desde el iframe
        if (event.data.type === 'mobile-viewer-close') {
            window.location.href = 'index.html';
        }

        // El iframe de auth-mobile puede enviar phone-mockup-close,
        // pero en mobile viewer no hacemos nada (ya estamos en el phone)
    });
})();
