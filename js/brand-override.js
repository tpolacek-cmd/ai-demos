// brand-override.js
// Carga overrides de marca desde localStorage y los aplica sobre el objeto BRAND.
// Debe cargarse DESPUES de brand-config.js y ANTES de que la pagina use BRAND.*.
// No modifica brand-config.js — solo sobreescribe valores en memoria.

(function() {
    var STORAGE_KEY = 'brandOverrides';

    // Deep merge: sobreescribe propiedades de target con source (1 nivel de nesting)
    function deepMerge(target, source) {
        for (var key in source) {
            if (!source.hasOwnProperty(key)) continue;
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
                && target[key] && typeof target[key] === 'object') {
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    // Leer overrides guardados
    function loadBrandOverrides() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.warn('brand-override: error leyendo localStorage', e);
            return null;
        }
    }

    // Guardar overrides actuales (solo los campos que difieren del default)
    function saveBrandOverrides(overrides) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
        } catch (e) {
            console.warn('brand-override: no se pudo guardar en localStorage', e);
        }
    }

    // Limpiar overrides (volver a defaults)
    function clearBrandOverrides() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('brand-override: error limpiando localStorage', e);
        }
    }

    // Detectar si hay overrides activos
    function hasBrandOverrides() {
        try {
            return localStorage.getItem(STORAGE_KEY) !== null;
        } catch (e) {
            return false;
        }
    }

    // Obtener los overrides raw (para el editor)
    function getBrandOverrides() {
        return loadBrandOverrides();
    }

    // Exportar config completa como JSON string
    function exportBrandConfig() {
        var exportable = {};
        for (var key in BRAND) {
            if (typeof BRAND[key] !== 'function' && BRAND.hasOwnProperty(key)) {
                exportable[key] = BRAND[key];
            }
        }
        return JSON.stringify(exportable, null, 2);
    }

    // Importar config desde JSON string
    function importBrandConfig(jsonString) {
        var parsed = JSON.parse(jsonString); // puede tirar error — el caller lo captura
        saveBrandOverrides(parsed);
        deepMerge(BRAND, parsed);
        // Re-aplicar colores al CSS
        if (typeof applyBrandColors === 'function') {
            applyBrandColors();
        }
    }

    // Aplicar overrides al objeto BRAND existente
    function applyOverrides() {
        var overrides = loadBrandOverrides();
        if (!overrides) return;
        deepMerge(BRAND, overrides);
    }

    // ============================================
    // PRESETS: Named brand configurations
    // ============================================

    // Obtener lista de presets guardados
    function getPresets() {
        try {
            var stored = localStorage.getItem('brandPresets');
            return stored ? JSON.parse(stored) : [];
        } catch (e) { return []; }
    }

    // Guardar preset nuevo (o actualizar si ya existe con ese nombre)
    function savePreset(name, overrides) {
        var presets = getPresets();
        var existing = presets.findIndex(function(p) { return p.name === name; });
        var preset = {
            name: name,
            createdAt: new Date().toISOString().split('T')[0],
            overrides: overrides
        };
        if (existing >= 0) {
            presets[existing] = preset;
        } else {
            presets.push(preset);
        }
        try {
            localStorage.setItem('brandPresets', JSON.stringify(presets));
        } catch (e) {
            console.warn('brand-override: no se pudo guardar presets en localStorage', e);
        }
        return preset;
    }

    // Activar un preset por nombre
    function activatePreset(name) {
        var presets = getPresets();
        var preset = presets.find(function(p) { return p.name === name; });
        if (!preset) return false;
        saveBrandOverrides(preset.overrides);
        try {
            localStorage.setItem('brandActivePreset', name);
        } catch (e) {
            console.warn('brand-override: no se pudo guardar preset activo', e);
        }
        return true;
    }

    // Eliminar un preset por nombre
    function deletePreset(name) {
        var presets = getPresets().filter(function(p) { return p.name !== name; });
        try {
            localStorage.setItem('brandPresets', JSON.stringify(presets));
            // Si el preset activo era este, limpiar
            if (localStorage.getItem('brandActivePreset') === name) {
                localStorage.removeItem('brandActivePreset');
            }
        } catch (e) {
            console.warn('brand-override: error eliminando preset', e);
        }
    }

    // Obtener nombre del preset activo
    function getActivePresetName() {
        try {
            return localStorage.getItem('brandActivePreset') || null;
        } catch (e) {
            return null;
        }
    }

    // Exponer API publica
    window.BrandOverride = {
        save: saveBrandOverrides,
        load: loadBrandOverrides,
        clear: clearBrandOverrides,
        has: hasBrandOverrides,
        get: getBrandOverrides,
        export: exportBrandConfig,
        import: importBrandConfig,
        apply: applyOverrides,
        STORAGE_KEY: STORAGE_KEY,
        presets: {
            list: getPresets,
            save: savePreset,
            activate: activatePreset,
            delete: deletePreset,
            getActive: getActivePresetName,
        }
    };

    // Auto-aplicar al cargar el script
    applyOverrides();
})();
