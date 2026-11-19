/**
 * KKRP Sewa Gudang (Warehouse Rental) - JavaScript Logic
 * Kompatibel dengan FiveM NUI dan SA-MP / open.mp CEF
 */

(function () {
    'use strict';

    // Data Katalog Unit Gudang
    const WAREHOUSE_UNITS = [
        {
            id: 1,
            name: 'Unit Gudang Starter (Depot A-1)',
            type: 'Small Storage',
            location: 'Willowfield Industrial Zone',
            capacityKg: 150,
            capacitySlots: 40,
            durationDays: 30,
            price: 5000,
            features: [
                'Pintu Kunci Digital PIN',
                'Kamera Pengawas CCTV 24 Jam',
                'Ventilasi Udara Kering'
            ]
        },
        {
            id: 2,
            name: 'Unit Gudang Standar (Depot B-4)',
            type: 'Standard Warehouse',
            location: 'Ocean Docks Logistics Bay',
            capacityKg: 300,
            capacitySlots: 80,
            durationDays: 30,
            price: 10000,
            features: [
                'Akses Keycard RFID Cerdas',
                'Sistem Alarm Kebakaran & Deteksi',
                'Pintu Baja Rolling Door Otomatis'
            ]
        },
        {
            id: 3,
            name: 'Unit Gudang Besar (Depot C-7)',
            type: 'Large Distribution Hub',
            location: 'Montgomery Freight Center',
            capacityKg: 600,
            capacitySlots: 150,
            durationDays: 30,
            price: 18000,
            features: [
                'Pengawasan Petugas Keamanan Khusus',
                'Ruang Penyimpanan Suhu Terkontrol',
                'Dermaga Bongkar Muat Truk Pribadi'
            ]
        },
        {
            id: 4,
            name: 'Unit Gudang Industri (Vault D-9)',
            type: 'Heavy Industrial Depot',
            location: 'Terminal Island Freezone',
            capacityKg: 1200,
            capacitySlots: 300,
            durationDays: 30,
            price: 30000,
            features: [
                'Proteksi Brankas Baja Anti-Ledakan',
                'Sensor Biometrik Sidik Jari',
                'Integrasi Sensor Gerak Inframerah'
            ]
        }
    ];

    let rentedUnitId = -1; // -1 = Tidak ada sewa
    let playerCash = 0;
    let selectedUnitForModal = null;
    let modalMode = 'rent'; // 'rent' or 'cancel'

    // DOM Elements
    const appWrapper = document.getElementById('warehouseApp');
    const unitsGrid = document.getElementById('unitsGrid');
    const citizenNameEl = document.getElementById('whCitizenName');
    const citizenCashEl = document.getElementById('whCitizenCash');
    const btnClose = document.getElementById('btnCloseWh');
    const statusPulse = document.getElementById('statusPulse');
    const currentRentalTitle = document.getElementById('currentRentalTitle');
    const currentRentalSub = document.getElementById('currentRentalSub');
    const bannerActions = document.getElementById('bannerActions');
    const rentalExpiryText = document.getElementById('rentalExpiryText');
    const btnGps = document.getElementById('btnGpsWarehouse');
    const btnCancelRental = document.getElementById('btnCancelRental');

    // Modal
    const confirmModal = document.getElementById('whConfirmModal');
    const modalTitle = document.getElementById('whModalTitle');
    const modalDesc = document.getElementById('whModalDesc');
    const btnModalCancel = document.getElementById('btnWhModalCancel');
    const btnModalConfirm = document.getElementById('btnWhModalConfirm');

    // Helper: Format Uang ($10,000)
    function formatMoney(amount) {
        return '$' + Number(amount).toLocaleString('en-US');
    }

    // Helper: Emit ke Game Engine
    function emitToGame(eventName, data) {
        if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.emit === 'function') {
            CefBridge.emit(eventName, data);
        } else if (typeof cef !== 'undefined' && cef && typeof cef.emit === 'function') {
            cef.emit(eventName, data);
        }

        try {
            if (window.GetParentResourceName) {
                fetch(`https://${GetParentResourceName()}/${eventName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    body: JSON.stringify(data || {})
                }).catch(() => {});
            }
        } catch (e) {}
    }

    // Render Banner Status Sewa
    function renderStatusBanner(remainingDays, usedWeight) {
        if (rentedUnitId !== -1) {
            const unit = WAREHOUSE_UNITS.find(u => u.id === rentedUnitId) || WAREHOUSE_UNITS[1];
            statusPulse.className = 'status-pulse active';
            currentRentalTitle.textContent = `Status Sewa: ${unit.name}`;
            currentRentalSub.textContent = `Lokasi: ${unit.location} | Terpakai: ${usedWeight || 0.0} / ${unit.capacityKg} kg`;
            rentalExpiryText.textContent = `Sisa Waktu: ${remainingDays || 30} Hari`;
            bannerActions.style.display = 'flex';
        } else {
            statusPulse.className = 'status-pulse';
            currentRentalTitle.textContent = 'Status Sewa: Belum Ada Gudang Aktif';
            currentRentalSub.textContent = 'Anda belum menyewa gudang penyimpanan. Pilih salah satu paket unit di bawah untuk mulai sewa.';
            bannerActions.style.display = 'none';
        }
    }

    // Render Grid Unit Gudang
    function renderUnits() {
        unitsGrid.innerHTML = '';

        WAREHOUSE_UNITS.forEach(unit => {
            const isRentedByMe = (rentedUnitId === unit.id);
            const card = document.createElement('div');
            card.className = `unit-card ${isRentedByMe ? 'active-unit' : ''}`;

            card.innerHTML = `
                <div>
                    <span class="unit-card-badge ${isRentedByMe ? 'badge-rented' : 'badge-available'}">
                        ${isRentedByMe ? 'Unit Aktif Anda' : 'Tersedia Disewa'}
                    </span>

                    <div class="unit-top-info">
                        <span class="unit-type-tag">${unit.type}</span>
                        <h3 class="unit-name">${unit.name}</h3>
                        <div class="unit-location">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="var(--primary-orange)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            <span>${unit.location}</span>
                        </div>
                    </div>

                    <div class="unit-specs-box">
                        <div class="spec-item">
                            <span class="spec-label">Kapasitas Berat</span>
                            <span class="spec-value">${unit.capacityKg} KG</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Kapasitas Slot</span>
                            <span class="spec-value">${unit.capacitySlots} Slot</span>
                        </div>
                    </div>

                    <ul class="unit-features-list">
                        ${unit.features.map(f => `
                            <li>
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                <span>${f}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div>
                    <div class="unit-price-row">
                        <div>
                            <span class="price-title">Biaya Sewa (30 Hari):</span>
                        </div>
                        <span class="price-val">${formatMoney(unit.price)}</span>
                    </div>

                    <button class="btn-rent-unit" data-unitid="${unit.id}">
                        ${isRentedByMe ? `
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            Sedang Digunakan
                        ` : `
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
                            Sewa Unit Ini
                        `}
                    </button>
                </div>
            `;

            const btnRent = card.querySelector('.btn-rent-unit');
            btnRent.addEventListener('click', () => {
                if (isRentedByMe) return;
                openRentModal(unit);
            });

            unitsGrid.appendChild(card);
        });
    }

    // Modal Konfirmasi Sewa
    function openRentModal(unit) {
        modalMode = 'rent';
        selectedUnitForModal = unit;
        modalTitle.textContent = 'Konfirmasi Penyewaan Gudang';
        modalDesc.innerHTML = `Anda akan menyewa <b>${unit.name}</b> (${unit.capacityKg} kg) dengan biaya sebesar <b style="color: #22c55e;">${formatMoney(unit.price)}</b> untuk durasi <b>30 Hari</b>. Lanjutkan transaksi?`;
        confirmModal.style.display = 'flex';
    }

    // Modal Konfirmasi Berhenti Sewa
    btnCancelRental.addEventListener('click', () => {
        if (rentedUnitId === -1) return;
        modalMode = 'cancel';
        modalTitle.textContent = 'Batalkan Kontrak Sewa';
        modalDesc.innerHTML = 'Apakah Anda yakin ingin berhenti menyewa gudang ini? Pastikan seluruh barang Anda di dalam brankas telah diambil sebelum membatalkan kontrak.';
        confirmModal.style.display = 'flex';
    });

    btnModalCancel.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        selectedUnitForModal = null;
    });

    btnModalConfirm.addEventListener('click', () => {
        confirmModal.style.display = 'none';

        if (modalMode === 'rent' && selectedUnitForModal) {
            const unit = selectedUnitForModal;
            rentedUnitId = unit.id;
            renderStatusBanner(30, 0);
            renderUnits();
            emitToGame('cef_onRentWarehouse', { unitId: unit.id, price: unit.price, name: unit.name });
        } else if (modalMode === 'cancel') {
            rentedUnitId = -1;
            renderStatusBanner();
            renderUnits();
            emitToGame('cef_onUnrentWarehouse', {});
        }
        selectedUnitForModal = null;
    });

    // Tombol Set GPS
    btnGps.addEventListener('click', () => {
        if (rentedUnitId === -1) return;
        const unit = WAREHOUSE_UNITS.find(u => u.id === rentedUnitId) || WAREHOUSE_UNITS[0];
        emitToGame('cef_onGpsWarehouse', { unitId: rentedUnitId, name: unit.name });
    });

    // Tutup UI
    function closeWarehouseUI() {
        appWrapper.style.display = 'none';
        confirmModal.style.display = 'none';
        emitToGame('cef_onWarehouseClose', {});
    }

    btnClose.addEventListener('click', closeWarehouseUI);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
            if (confirmModal.style.display === 'flex') {
                confirmModal.style.display = 'none';
            } else if (appWrapper.style.display !== 'none') {
                closeWarehouseUI();
            }
        }
    });

    // Update Data dari Game Engine
    function showWarehouse(payload) {
        payload = payload || {};
        if (payload.citizenName) citizenNameEl.textContent = payload.citizenName;
        if (typeof payload.cash !== 'undefined') {
            playerCash = payload.cash;
            citizenCashEl.textContent = `Saldo Tunai: ${formatMoney(playerCash)}`;
        }

        rentedUnitId = typeof payload.rentedUnitId !== 'undefined' ? payload.rentedUnitId : -1;
        const remainingDays = payload.remainingDays || 30;
        const usedWeight = payload.usedWeight || 0.0;

        renderStatusBanner(remainingDays, usedWeight);
        renderUnits();

        appWrapper.style.display = 'flex';
    }

    // Event Listener (FiveM & open.mp CEF)
    window.addEventListener('message', (event) => {
        const item = event.data;
        if (!item) return;

        if (item.action === 'warehouse:open' || item.action === 'openWarehouse') {
            showWarehouse(item.data || item);
        } else if (item.action === 'warehouse:close' || item.action === 'closeWarehouse') {
            appWrapper.style.display = 'none';
        }
    });

    if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.on === 'function') {
        CefBridge.on('cef:openWarehouse', (data) => {
            let parsed = data;
            if (typeof data === 'string') {
                try { parsed = JSON.parse(data); } catch(e) {}
            }
            showWarehouse(parsed);
        });

        CefBridge.on('cef:closeWarehouse', () => {
            appWrapper.style.display = 'none';
        });
    }

    // Inisialisasi awal (Preload: hidden)
    renderStatusBanner();
    renderUnits();

    // Mode Preview Mandiri di Browser
    if (!window.GetParentResourceName && (typeof cef === 'undefined' || !cef)) {
        document.body.classList.add('preview-mode');
        setTimeout(() => {
            showWarehouse({
                citizenName: 'Brenden Randall [ID: 24]',
                cash: 45000,
                rentedUnitId: 2,
                remainingDays: 28,
                usedWeight: 84.5
            });
        }, 300);
    }
})();
