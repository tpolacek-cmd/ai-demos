// PDF.js configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const PDF_URL = (typeof BRAND !== 'undefined' && BRAND.invoicePdf) ? BRAND.invoicePdf : 'assets/brand/factura.pdf';
const QR_TARGET_PAGE = 2; // Page where we overlay the QR

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

async function loadPDF() {
    try {
        pdfDoc = await pdfjsLib.getDocument(PDF_URL).promise;
        totalPages = pdfDoc.numPages;
        
        pageInfo.textContent = `Pág 1 / ${totalPages}`;
        
        // Render all pages
        for (let i = 1; i <= totalPages; i++) {
            await renderPage(i);
        }
        
        // Hide loading
        pdfLoading.style.display = 'none';
        
        // Position QR overlay on page 2
        positionQROverlay();
        
        // Generate QR code
        generateQR();
        
        // Update button states
        updatePageButtons();
        
    } catch (error) {
        console.error('Error loading PDF:', error);
        pdfLoading.innerHTML = `
            <p style="color: #ff6b6b;">Error al cargar la factura</p>
            <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 8px;">${error.message}</p>
        `;
    }
}

async function renderPage(pageNum) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: scale });
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-page-wrapper';
    wrapper.id = `page-${pageNum}`;
    wrapper.dataset.page = pageNum;
    wrapper.style.width = viewport.width + 'px';
    wrapper.style.height = viewport.height + 'px';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Page number label
    const pageLabel = document.createElement('div');
    pageLabel.className = 'page-number-label';
    pageLabel.textContent = `Página ${pageNum} de ${totalPages}`;
    
    wrapper.appendChild(canvas);
    wrapper.appendChild(pageLabel);
    pdfPages.appendChild(wrapper);
    
    // Store reference
    pageCanvases.push(wrapper);
    
    // Render
    await page.render({
        canvasContext: ctx,
        viewport: viewport
    }).promise;
}

// ============================================
// QR OVERLAY POSITIONING
// ============================================

function positionQROverlay() {
    const page2Wrapper = document.getElementById(`page-${QR_TARGET_PAGE}`);
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
    qrOverlay.style.top = (offsetTop + pageHeight * 0.52) + 'px';
    qrOverlay.style.left = '50%';
    qrOverlay.style.transform = 'translateX(-50%)';
}

// Reposition on resize
window.addEventListener('resize', () => {
    positionQROverlay();
});

// ============================================
// QR CODE GENERATION
// ============================================

function generateQR() {
    // Build checkout URL dynamically
    const baseUrl = window.location.origin + window.location.pathname.replace('qr.html', '');
    const checkoutUrl = `${baseUrl}checkout.html?flow=curp-deeplink&source=qr`;
    
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
    
    // Redirect after animation
    setTimeout(() => {
        window.location.href = getNextPageUrl('arrival');
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
// INIT
// ============================================

loadPDF();
