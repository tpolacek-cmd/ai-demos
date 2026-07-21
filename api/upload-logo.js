// api/upload-logo.js
// Funcion serverless (Vercel) que recibe un logo (data URL en JSON) y lo sube
// al Blob store publico. Devuelve { url } con la URL hosteada del logo.
//
// Por que existe: el logo que un usuario sube en el builder vive solo en el
// navegador de esa computadora (es un data: URL, demasiado grande para el QR).
// Para que aparezca en el CELULAR que escanea el QR, el logo tiene que estar
// hosteado en una URL publica y corta. Esta funcion lo hostea en Vercel Blob.
//
// Auth: el store esta conectado al proyecto via OIDC, asi que @vercel/blob usa
// VERCEL_OIDC_TOKEN + BLOB_STORE_ID del entorno automaticamente. No hay token
// estatico en el codigo.

import { put } from '@vercel/blob';

// Lee el body como texto, tanto si Vercel ya lo parseo (req.body) como si viene
// crudo en el stream (fallback defensivo segun runtime).
async function readBody(req) {
    if (req.body != null) {
        if (typeof req.body === 'string') return req.body;
        if (typeof req.body === 'object') return JSON.stringify(req.body);
    }
    let raw = '';
    for await (const chunk of req) raw += chunk;
    return raw;
}

const MAX_BYTES = 4 * 1024 * 1024; // ~4MB: margen bajo el limite de body de Vercel

// Mapea el mime del data URL a una extension de archivo prolija.
function extFor(contentType) {
    const t = (contentType || '').toLowerCase();
    if (t.includes('svg')) return 'svg';
    if (t.includes('jpeg') || t.includes('jpg')) return 'jpg';
    if (t.includes('webp')) return 'webp';
    if (t.includes('gif')) return 'gif';
    return 'png';
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Metodo no permitido' });
        return;
    }
    try {
        const bodyText = await readBody(req);
        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (e) {
            res.status(400).json({ error: 'JSON invalido' });
            return;
        }

        const dataUrl = body && body.dataUrl;
        if (!dataUrl || typeof dataUrl !== 'string') {
            res.status(400).json({ error: 'Falta dataUrl' });
            return;
        }

        const m = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(dataUrl);
        if (!m) {
            res.status(400).json({ error: 'dataUrl mal formado' });
            return;
        }
        const contentType = m[1] || 'image/png';
        const isBase64 = !!m[2];
        const buffer = isBase64
            ? Buffer.from(m[3], 'base64')
            : Buffer.from(decodeURIComponent(m[3]), 'utf8');

        if (!buffer.length) {
            res.status(400).json({ error: 'Imagen vacia' });
            return;
        }
        if (buffer.length > MAX_BYTES) {
            res.status(413).json({ error: 'La imagen es demasiado grande (max 4MB)' });
            return;
        }

        // Nombre unico y publico. add-random-suffix asegura que no se pisen.
        const name = 'logos/logo.' + extFor(contentType);
        const opts = {
            access: 'public',
            contentType,
            addRandomSuffix: true,
        };
        // Auth: si hay RW token lo usa el SDK solo (via env). Si no, el store esta
        // conectado por OIDC -> pasamos VERCEL_OIDC_TOKEN + BLOB_STORE_ID explicitos.
        if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID) {
            opts.oidcToken = process.env.VERCEL_OIDC_TOKEN;
            opts.storeId = process.env.BLOB_STORE_ID;
        }
        const blob = await put(name, buffer, opts);

        res.status(200).json({ url: blob.url });
    } catch (e) {
        res.status(500).json({ error: String((e && e.message) || e) });
    }
}
