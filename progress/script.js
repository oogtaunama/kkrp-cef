/**
 * CEF Frameless Chevron Progress Bar Controller
 * Kota Kecilku Roleplay / open.mp CEF Interface
 */

const ProgressApp = {
    totalSegments: 22,
    trackEl: null,
    textEl: null,
    percentEl: null,
    boxEl: null,
    segments: [],
    
    // Smooth Animation State
    currentPercent: 0,
    targetPercent: 0,
    animFrameId: null,
    activityTitle: 'MEMPROSES...',

    init() {
        this.trackEl = document.getElementById('progTrack');
        this.textEl = document.getElementById('progText');
        this.percentEl = document.getElementById('progPercent');
        this.boxEl = document.getElementById('progBox');

        // Render 22 Chevron segments
        if (this.trackEl) {
            this.trackEl.innerHTML = '';
            this.segments = [];
            for (let i = 0; i < this.totalSegments; i++) {
                const seg = document.createElement('div');
                seg.className = 'chevron-item';
                this.trackEl.appendChild(seg);
                this.segments.push(seg);
            }
        }

        this.bindEvents();
        this.startSmoothLoop();

        if (typeof CefBridge !== 'undefined' && !CefBridge.isAvailable()) {
            const devBar = document.getElementById('devTestBar');
            if (devBar) devBar.style.display = 'block';
        }

        console.log('[ProgressApp] Ultra Smooth Progress Bar ready.');
    },

    cleanText(str) {
        if (!str) return '';
        let text = String(str);
        if (text.startsWith('{') && text.endsWith('}')) {
            try {
                const parsed = JSON.parse(text);
                text = parsed.text || parsed.title || parsed.label || text;
            } catch (e) {}
        }
        // Hapus kode warna SA-MP {RRGGBB}
        text = text.replace(/\{[A-Fa-f0-9]{6}\}/g, '');
        // Hapus kode format GTA ~r~, ~g~, ~b~, ~w~, ~y~, ~h~ dll.
        text = text.replace(/~[a-z0-9]~/gi, '');
        // Hapus tag literal jika bocor
        text = text.replace(/oogtaunama/gi, '');
        text = text.replace(/adminname/gi, '');
        text = text.trim();
        if (text === '_' || text.toLowerCase() === 'none' || text === '-' || text.toLowerCase() === 'null') return '';
        return text;
    },

    bindEvents() {
        const handleOpen = (payload) => this.openProgress(payload);
        const handleSet = (pct, text) => this.setTargetProgress(pct, text);
        const handleHide = () => this.hideProgress();

        if (typeof CefBridge !== 'undefined') {
            CefBridge.on('cef:openProgress', handleOpen);
            CefBridge.on('openProgress', handleOpen);

            CefBridge.on('cef:setProgress', handleSet);
            CefBridge.on('setProgress', handleSet);

            CefBridge.on('cef:hideProgress', handleHide);
            CefBridge.on('hideProgress', handleHide);

            CefBridge.on('cef:showProgress', (text, durationMs, actionKey) => {
                this.showProgressWithDuration(text, durationMs, actionKey);
            });
            CefBridge.on('showProgress', (text, durationMs, actionKey) => {
                this.showProgressWithDuration(text, durationMs, actionKey);
            });
        }

        // Direct window.cef hook
        if (typeof window !== 'undefined' && window.cef && typeof window.cef.on === 'function') {
            try {
                window.cef.on('cef:openProgress', handleOpen);
                window.cef.on('openProgress', handleOpen);
                window.cef.on('cef:setProgress', handleSet);
                window.cef.on('setProgress', handleSet);
                window.cef.on('cef:hideProgress', handleHide);
                window.cef.on('hideProgress', handleHide);
            } catch (e) {}
        }
    },

    openProgress(payload) {
        let text = payload;
        if (typeof payload === 'string' && (payload.startsWith('{') || payload.startsWith('['))) {
            try {
                const parsed = JSON.parse(payload);
                text = parsed.text || parsed.title || parsed.label || payload;
            } catch (e) {}
        } else if (typeof payload === 'object' && payload !== null) {
            text = payload.text || payload.title || payload.label || 'MEMPROSES...';
        }

        const title = this.cleanText(text) || 'MEMPROSES...';
        this.activityTitle = title;
        if (this.textEl) this.textEl.textContent = title;
        
        this.currentPercent = 0;
        this.targetPercent = 0;
        this.renderVisuals(0);

        if (this.boxEl) this.boxEl.style.display = 'block';
    },

    setTargetProgress(percent, text) {
        let p = percent;
        let t = text;

        if (typeof p === 'string' && (p.startsWith('{') || p.startsWith('['))) {
            try {
                const parsed = JSON.parse(p);
                p = parsed;
            } catch (e) {}
        }

        if (typeof p === 'object' && p !== null) {
            if (p.percent !== undefined || p.pct !== undefined || p.progress !== undefined) {
                t = p.text || p.title || p.label || t;
                p = p.percent ?? p.pct ?? p.progress;
            } else if (Array.isArray(p)) {
                t = p[1] || t;
                p = p[0];
            }
        }

        if (t) {
            const clean = this.cleanText(t);
            if (clean && clean !== 'MEMPROSES...') {
                this.activityTitle = clean;
                if (this.textEl) this.textEl.textContent = clean;
            } else if (clean && (!this.activityTitle || this.activityTitle === 'MEMPROSES...')) {
                this.activityTitle = clean;
                if (this.textEl) this.textEl.textContent = clean;
            }
        }

        const num = parseFloat(p);
        if (!isNaN(num) && num >= 0) {
            this.targetPercent = Math.max(0, Math.min(100, num));
            if (num === 0) {
                this.currentPercent = 0;
                this.renderVisuals(0);
            }
        }

        if (this.boxEl) this.boxEl.style.display = 'block';
    },

    hideProgress() {
        this.currentPercent = 0;
        this.targetPercent = 0;
        if (this.boxEl) this.boxEl.style.display = 'none';
        this.renderVisuals(0);
    },

    startSmoothLoop() {
        const loop = () => {
            if (this.boxEl && this.boxEl.style.display !== 'none') {
                const diff = this.targetPercent - this.currentPercent;
                if (Math.abs(diff) > 0.05) {
                    // Fluid lerp transisi halus mengikuti tick server
                    this.currentPercent += diff * 0.15;
                    this.renderVisuals(this.currentPercent);
                } else if (this.currentPercent !== this.targetPercent) {
                    this.currentPercent = this.targetPercent;
                    this.renderVisuals(this.currentPercent);
                }
            }
            this.animFrameId = requestAnimationFrame(loop);
        };
        this.animFrameId = requestAnimationFrame(loop);
    },

    renderVisuals(percent) {
        const clamped = Math.max(0, Math.min(100, percent));
        if (this.percentEl) {
            this.percentEl.textContent = Math.round(clamped) + '%';
        }

        const activeCount = Math.round((clamped / 100) * this.totalSegments);
        for (let i = 0; i < this.segments.length; i++) {
            if (i < activeCount) {
                this.segments[i].classList.add('active');
            } else {
                this.segments[i].classList.remove('active');
            }
        }
    },

    showProgressWithDuration(text, durationMs = 3000, actionKey = '') {
        this.openProgress(text);
        const duration = Math.max(300, Number(durationMs) || 3000);
        const startTime = performance.now();

        const animStep = (now) => {
            if (!this.boxEl || this.boxEl.style.display === 'none') return;
            const elapsed = now - startTime;
            const pct = Math.min(100, (elapsed / duration) * 100);

            this.targetPercent = pct;

            if (pct < 100) {
                requestAnimationFrame(animStep);
            } else {
                this.targetPercent = 100;
                this.currentPercent = 100;
                this.renderVisuals(100);
                setTimeout(() => {
                    this.hideProgress();
                    if (typeof CefBridge !== 'undefined') {
                        CefBridge.emit('cef_onProgressComplete', actionKey);
                    }
                }, 300);
            }
        };
        requestAnimationFrame(animStep);
    },

    startTestAnimation() {
        this.showProgressWithDuration('MENAMBANG', 5000, 'miner');
    }
};

window.setProgress = (pct, text) => ProgressApp.setTargetProgress(pct, text);
window.showProgress = (text, duration, key) => ProgressApp.showProgressWithDuration(text, duration, key);
window.hideProgress = () => ProgressApp.hideProgress();

document.addEventListener('DOMContentLoaded', () => {
    ProgressApp.init();
});
