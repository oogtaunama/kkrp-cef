/**
 * CEF Garage Module Controller
 * Kota Kecilku Roleplay / open.mp CEF Interface
 */

const GarageApp = {
    state: {
        vehicles: [],
        selectedId: null,
        garageName: 'Garasi Publik',
        isLoading: false
    },

    init() {
        console.log('[GarageApp] Initializing Garage CEF module...');
        this.initCanvasSparks();
        this.bindEvents();

        // Mode Dev Preview di luar game
        if (typeof CefBridge !== 'undefined' && !CefBridge.isAvailable()) {
            this.loadMockData();
        }
    },

    loadMockData() {
        const mockList = [
            { id: 1, name: "Karin Sultan RS", category: "Sports Sedan", plate: "POLISI • B 8888 SLS", health: 98, status: "garage", icon: "fa-car-rear", location: "Los Santos Downtown" },
            { id: 2, name: "Annis Elegy Retro", category: "Sports Drift", plate: "DRIFT • F 777 DRI", health: 82, status: "garage", icon: "fa-car-side", location: "Los Santos Downtown" },
            { id: 3, name: "Dinka Jester Classic", category: "Sports Coupe", plate: "SPEED • D 1234 JST", health: 100, status: "garage", icon: "fa-car", location: "Los Santos Downtown" },
            { id: 4, name: "Grotti Turismo R", category: "Hypercar", plate: "LUXE • B 999 TRM", health: 45, status: "garage", icon: "fa-gauge-high", location: "Los Santos Downtown" },
            { id: 5, name: "Pegassi NRG-500", category: "Racing Bike", plate: "MOTO • B 69 NRG", health: 95, status: "garage", icon: "fa-motorcycle", location: "Los Santos Downtown" }
        ];
        this.setVehicles(mockList, 'Garasi Publik Los Santos');
    },

    bindEvents() {
        // 1. ESC Key to close
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.code === 'Escape') {
                e.preventDefault();
                this.close();
            }
        });

        // 2. CefBridge listener (Pawn -> JS)
        if (typeof CefBridge !== 'undefined') {
            // Menerima data daftar kendaraan dari Pawn
            CefBridge.on('cef:setGarageVehicles', (dataJson, garageName) => {
                let parsedList = [];
                try {
                    parsedList = typeof dataJson === 'string' ? JSON.parse(dataJson) : dataJson;
                } catch (e) {
                    console.error('[GarageApp] Gagal parse JSON kendaraan:', e);
                }
                this.setVehicles(parsedList, garageName);
            });

            // Respon spawn sukses / gagal dari server
            CefBridge.on('cef:onSpawnResult', (success, message) => {
                this.state.isLoading = false;
                const btn = document.getElementById('btnSpawn');
                if (btn) btn.disabled = false;

                if (success) {
                    this.showToast('Berhasil', message || 'Kendaraan telah dikeluarkan dari garasi.');
                    setTimeout(() => {
                        this.close();
                    }, 1200);
                } else {
                    this.showToast('Gagal', message || 'Kendaraan gagal dikeluarkan.', true);
                }
            });
        }

        // 3. Direct window.cef hook jika ada
        if (typeof window !== 'undefined' && window.cef && typeof window.cef.on === 'function') {
            try {
                window.cef.on('setVehicles', (data, gName) => {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    this.setVehicles(parsed, gName);
                });
            } catch (e) {
                // Abaikan jika sudah di-handle CefBridge
            }
        }
    },

    setVehicles(vehicleList, garageName) {
        this.state.vehicles = Array.isArray(vehicleList) ? vehicleList : [];
        if (garageName) {
            this.state.garageName = garageName;
            const locEl = document.getElementById('previewLocation');
            if (locEl) locEl.textContent = garageName;
        }

        const totalEl = document.getElementById('totalCount');
        if (totalEl) totalEl.textContent = this.state.vehicles.length;

        if (this.state.vehicles.length > 0) {
            // Pilih item pertama jika belum ada yang terpilih atau yang terpilih tidak ada di list
            const exists = this.state.vehicles.some(v => v.id === this.state.selectedId);
            this.selectVehicle(exists ? this.state.selectedId : this.state.vehicles[0].id);
        } else {
            this.state.selectedId = null;
            this.renderEmpty();
        }
    },

    renderVehicles() {
        const listEl = document.getElementById('vehicleList');
        if (!listEl) return;

        listEl.innerHTML = '';

        this.state.vehicles.forEach(v => {
            const isSelected = v.id === this.state.selectedId;

            // Health color indicator
            const health = Math.max(0, Math.min(100, Math.round(Number(v.health) || 0)));
            let healthGradient = 'linear-gradient(90deg, #FF7A18, #FFB347)';
            if (health < 40) {
                healthGradient = 'linear-gradient(90deg, #ef4444, #f97316)';
            } else if (health < 75) {
                healthGradient = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
            }

            const item = document.createElement('div');
            item.className = `vehicle-item ${isSelected ? 'active' : ''}`;
            item.onclick = () => this.selectVehicle(v.id);

            const iconClass = v.icon || 'fa-car';

            item.innerHTML = `
                <div class="item-left">
                    <div class="item-icon-box">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div class="item-info">
                        <div class="item-info-top">
                            <span class="item-name">${this.escapeHtml(v.name)}</span>
                            <span class="item-health-pct">${health}%</span>
                        </div>
                        <div class="health-track">
                            <div class="health-fill" style="width: ${health}%; background: ${healthGradient};"></div>
                        </div>
                    </div>
                </div>
                <div class="item-arrow">
                    <i class="fa-solid fa-chevron-right"></i>
                </div>
            `;

            listEl.appendChild(item);
        });
    },

    renderEmpty() {
        const listEl = document.getElementById('vehicleList');
        if (listEl) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-car-burst"></i>
                    <p>Tidak ada kendaraan di garasi ini.</p>
                </div>
            `;
        }

        document.getElementById('previewName').textContent = '-';
        document.getElementById('previewCategory').textContent = 'KOSONG';
        document.getElementById('previewPlate').textContent = '-';
        document.getElementById('previewHealthText').textContent = '-';
        
        const btn = document.getElementById('btnSpawn');
        if (btn) btn.disabled = true;
    },

    selectVehicle(id) {
        this.state.selectedId = id;
        const v = this.state.vehicles.find(item => item.id === id);
        if (!v) return;

        document.getElementById('previewName').textContent = v.name || 'Kendaraan';
        document.getElementById('previewCategory').textContent = v.category || 'Kendaraan Pribadi';
        document.getElementById('previewPlate').textContent = v.plate || '-';

        const health = Math.max(0, Math.min(100, Math.round(Number(v.health) || 0)));
        document.getElementById('previewHealthText').textContent = health + '%';

        const iconEl = document.getElementById('previewIcon');
        if (iconEl) {
            iconEl.className = `fa-solid ${v.icon || 'fa-car'}`;
        }

        const btn = document.getElementById('btnSpawn');
        if (btn) btn.disabled = false;

        this.renderVehicles();
    },

    actionSpawn() {
        if (this.state.isLoading || !this.state.selectedId) return;

        const v = this.state.vehicles.find(item => item.id === this.state.selectedId);
        if (!v) return;

        this.state.isLoading = true;
        const btn = document.getElementById('btnSpawn');
        if (btn) btn.disabled = true;

        this.showToast('Memproses...', `Mengeluarkan ${v.name}...`);

        // Emit ke Pawn server
        if (typeof CefBridge !== 'undefined') {
            CefBridge.emit('cef_onGarageSpawn', Number(v.id), String(v.plate || ''));
        }
    },

    close() {
        console.log('[GarageApp] Closing garage...');
        // Beritahu Pawn server untuk sembunyikan browser dan lepas fokus kursor
        if (typeof CefBridge !== 'undefined') {
            CefBridge.emit('cef_onGarageClose');
        }
    },

    showToast(title, desc, isError = false) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        document.getElementById('toastTitle').textContent = title;
        document.getElementById('toastDesc').textContent = desc;

        const iconBox = toast.querySelector('.toast-icon i');
        if (iconBox) {
            iconBox.className = isError ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check';
        }

        toast.classList.add('active');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('active');
        }, 3200);
    },

    initCanvasSparks() {
        const canvas = document.getElementById('garageCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = 0, height = 0;

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        window.addEventListener('resize', resize);
        resize();

        // 16 spark particles ringan untuk performa 60FPS stabil di SA-MP
        const sparks = Array.from({ length: 16 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 0.8 + Math.random() * 1.2,
            vx: -0.1 + Math.random() * 0.2,
            vy: -0.3 - Math.random() * 0.7,
            alpha: 0.15 + Math.random() * 0.35
        }));

        function draw() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < sparks.length; i++) {
                const s = sparks[i];
                s.x += s.vx;
                s.y += s.vy;
                if (s.y < 0) {
                    s.y = height + 10;
                    s.x = Math.random() * width;
                }
                ctx.fillStyle = `rgba(255, 122, 24, ${s.alpha})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    GarageApp.init();
});
