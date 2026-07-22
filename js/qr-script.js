// PDF.js configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Factura activa. La marca se elige en el builder (config.factura); el dropdown en
// esta pagina permite cambiarla en vivo. El QR NO depende de esto (la marca del portal
// va por rebrand aparte).
let currentPdfUrl = (function() {
    var cfg = (typeof getDemoConfig === 'function') ? getDemoConfig() : {};
    if (cfg.factura && typeof getFacturaById === 'function') return getFacturaById(cfg.factura).pdf;
    if (typeof FACTURAS !== 'undefined' && FACTURAS.length) return FACTURAS[0].pdf;
    return (typeof BRAND !== 'undefined' && BRAND.invoicePdf) ? BRAND.invoicePdf : 'assets/brand/factura.pdf';
})();
const QR_TARGET_PAGE = 2; // Page where we overlay the QR

// Origen de produccion (para que el QR sea escaneable desde un telefono real aun demando en local)
const PROD_ORIGIN = 'https://ai-demos-lime.vercel.app';

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let pageCanvases = []; // Store references to page wrappers
let scale = 1.5; // Render scale for quality

// DOM Elements
const pdfPages = document.getElementById('pdfPages');
const pdfLoading = document.getElementById('pdfLoading');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const qrOverlay = document.getElementById('qrOverlay');
const qrCodeArea = document.getElementById('qrCodeArea');
const qrLoadingSmall = document.getElementById('qrLoadingSmall');
const scanOverlay = document.getElementById('scanOverlay');

// ============================================
// PDF LOADING AND RENDERING
// ============================================

// Limpia el viewer para poder cargar otra factura (dropdown)
function resetViewer() {
    pdfDoc = null;
    currentPage = 1;
    totalPages = 0;
    pageCanvases = [];
    if (pdfPages) pdfPages.innerHTML = '';
    if (qrOverlay) qrOverlay.style.display = 'none';
    if (pdfLoading) pdfLoading.style.display = '';
}

async function loadPDF(url) {
    currentPdfUrl = url || currentPdfUrl;
    resetViewer();
    try {
        pdfDoc = await pdfjsLib.getDocument(currentPdfUrl).promise;
        totalPages = pdfDoc.numPages;

        pageInfo.textContent = `Pág 1 / ${totalPages}`;

        // Crear el wrapper de la pagina 1 y REVELAR ya el viewer + QR.
        // El QR (lo que se escanea) NO debe depender de que el canvas del PDF termine
        // de pintarse: en algunos browsers el render de PDF.js es lento o se cuelga.
        const first = await createPageWrapper(1);
        pdfLoading.style.display = 'none';
        positionQROverlay();
        updatePageButtons();

        // Pintar el canvas de la pagina 1 + crear/pintar las demas paginas en segundo
        // plano (best-effort). Si el render se cuelga/falla, el wrapper + el QR ya estan
        // visibles y la demo funciona igual.
        (async function renderRest() {
            renderPageCanvas(first).catch(function(e) { console.warn('canvas pag 1:', e); });
            for (let i = 2; i <= totalPages; i++) {
                try {
                    const item = await createPageWrapper(i);
                    positionQROverlay(); // reposicionar QR sobre la pagina target si ya llego
                    updatePageButtons();
                    await renderPageCanvas(item);
                } catch (e) {
                    console.warn('No se pudo preparar/pintar la pagina', i, e);
                    break;
                }
            }
        })();

    } catch (error) {
        console.error('Error loading PDF:', error);
        pdfLoading.style.display = '';
        pdfLoading.innerHTML = `
            <p style="color: #ff6b6b;">Error al cargar la factura</p>
            <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 8px;">${error.message}</p>
        `;
    }
}

// Crea el wrapper + canvas de una pagina (usa getPage, que resuelve bien) SIN pintar.
// Devuelve lo necesario para pintar el canvas despues.
async function createPageWrapper(pageNum) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: scale });

    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-page-wrapper';
    wrapper.id = `page-${pageNum}`;
    wrapper.dataset.page = pageNum;
    wrapper.style.width = viewport.width + 'px';
    wrapper.style.height = viewport.height + 'px';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const pageLabel = document.createElement('div');
    pageLabel.className = 'page-number-label';
    pageLabel.textContent = `Página ${pageNum} de ${totalPages}`;

    wrapper.appendChild(canvas);
    wrapper.appendChild(pageLabel);
    pdfPages.appendChild(wrapper);
    pageCanvases.push(wrapper);

    return { page: page, ctx: ctx, viewport: viewport };
}

// Pinta el canvas de una pagina (el render puede ser lento/colgarse en algunos browsers).
async function renderPageCanvas(item) {
    await item.page.render({
        canvasContext: item.ctx,
        viewport: item.viewport
    }).promise;
}

// ============================================
// QR OVERLAY POSITIONING
// ============================================

// Config de posicion del QR para la factura activa (o null). Formato en
// facturas-config.js: qr: { page:N, top:0..1, left:0..1 } (fracciones; centro del bloque).
function getActiveFacturaQR() {
    if (typeof FACTURAS === 'undefined') return null;
    for (var i = 0; i < FACTURAS.length; i++) {
        if (FACTURAS[i].pdf === currentPdfUrl && FACTURAS[i].qr) return FACTURAS[i].qr;
    }
    return null;
}

function positionQROverlay() {
    var _qrcfg = getActiveFacturaQR();
    var _targetPage = (_qrcfg && _qrcfg.page != null) ? _qrcfg.page : QR_TARGET_PAGE;
    // Preferir la pagina target del QR; si aun no renderizo (o falla), caer a la pagina 1
    // para que el QR SIEMPRE sea visible y escaneable.
    var _targetEl = document.getElementById('page-' + _targetPage);
    const page2Wrapper = _targetEl || document.getElementById('page-1');
    if (!page2Wrapper) return;

    // Show the overlay
    qrOverlay.style.display = 'block';
    
    // Make pdfPages the positioning context
    pdfPages.style.position = 'relative';
    
    // Calculate vertical position relative to pdfPages container
    const offsetTop = page2Wrapper.offsetTop;
    const pageHeight = page2Wrapper.offsetHeight;
    
    // Position QR in the empty bottom area of page 2
    // Horizontally: center within pdfPages (which is itself centered via flexbox)
    qrOverlay.style.position = 'absolute';
    if (_qrcfg && _targetEl) {
        // Posicion por marca: `top` = fraccion del alto de la pagina (centro vertical del bloque).
        // Solo se aplica si la pagina configurada realmente renderizo (evita poner el `top`
        // de una pagina sobre otra cuando el render multipagina falla).
        // Horizontal siempre centrado (lo natural para un QR de factura).
        qrOverlay.style.top = (offsetTop + pageHeight * _qrcfg.top) + 'px';
        qrOverlay.style.left = '50%';
        qrOverlay.style.transform = 'translate(-50%, -50%)';
    } else {
        // Default (sin config): comportamiento previo — 52% de alto, centrado horizontal
        qrOverlay.style.top = (offsetTop + pageHeight * 0.52) + 'px';
        qrOverlay.style.left = '50%';
        qrOverlay.style.transform = 'translateX(-50%)';
    }
}

// Reposition on resize
window.addEventListener('resize', () => {
    positionQROverlay();
});

// ============================================
// QR CODE GENERATION
// ============================================

// Construye el deep-link ABSOLUTO al portal+pago configurados en el builder.
// Toda la config viaja en la URL (checkout/payment/flow) para que un celular
// que escanea el QR (sesion nueva, sin sessionStorage) caiga en la experiencia correcta.
// forPhone=true fuerza PROD_ORIGIN en localhost (para que un telefono real alcance la URL).
function buildCheckoutDeepLink(forPhone) {
    var config = (typeof getDemoConfig === 'function') ? getDemoConfig() : {};
    var checkoutOpt = (typeof getOptionById === 'function')
        ? (getOptionById('checkout', config.checkout) || getOptionById('checkout', 'portal-cobranzas'))
        : null;
    var page = checkoutOpt ? checkoutOpt.page : 'checkout.html';
    var flow = (checkoutOpt && checkoutOpt.flow) ? checkoutOpt.flow : 'curp-deeplink';

    var isLocal = (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    var origin = (forPhone && isLocal) ? PROD_ORIGIN : window.location.origin;
    var basePath = window.location.pathname.replace(/[^\/]*$/, '');

    // Marca actual codificada, para que viaje al celular que escanea (nombre/colores/logo-hosteado)
    var brandParam = (typeof BrandOverride !== 'undefined' && BrandOverride.encode)
        ? ('&b=' + encodeURIComponent(BrandOverride.encode())) : '';

    // Metodos habilitados del portal (Paso 3 multi-select) → viajan al celular
    var methodsParam = (config.methods && config.methods.length)
        ? ('&methods=' + config.methods.join(',')) : '';

    return origin + basePath + page
        + '?flow=' + flow
        + '&checkout=' + (config.checkout || 'portal-cobranzas')
        + methodsParam
        + '&source=qr&autopay=1'
        + brandParam;
}

function generateQR() {
    // El QR codifica el deep-link absoluto (escaneable desde un telefono real)
    const checkoutUrl = buildCheckoutDeepLink(true);

    // Generate QR using QR Server API
    const qrSize = 200;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(checkoutUrl)}&margin=8`;
    
    const qrImg = document.createElement('img');
    qrImg.src = qrApiUrl;
    qrImg.alt = 'QR Portal de Pago ' + BRAND.name;
    
    qrImg.onload = () => {
        qrCodeArea.innerHTML = '';
        qrCodeArea.appendChild(qrImg);
    };
    
    qrImg.onerror = () => {
        // Fallback: show a placeholder QR-like pattern
        qrCodeArea.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0;">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" stroke="#333" stroke-width="1.5"/>
                    <rect x="14" y="3" width="7" height="7" stroke="#333" stroke-width="1.5"/>
                    <rect x="3" y="14" width="7" height="7" stroke="#333" stroke-width="1.5"/>
                    <rect x="5" y="5" width="3" height="3" fill="#333"/>
                    <rect x="16" y="5" width="3" height="3" fill="#333"/>
                    <rect x="5" y="16" width="3" height="3" fill="#333"/>
                    <rect x="14" y="14" width="2" height="2" fill="#333"/>
                    <rect x="18" y="14" width="2" height="2" fill="#333"/>
                    <rect x="14" y="18" width="2" height="2" fill="#333"/>
                    <rect x="18" y="18" width="2" height="2" fill="#333"/>
                </svg>
            </div>
        `;
    };
    
    // Make QR clickable to simulate scan
    qrCodeArea.parentElement.addEventListener('click', simulateQRScan);
}

// ============================================
// QR SCAN SIMULATION
// ============================================

function simulateQRScan() {
    // Show scan overlay
    scanOverlay.style.display = 'flex';
    
    requestAnimationFrame(() => {
        scanOverlay.classList.add('show');
    });
    
    // Redirect after animation. Usa el MISMO deep-link que el QR (con la config
    // en la URL + autopay), pero con el origin actual para que funcione same-device.
    setTimeout(() => {
        window.location.href = buildCheckoutDeepLink(false);
    }, 2300);
}

// ============================================
// PAGE NAVIGATION (scroll-based)
// ============================================

function updatePageButtons() {
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    pageInfo.textContent = `Pág ${currentPage} / ${totalPages}`;
}

function scrollToPage(pageNum) {
    const pageEl = document.getElementById(`page-${pageNum}`);
    if (pageEl) {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        currentPage = pageNum;
        updatePageButtons();
    }
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        scrollToPage(currentPage - 1);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        scrollToPage(currentPage + 1);
    }
});

// Track current page based on scroll position
function trackCurrentPage() {
    const pages = document.querySelectorAll('.pdf-page-wrapper');
    const viewportCenter = window.innerHeight / 2;
    
    let closestPage = 1;
    let closestDistance = Infinity;
    
    pages.forEach((page, index) => {
        const rect = page.getBoundingClientRect();
        const pageCenter = rect.top + rect.height / 2;
        const distance = Math.abs(pageCenter - viewportCenter);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPage = index + 1;
        }
    });
    
    if (closestPage !== currentPage) {
        currentPage = closestPage;
        updatePageButtons();
    }
}

window.addEventListener('scroll', trackCurrentPage);

// ============================================
// FACTURA DROPDOWN
// ============================================

(function initFacturaSelect() {
    var sel = document.getElementById('facturaSelect');
    if (!sel || typeof FACTURAS === 'undefined') return;

    FACTURAS.forEach(function(f) {
        var opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.label;
        sel.appendChild(opt);
    });

    // Seleccionar la que corresponde al PDF activo
    for (var i = 0; i < FACTURAS.length; i++) {
        if (FACTURAS[i].pdf === currentPdfUrl) { sel.value = FACTURAS[i].id; break; }
    }

    sel.addEventListener('change', function() {
        var f = getFacturaById(sel.value);
        loadPDF(f.pdf); // el QR no cambia; solo re-renderiza el PDF y reposiciona el overlay
    });

    // Ocultar el dropdown si hay una sola factura (no aporta)
    if (FACTURAS.length <= 1) sel.style.display = 'none';
})();

// ============================================
// INIT
// ============================================

generateQR();            // genera el QR una sola vez (deep-link desde la config)
loadPDF(currentPdfUrl);  // renderiza la factura activa
