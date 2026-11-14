/**
 * CEF Frameless Progress Bar Controller
 * Kota Kecilku Roleplay / open.mp CEF Interface
 */

const ProgressApp = {
    totalSegments: 22,
    trackEl: null,
    textEl: null,
    percentEl: null,
    boxEl: null,
    segments: [],
    animFrameId: null,
    currentActionKey: '',

    init() {
        this.trackEl = document.getElementById('progTrack');
        this.textEl = document.getElementById('progText');
        this.percentEl = document.getElementById('progPercent');
        this.boxEl = document.getElementById('progBox');

        // Render segment chevron
        this.trackEl.innerHTML = '';
        this.segments = [];
        for (let i = 0; i < this.totalSegments; i++) {
            const seg = document.createElement('div');
            seg.className = 'chevron-item';
            this.trackEl.appendChild(seg);
            this.segments.push(seg);
        }

        this.bindEvents();

        // Tampilkan tombol tes hanya jika dibuka di luar game (browser dev)
        if (typeof CefBridge !== 'undefined' && !CefBridge.isAvailable()) {
            const devBar = document.getElementById('devTestBar');
            if (devBar) devBar.style.display = 'block';
        }

        console.log('[ProgressApp] Progress Bar CEF module ready.');
    },

    bindEvents() {
        // 1. Integrasi CefBridge (Pawn -> JS)
        if (typeof CefBridge !== 'undefined') {
            CefBridge.on('cef:showProgress', (text, durationMs, actionKey) => {
                this.showProgress(text, durationMs, actionKey);
            });

            CefBridge.on('cef:setProgress', (percent, text) => {
                this.setProgress(percent, text);
            });

            CefBridge.on('cef:hideProgress', () => {
                this.hideProgress();
            });
        }

        // 2. Direct window.cef hook (jika plugin memanggil langsung)
        if (typeof window !== 'undefined' && window.cef && typeof window.cef.on === 'function') {
            try {
                window.cef.on('showProgress', (text, duration, actionKey) => this.showProgress(text, duration, actionKey));
                window.cef.on('setProgress', (pct, text) => this.setProgress(pct, text));
                window.cef.on('hideProgress', () => this.hideProgress());
            } catch (e) {
                // Abaikan jika sudah di-handle CefBridge
            }
        }

        // 3. Fallback PostMessage
        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data) return;
            if (data.action === 'showProgress') {
                this.showProgress(data.text || 'Memproses...', data.duration || 3000, data.actionKey || '');
            } else if (data.action === 'setProgress') {
                this.setProgress(data.percent, data.text);
            } else if (data.action === 'hideProgress') {
                this.hideProgress();
            }
        });
    },

    setProgress(percent, text) {
        if (text && this.textEl) {
            this.textEl.textContent = text;
        }

        const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
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

        if (this.boxEl) {
            this.boxEl.style.display = 'block';
        }
    },

    showProgress(text, durationMs = 3000, actionKey = '') {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        this.currentActionKey = actionKey || '';
        this.setProgress(0, text || 'Memproses...');

        const startTime = performance.now();
        const duration = Math.max(200, Number(durationMs) || 3000);

        const frame = (now) => {
            const elapsed = now - startTime;
            const progressPct = Math.min(100, (elapsed / duration) * 100);

            this.setProgress(progressPct);

            if (progressPct < 100) {
                this.animFrameId = requestAnimationFrame(frame);
            } else {
                this.setProgress(100);
                this.animFrameId = null;

                // Beritahu Pawn bahwa progress selesai
                if (typeof CefBridge !== 'undefined') {
                    CefBridge.emit('cef_onProgressComplete', this.currentActionKey);
                }

                // Sembunyikan setelah jeda sedikit
                setTimeout(() => {
                    this.hideProgress();
                }, 350);
            }
        };

        this.animFrameId = requestAnimationFrame(frame);
    },

    hideProgress() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        if (this.boxEl) {
            this.boxEl.style.display = 'none';
        }
        // Emit ke Pawn bahwa progress ditutup
        if (typeof CefBridge !== 'undefined') {
            CefBridge.emit('cef_onProgressHidden');
        }
    },

    startTestAnimation() {
        this.showProgress('Memperbaiki Mesin Kendaraan...', 4500, 'repair_veh');
    }
};

// Global exports untuk kompatibilitas
window.setProgress = (pct, text) => ProgressApp.setProgress(pct, text);
window.showProgress = (text, duration, key) => ProgressApp.showProgress(text, duration, key);
window.hideProgress = () => ProgressApp.hideProgress();

document.addEventListener('DOMContentLoaded', () => {
    ProgressApp.init();
});
