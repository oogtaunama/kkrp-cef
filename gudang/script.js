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

    // Action Bar Sewa Gudang (Pilih Unit)
    const actionUnitTag = document.getElementById('actionUnitTag');
    const actionUnitTitle = document.getElementById('actionUnitTitle');
    const actionUnitSpecs = document.getElementById('actionUnitSpecs');
    const actionPriceBox = document.getElementById('actionPriceBox');
    const actionPriceVal = document.getElementById('actionPriceVal');
    const btnMainRent = document.getElementById('btnMainRent');
    const btnMainRentText = document.getElementById('btnMainRentText');
    let selectedUnit = null;

    // Helper Focus Management (Penting agar mouse CEF bisa di-klik di GTA SA / open.mp)
    function captureFocus(focused = true) {
        try {
            if (typeof CefBridge !== 'undefined' && typeof CefBridge.setFocus === 'function') {
                CefBridge.setFocus(focused);
            }
        } catch (e) {}

        try {
            if (typeof cef !== 'undefined' && cef && typeof cef.set_focus === 'function') {
                cef.set_focus(focused);
            }
        } catch (e) {}
    }

    // Helper: Format Uang ($10,000)
    function formatMoney(amount) {
        return '$' + Number(amount).toLocaleString('en-US');
    }

    // Helper: Emit ke Game Engine
    function emitToGame(eventName, ...args) {
        if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.emit === 'function') {
            CefBridge.emit(eventName, ...args);
        } else if (typeof cef !== 'undefined' && cef && typeof cef.emit === 'function') {
            cef.emit(eventName, ...args);
        }

        try {
            if (window.GetParentResourceName) {
                const payload = args.length === 1 ? args[0] : args;
                fetch(`https://${GetParentResourceName()}/${eventName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    body: JSON.stringify(payload || {})
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

    // Fungsi Pilih Unit Gudang (Munculkan Detail & Tombol Sewa)
    function selectWarehouseUnit(unit) {
        if (!unit) return;
        selectedUnit = unit;
        selectedUnitForModal = unit;

        // Berikan highlight class 'selected' pada kartu yang dipilih
        document.querySelectorAll('.unit-card').forEach(c => {
            if (Number(c.getAttribute('data-unitid')) === unit.id) {
                c.classList.add('selected');
            } else {
                c.classList.remove('selected');
            }
        });

        // Update Action Bar di bagian bawah
        if (actionUnitTag) actionUnitTag.textContent = `UNIT TERPILIH (#${unit.id} • ${unit.type.toUpperCase()})`;
        if (actionUnitTitle) actionUnitTitle.textContent = unit.name;
        if (actionUnitSpecs) actionUnitSpecs.textContent = `${unit.location} • Kapasitas: ${unit.capacityKg} KG (${unit.capacitySlots} Slot)`;

        if (actionPriceBox) actionPriceBox.style.display = 'flex';
        if (actionPriceVal) actionPriceVal.textContent = formatMoney(unit.price);

        if (btnMainRent && btnMainRentText) {
            if (rentedUnitId === unit.id) {
                btnMainRent.classList.add('disabled');
                btnMainRent.setAttribute('disabled', 'disabled');
                btnMainRent.disabled = true;
                btnMainRentText.textContent = 'Unit Ini Sedang Anda Sewa';
            } else {
                btnMainRent.classList.remove('disabled');
                btnMainRent.removeAttribute('disabled');
                btnMainRent.disabled = false;
                btnMainRentText.textContent = `Sewa ${unit.name} (${formatMoney(unit.price)})`;
            }
        }
    }

    // Render Grid Unit Gudang
    function renderUnits() {
        unitsGrid.innerHTML = '';

        WAREHOUSE_UNITS.forEach(unit => {
            const isRentedByMe = (rentedUnitId === unit.id);
            const isSelected = selectedUnit ? (selectedUnit.id === unit.id) : false;
            const card = document.createElement('div');
            card.className = `unit-card ${isRentedByMe ? 'active-unit' : ''} ${isSelected ? 'selected' : ''}`;
            card.setAttribute('data-unitid', unit.id);

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
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                            Pilih & Sewa Unit Ini
                        `}
                    </button>
                </div>
            `;

            // Klik kartu untuk memilih unit gudang
            card.addEventListener('click', () => {
                selectWarehouseUnit(unit);
            });

            // Klik tombol langsung pada kartu
            const btnRent = card.querySelector('.btn-rent-unit');
            btnRent.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                selectWarehouseUnit(unit);
                if (isRentedByMe) return;
                openRentModal(unit);
            });

            unitsGrid.appendChild(card);
        });

        // Pilih unit pertama secara default jika belum ada yang terpilih
        if (!selectedUnit && WAREHOUSE_UNITS.length > 0) {
            selectWarehouseUnit(WAREHOUSE_UNITS[0]);
        }
    }
    }

    // Modal Konfirmasi Sewa
    function openRentModal(unit) {
        modalMode = 'rent';
        selectedUnitForModal = unit;
        modalTitle.textContent = 'Konfirmasi Penyewaan Gudang';
        modalDesc.innerHTML = `Anda akan menyewa <b>${unit.name}</b> (${unit.capacityKg} kg) dengan biaya sebesar <b style="color: #22c55e;">${formatMoney(unit.price)}</b> untuk durasi <b>30 Hari</b>. Lanjutkan transaksi?`;
        confirmModal.style.display = 'flex';
        captureFocus(true);
    }

    // Tombol Utama Sewa Gudang (dari Action Bar Terpilih)
    if (btnMainRent) {
        btnMainRent.addEventListener('click', (e) => {
            e.preventDefault();
            if (selectedUnit && rentedUnitId !== selectedUnit.id) {
                openRentModal(selectedUnit);
            }
        });
    }

    // Modal Konfirmasi Berhenti Sewa
    btnCancelRental.addEventListener('click', (e) => {
        e.preventDefault();
        if (rentedUnitId === -1) return;
        modalMode = 'cancel';
        modalTitle.textContent = 'Batalkan Kontrak Sewa';
        modalDesc.innerHTML = 'Apakah Anda yakin ingin berhenti menyewa gudang ini? Pastikan seluruh barang Anda di dalam brankas telah diambil sebelum membatalkan kontrak.';
        confirmModal.style.display = 'flex';
        captureFocus(true);
    });

    btnModalCancel.addEventListener('click', (e) => {
        e.preventDefault();
        confirmModal.style.display = 'none';
        selectedUnitForModal = null;
    });

    btnModalConfirm.addEventListener('click', (e) => {
        e.preventDefault();
        confirmModal.style.display = 'none';

        if (modalMode === 'rent' && selectedUnitForModal) {
            const unit = selectedUnitForModal;
            rentedUnitId = unit.id;
            if (!isGameClient()) {
                playerCash = Math.max(0, (playerCash || 45000) - unit.price);
                citizenCashEl.textContent = `Saldo Tunai: ${formatMoney(playerCash)}`;
            }
            renderStatusBanner(30, 0);
            renderUnits();
            // Kirim integer unitId dan integer price sesuai Argument_Integer di Pawn
            emitToGame('cef_onRentWarehouse', parseInt(unit.id, 10), parseInt(unit.price, 10));
        } else if (modalMode === 'cancel') {
            rentedUnitId = -1;
            renderStatusBanner();
            renderUnits();
            emitToGame('cef_onUnrentWarehouse');
        }
        selectedUnitForModal = null;
    });

    // Tombol Set GPS
    btnGps.addEventListener('click', (e) => {
        e.preventDefault();
        if (rentedUnitId === -1) return;
        emitToGame('cef_onGpsWarehouse', parseInt(rentedUnitId, 10));
        if (!isGameClient()) {
            alert('GPS Checkpoint disetel ke lokasi unit gudang Anda!');
        }
    });

    // Deteksi apakah sedang berjalan di dalam engine game (CEF open.mp / FiveM)
    const isGameClient = () => {
        return !!(
            (typeof window.GetParentResourceName === 'function') ||
            (typeof cef !== 'undefined' && cef !== null) ||
            (typeof window.cef !== 'undefined' && window.cef !== null)
        );
    };

    function showReopenBtn() {
        let btn = document.getElementById('previewReopenBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'previewReopenBtn';
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
                Buka Kembali UI Sewa Gudang (Pratinjau)
            `;
            btn.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                background: linear-gradient(135deg, #ff9e44, #ff7a18);
                color: #0c0e12;
                font-family: 'Inter', sans-serif;
                font-weight: 700;
                font-size: 14px;
                border: none;
                border-radius: 30px;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(255, 122, 24, 0.4);
                z-index: 99999;
                transition: transform 0.2s, box-shadow 0.2s;
            `;
            btn.addEventListener('mouseenter', () => btn.style.transform = 'translateX(-50%) scale(1.05)');
            btn.addEventListener('mouseleave', () => btn.style.transform = 'translateX(-50%) scale(1)');
            btn.addEventListener('click', () => {
                btn.remove();
                showWarehouse({
                    citizenName: 'Brenden Randall [ID: 24]',
                    cash: playerCash || 45000,
                    rentedUnitId: rentedUnitId,
                    remainingDays: 28,
                    usedWeight: 84.5
                });
            });
            document.body.appendChild(btn);
        }
    }

    // Tutup UI
    function closeWarehouseUI() {
        appWrapper.style.display = 'none';
        confirmModal.style.display = 'none';
        captureFocus(false);
        emitToGame('cef_onWarehouseClose');

        // Jika dibuka di browser web biasa (bukan game), tampilkan tombol buka kembali
        if (!isGameClient()) {
            showReopenBtn();
        }
    }

    btnClose.addEventListener('click', (e) => {
        e.preventDefault();
        closeWarehouseUI();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
            e.preventDefault();
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
            playerCash = Number(payload.cash);
            citizenCashEl.textContent = `Saldo Tunai: ${formatMoney(playerCash)}`;
        }

        rentedUnitId = typeof payload.rentedUnitId !== 'undefined' ? Number(payload.rentedUnitId) : -1;
        const remainingDays = payload.remainingDays || 30;
        const usedWeight = payload.usedWeight || 0.0;

        renderStatusBanner(remainingDays, usedWeight);
        renderUnits();

        if (selectedUnit) {
            selectWarehouseUnit(selectedUnit);
        } else if (WAREHOUSE_UNITS.length > 0) {
            selectWarehouseUnit(WAREHOUSE_UNITS[0]);
        }

        document.body.classList.add('active');
        appWrapper.style.display = 'flex';
        // Aktifkan kursor & tangkap input mouse CEF jika di dalam game
        captureFocus(true);
    }

    // Inisialisasi Bridge
    function setupBridge() {
        // Beritahu game engine bahwa JS sudah siap menerima data
        emitToGame('cef_onWarehouseReady');

        if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.on === 'function') {
            CefBridge.on('cef:openWarehouse', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                showWarehouse(parsed);
            });

            CefBridge.on('cef:setWarehouseData', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                showWarehouse(parsed);
            });

            CefBridge.on('cef:closeWarehouse', () => {
                appWrapper.style.display = 'none';
                captureFocus(false);
            });
        }

        // Event Listener (FiveM & window.cef event)
        window.addEventListener('message', (event) => {
            const item = event.data;
            if (!item) return;

            if (item.action === 'warehouse:open' || item.action === 'openWarehouse') {
                showWarehouse(item.data || item);
            } else if (item.action === 'warehouse:close' || item.action === 'closeWarehouse') {
                appWrapper.style.display = 'none';
                captureFocus(false);
            }
        });
    }

    // Inisialisasi awal
    renderStatusBanner();
    renderUnits();
    setupBridge();

    // Jika di dalam engine game (CEF / FiveM), atur in-game state
    if (isGameClient()) {
        document.body.classList.add('in-game');
    } else {
        // Jika dibuka di browser web biasa (GitHub Pages, Edge, Chrome), langsung aktifkan preview
        document.body.classList.add('preview-mode');
        document.documentElement.classList.add('preview-mode');
        showWarehouse({
            citizenName: 'Brenden Randall [ID: 24]',
            cash: 45000,
            rentedUnitId: 2,
            remainingDays: 28,
            usedWeight: 84.5
        });
    }
})();
