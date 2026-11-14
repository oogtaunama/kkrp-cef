/**
 * Simple Orange Garage Controller (FiveM Style Context Menu)
 * Kota Kecilku Roleplay / open.mp CEF Interface
 */

const GarageApp = {
    state: {
        vehicles: [],
        garageName: 'Garasi Publik',
        isLoading: false
    },

    init() {
        console.log('[GarageApp] Simple Orange Garage module initialized.');
        this.bindEvents();

        if (typeof CefBridge !== 'undefined') {
            if (CefBridge.isAvailable()) {
                CefBridge.emit('cef_onGarageReady');
            } else {
                // Mode Dev Preview di luar game
                this.loadMockData();
            }
        }
    },

    bindEvents() {
        // 1. ESC to close
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.code === 'Escape') {
                e.preventDefault();
                this.close();
            }
        });

        // 2. CefBridge listeners
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

            // Tutup dari server
            CefBridge.on('cef:closeGarageUI', () => {
                this.hideUI();
            });

            // Respon spawn dari server
            CefBridge.on('cef:onSpawnResult', (success, message) => {
                this.state.isLoading = false;
                this.showToast(message || (success ? 'Kendaraan dikeluarkan.' : 'Gagal mengeluarkan kendaraan.'));
                if (success) {
                    setTimeout(() => {
                        this.hideUI();
                    }, 400);
                }
            });
        }
    },

    showUI() {
        document.body.classList.add('active');
        document.body.style.display = 'flex';
        const container = document.getElementById('garageContainer');
        if (container) container.style.display = 'flex';
    },

    hideUI() {
        document.body.classList.remove('active');
        document.body.style.display = 'none';
        const container = document.getElementById('garageContainer');
        if (container) container.style.display = 'none';
        this.state.isLoading = false;
    },

    setVehicles(vehicleList, garageName) {
        this.state.vehicles = Array.isArray(vehicleList) ? vehicleList : [];
        if (garageName) {
            this.state.garageName = garageName;
            const subtitle = document.getElementById('garageSubtitle');
            if (subtitle) subtitle.textContent = garageName;
        }

        const totalEl = document.getElementById('totalCount');
        if (totalEl) totalEl.textContent = `${this.state.vehicles.length} Unit`;

        this.renderVehicles();
        this.showUI();
    },

    renderVehicles() {
        const listEl = document.getElementById('vehicleList');
        if (!listEl) return;

        listEl.innerHTML = '';

        if (this.state.vehicles.length === 0) {
            listEl.innerHTML = `
                <div class="empty-card">
                    <i class="fa-solid fa-car-burst" style="font-size: 24px; margin-bottom: 6px; color: #6b7280;"></i>
                    <div>Tidak ada kendaraan di garasi ini.</div>
                </div>
            `;
            return;
        }

        this.state.vehicles.forEach(v => {
            const health = Math.max(0, Math.min(100, Math.round(Number(v.health) || 0)));
            const gLoc = v.location || this.state.garageName || 'Garasi';

            const card = document.createElement('div');
            card.className = 'vehicle-card';
            card.onclick = () => this.actionSpawn(v.id, v.plate, v.name);

            // Format card sesuai gambar referensi:
            // Line 1: Title (Vehicle Name)
            // Line 2: Name : ... | Plate : ... | Fuel/Health : ...% | Garage : ... | State : in
            card.innerHTML = `
                <div class="card-title">${this.escapeHtml(v.name)}</div>
                <div class="card-details">
                    Name : <span class="val">${this.escapeHtml(v.name)}</span> | 
                    Plate : <span class="highlight">${this.escapeHtml(v.plate)}</span> | 
                    Condition : <span class="val">${health}%</span> | 
                    Garage : <span class="val">${this.escapeHtml(gLoc)}</span> | 
                    State : <span class="highlight">in</span>
                </div>
            `;

            listEl.appendChild(card);
        });
    },

    actionSpawn(vehId, plate, name) {
        if (this.state.isLoading) return;
        this.state.isLoading = true;

        this.showToast(`Mengeluarkan ${name}...`);

        if (typeof CefBridge !== 'undefined') {
            CefBridge.emit('cef_onGarageSpawn', Number(vehId), String(plate || ''));
        }
    },

    close() {
        this.hideUI();
        if (typeof CefBridge !== 'undefined') {
            CefBridge.emit('cef_onGarageClose');
        }
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toastMsg');
        if (!toast || !msgEl) return;

        msgEl.textContent = message;
        toast.classList.add('active');

        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('active');
        }, 2200);
    },

    loadMockData() {
        const sampleVehicles = [
            { id: 1, name: "amg g65", category: "SUV", plate: "QZYX3149", health: 70, location: "F" },
            { id: 2, name: "Toyota Supra a90e", category: "Sports Coupe", plate: "RZXN6531", health: 22, location: "F" },
            { id: 3, name: "Karin Sultan RS", category: "Sports Sedan", plate: "SLS 8888", health: 98, location: "Public" },
            { id: 4, name: "Annis Elegy Retro", category: "Drift", plate: "DRIFT 77", health: 85, location: "Public" }
        ];
        this.setVehicles(sampleVehicles, 'Garasi Publik Los Santos');
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
