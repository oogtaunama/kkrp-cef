/**
 * KKRP Police MDT (Mobile Data Terminal) - JavaScript Logic
 * Kompatibel dengan FiveM NUI dan SA-MP / open.mp CEF
 */

(function () {
    'use strict';

    // Database Mock Warga
    const CITIZEN_DB = [
        {
            id: 24,
            name: 'Brenden Randall',
            ktp: 'KTP-109482',
            job: 'Petani (Farmer)',
            phone: '555-0192',
            driverLic: true,
            gunLic: false,
            warrant: false,
            records: [
                {
                    title: 'Pelanggaran Batas Kecepatan (Speeding)',
                    date: '14/11/2026',
                    desc: 'Melaju 140 km/jam di zona pemukiman Marina Boulevard. Diberikan sanksi tilang administrasi.',
                    officer: 'Ofc. Nathan Hayes',
                    fine: '$1,500'
                },
                {
                    title: 'Menerobos Lampu Merah (Traffic Violation)',
                    date: '10/11/2026',
                    desc: 'Mengabaikan rambu lalu lintas di perempatan Pershing Square.',
                    officer: 'Ofc. Sarah Miller',
                    fine: '$500'
                }
            ]
        },
        {
            id: 88,
            name: 'Marcus Brody',
            ktp: 'KTP-004812',
            job: 'Pengangguran',
            phone: '555-0811',
            driverLic: false,
            gunLic: false,
            warrant: true,
            records: [
                {
                    title: 'DPO: Pembunuhan Berencana & Perampokan',
                    date: '18/11/2026',
                    desc: 'Tersangka penembakan mematikan di Idlewood. Membawa senjata api laras panjang.',
                    officer: 'Capt. Nathan Hayes',
                    fine: 'Jail: 120 Bulan + $25,000'
                }
            ]
        }
    ];

    // Database Mock Kendaraan
    const VEHICLE_DB = [
        {
            plate: 'LS-4928',
            model: 'Sultan Sedan 2.5L Turbo',
            owner: 'Brenden Randall',
            color: 'Midnight Black / Orange Pearl',
            tax: true,
            stolen: false,
            bolo: false,
            records: [
                {
                    title: 'Pemeriksaan Rutin Traffic Stop',
                    date: '12/11/2026',
                    desc: 'Kendaraan dihentikan di Commerce Avenue. Surat-surat lengkap, tidak ditemukan barang ilegal.',
                    officer: 'Unit 2-Adam (Ofc. Nathan Hayes)',
                    status: 'Dilepaskan'
                }
            ]
        },
        {
            plate: 'LS-6699',
            model: 'Buffalo S Muscle V8',
            owner: 'Marcus Brody',
            color: 'Matte Black',
            tax: false,
            stolen: true,
            bolo: true,
            records: [
                {
                    title: 'Pengejaran Kendaraan (10-80 Pursuit)',
                    date: '19/11/2026',
                    desc: 'Melarikan diri dari TKP perampokan bank Palomino Creek. Sangat berbahaya.',
                    officer: 'Sergeant Davis',
                    status: 'BOLO AKTIF'
                }
            ]
        }
    ];

    // DOM Elements
    const appWrapper = document.getElementById('mdtApp');
    const officerNameEl = document.getElementById('officerName');
    const officerRankEl = document.getElementById('officerRank');
    const btnClose = document.getElementById('btnCloseMdt');
    const clockEl = document.getElementById('mdtClock');
    const navTabs = document.querySelectorAll('.nav-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Citizen Search Elements
    const citizenSearchInput = document.getElementById('citizenSearchQuery');
    const btnSearchCitizen = document.getElementById('btnSearchCitizen');
    const citDetailName = document.getElementById('citDetailName');
    const citDetailId = document.getElementById('citDetailId');
    const citDetailJob = document.getElementById('citDetailJob');
    const citDetailPhone = document.getElementById('citDetailPhone');
    const citDetailDriverLic = document.getElementById('citDetailDriverLic');
    const citDetailGunLic = document.getElementById('citDetailGunLic');
    const citDetailWarrant = document.getElementById('citDetailWarrant');
    const citRecordCount = document.getElementById('citRecordCount');
    const citRecordsList = document.getElementById('citRecordsList');
    const btnAddCitation = document.getElementById('btnAddCitation');

    // Vehicle Search Elements
    const vehSearchInput = document.getElementById('vehSearchQuery');
    const btnSearchVehicle = document.getElementById('btnSearchVehicle');
    const vehPlateTitle = document.getElementById('vehPlateTitle');
    const vehModelTitle = document.getElementById('vehModelTitle');
    const vehOwner = document.getElementById('vehOwner');
    const vehColor = document.getElementById('vehColor');
    const vehTaxStatus = document.getElementById('vehTaxStatus');
    const vehStolenStatus = document.getElementById('vehStolenStatus');
    const vehBoloStatus = document.getElementById('vehBoloStatus');
    const vehRecordsList = document.getElementById('vehRecordsList');
    const btnToggleStolen = document.getElementById('btnToggleStolen');
    const btnStolenText = document.getElementById('btnStolenText');

    // Modal Elements
    const mdtModal = document.getElementById('mdtModal');
    const mdtModalTitle = document.getElementById('mdtModalTitle');
    const modalInputTarget = document.getElementById('modalInputTarget');
    const modalInputTitle = document.getElementById('modalInputTitle');
    const modalInputDesc = document.getElementById('modalInputDesc');
    const modalInputFine = document.getElementById('modalInputFine');
    const btnMdtModalCancel = document.getElementById('btnMdtModalCancel');
    const btnMdtModalSubmit = document.getElementById('btnMdtModalSubmit');

    let currentSearchedVehicle = null;

    // Helper Focus Management
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

    // Helper Emit ke Game Engine
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

    // Live Jam MDT
    function updateClock() {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0] + ' UTC';
        if (clockEl) clockEl.textContent = timeStr;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Navigasi Tab
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            navTabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const activePane = document.getElementById(`pane-${target}`);
            if (activePane) activePane.classList.add('active');
        });
    });

    // Cari Warga
    function displayCitizen(cit) {
        citDetailName.textContent = cit.name;
        citDetailId.textContent = `ID: ${cit.id} • ${cit.ktp}`;
        citDetailJob.textContent = cit.job;
        citDetailPhone.textContent = cit.phone;

        citDetailDriverLic.textContent = cit.driverLic ? 'Aktif' : 'Tidak Ada / Ditahan';
        citDetailDriverLic.className = cit.driverLic ? 'meta-val val-green' : 'meta-val val-red';

        citDetailGunLic.textContent = cit.gunLic ? 'Memiliki Izin' : 'Tidak Ada';
        citDetailGunLic.className = cit.gunLic ? 'meta-val val-green' : 'meta-val val-red';

        citDetailWarrant.textContent = cit.warrant ? 'DPO / BURONAN AKTIF' : 'Bebas / Bersih';
        citDetailWarrant.className = cit.warrant ? 'meta-val val-red' : 'meta-val val-green';

        citRecordCount.textContent = `${cit.records.length} Catatan`;
        citRecordsList.innerHTML = cit.records.map(r => `
            <div class="record-entry">
                <div class="entry-header">
                    <span class="entry-title">${r.title}</span>
                    <span class="entry-date">${r.date}</span>
                </div>
                <p class="entry-desc">${r.desc}</p>
                <div class="entry-footer">
                    <span class="entry-officer">Petugas: ${r.officer}</span>
                    <span class="entry-fine">${r.fine}</span>
                </div>
            </div>
        `).join('');
    }

    function searchCitizen(query) {
        query = (query || '').toLowerCase().trim();
        const found = CITIZEN_DB.find(c => 
            c.name.toLowerCase().includes(query) || 
            String(c.id) === query || 
            c.ktp.toLowerCase().includes(query)
        );

        if (found) {
            displayCitizen(found);
        } else {
            // Default jika tidak ditemukan
            displayCitizen({
                id: query ? '?' : 0,
                name: query ? `Warga (${query})` : 'Data Tidak Ditemukan',
                ktp: 'KTP-UNKNOWN',
                job: 'Tidak Diketahui',
                phone: 'N/A',
                driverLic: false,
                gunLic: false,
                warrant: false,
                records: []
            });
        }

        emitToGame('cef_onMdtSearchCitizen', query);
    }

    btnSearchCitizen.addEventListener('click', () => {
        searchCitizen(citizenSearchInput.value);
    });

    citizenSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchCitizen(citizenSearchInput.value);
        }
    });

    // Cari Plat Kendaraan
    function displayVehicle(veh) {
        currentSearchedVehicle = veh;
        vehPlateTitle.textContent = veh.plate;
        vehModelTitle.textContent = veh.model;
        vehOwner.textContent = veh.owner;
        vehColor.textContent = veh.color;

        vehTaxStatus.textContent = veh.tax ? 'Aktif (Berlaku)' : 'Pajak Mati / Menunggak';
        vehTaxStatus.className = veh.tax ? 'meta-val val-green' : 'meta-val val-red';

        vehStolenStatus.textContent = veh.stolen ? 'TERDAFTAR HILANG / CURANMOR' : 'Tidak Terdaftar Hilang';
        vehStolenStatus.className = veh.stolen ? 'meta-val val-red' : 'meta-val val-green';

        vehBoloStatus.textContent = veh.bolo ? 'ALERT BOLO AKTIF' : 'Bersih';
        vehBoloStatus.className = veh.bolo ? 'meta-val val-red' : 'meta-val val-green';

        btnStolenText.textContent = veh.stolen ? 'Cabut Status Curanmor / BOLO' : 'Tandai Kendaraan Hilang (BOLO)';

        vehRecordsList.innerHTML = (veh.records || []).map(r => `
            <div class="record-entry">
                <div class="entry-header">
                    <span class="entry-title">${r.title}</span>
                    <span class="entry-date">${r.date}</span>
                </div>
                <p class="entry-desc">${r.desc}</p>
                <div class="entry-footer">
                    <span class="entry-officer">Unit: ${r.officer}</span>
                    <span class="entry-fine">Status: ${r.status}</span>
                </div>
            </div>
        `).join('');
    }

    function searchVehicle(query) {
        query = (query || '').toUpperCase().trim();
        const found = VEHICLE_DB.find(v => v.plate.includes(query) || v.owner.toUpperCase().includes(query));

        if (found) {
            displayVehicle(found);
        } else {
            displayVehicle({
                plate: query || 'UNKNOWN',
                model: 'Model Tidak Terdaftar',
                owner: 'Tidak Ada Data',
                color: 'N/A',
                tax: false,
                stolen: false,
                bolo: false,
                records: []
            });
        }

        emitToGame('cef_onMdtSearchVehicle', query);
    }

    btnSearchVehicle.addEventListener('click', () => {
        searchVehicle(vehSearchInput.value);
    });

    vehSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchVehicle(vehSearchInput.value);
        }
    });

    // Toggle BOLO / Stolen Kendaraan
    btnToggleStolen.addEventListener('click', () => {
        if (!currentSearchedVehicle) return;
        currentSearchedVehicle.stolen = !currentSearchedVehicle.stolen;
        currentSearchedVehicle.bolo = currentSearchedVehicle.stolen;
        displayVehicle(currentSearchedVehicle);
        emitToGame('cef_onMdtToggleBolo', currentSearchedVehicle.plate, currentSearchedVehicle.stolen ? 1 : 0);
    });

    // Modal Form (Tambah Kasus)
    btnAddCitation.addEventListener('click', () => {
        mdtModalTitle.textContent = 'Tambah Catatan Kriminal / Tilang';
        modalInputTarget.value = citDetailName.textContent;
        modalInputTitle.value = '';
        modalInputDesc.value = '';
        modalInputFine.value = '';
        mdtModal.style.display = 'flex';
        captureFocus(true);
    });

    btnMdtModalCancel.addEventListener('click', () => {
        mdtModal.style.display = 'none';
    });

    btnMdtModalSubmit.addEventListener('click', () => {
        const target = modalInputTarget.value.trim();
        const title = modalInputTitle.value.trim();
        const desc = modalInputDesc.value.trim();
        const fine = modalInputFine.value.trim();

        if (!title || !desc) {
            alert('Judul dan Keterangan kasus wajib diisi!');
            return;
        }

        const cit = CITIZEN_DB.find(c => c.name.toLowerCase() === target.toLowerCase()) || CITIZEN_DB[0];
        cit.records.unshift({
            title: title,
            date: new Date().toLocaleDateString('id-ID'),
            desc: desc,
            officer: officerNameEl.textContent,
            fine: fine ? `$${fine}` : 'Peringatan Lisan'
        });

        displayCitizen(cit);
        mdtModal.style.display = 'none';
        emitToGame('cef_onMdtAddRecord', target, title, desc, parseInt(fine || '0', 10));
    });

    // Helper Buka / Tutup MDT
    const isGameClient = () => {
        return !!(
            (typeof window.GetParentResourceName === 'function') ||
            (typeof cef !== 'undefined' && cef !== null) ||
            (typeof window.cef !== 'undefined' && window.cef !== null)
        );
    };

    function showMdtReopenBtn() {
        let btn = document.getElementById('previewMdtReopenBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'previewMdtReopenBtn';
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                Buka Kembali Police MDT (Pratinjau)
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
                showMdt({
                    officerName: 'Ofc. Nathan Hayes [402]',
                    rank: 'Captain • On-Duty'
                });
            });
            document.body.appendChild(btn);
        }
    }

    function closeMdtUI() {
        appWrapper.style.display = 'none';
        mdtModal.style.display = 'none';
        captureFocus(false);
        emitToGame('cef_onMdtClose');

        if (!isGameClient()) {
            showMdtReopenBtn();
        }
    }

    btnClose.addEventListener('click', (e) => {
        e.preventDefault();
        closeMdtUI();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
            e.preventDefault();
            if (mdtModal.style.display === 'flex') {
                mdtModal.style.display = 'none';
            } else if (appWrapper.style.display !== 'none') {
                closeMdtUI();
            }
        }
    });

    function showMdt(payload) {
        payload = payload || {};
        if (payload.officerName) officerNameEl.textContent = payload.officerName;
        if (payload.rank) officerRankEl.textContent = payload.rank;
        if (payload.dutyCount !== undefined) {
            const statDuty = document.getElementById('statDutyOfficers');
            if (statDuty) statDuty.textContent = `${payload.dutyCount} Personel`;
        }

        document.body.classList.add('active');
        appWrapper.style.display = 'flex';
        captureFocus(true);
    }

    // Window global untuk helper mock
    window.setGpsMock = function (loc) {
        emitToGame('cef_onMdtGps', loc);
        if (!isGameClient()) {
            alert(`GPS Patroli disetel ke: ${loc}!`);
        }
    };

    // Bridge
    function setupBridge() {
        emitToGame('cef_onMdtReady');

        if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.on === 'function') {
            CefBridge.on('cef:openMdt', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                showMdt(parsed);
            });

            CefBridge.on('cef:closeMdt', () => {
                appWrapper.style.display = 'none';
                document.body.classList.remove('active');
                captureFocus(false);
            });

            CefBridge.on('cef:setCitizenData', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                if (parsed) displayCitizen(parsed);
            });

            CefBridge.on('cef:setVehicleData', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                if (parsed) displayVehicle(parsed);
            });
        }

        if (typeof cef !== 'undefined' && cef && typeof cef.on === 'function') {
            cef.on('cef:openMdt', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                showMdt(parsed);
            });

            cef.on('cef:closeMdt', () => {
                appWrapper.style.display = 'none';
                document.body.classList.remove('active');
                captureFocus(false);
            });

            cef.on('cef:setCitizenData', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                if (parsed) displayCitizen(parsed);
            });

            cef.on('cef:setVehicleData', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                if (parsed) displayVehicle(parsed);
            });
        }

        window.addEventListener('message', (event) => {
            const item = event.data;
            if (!item) return;

            if (item.action === 'mdt:open' || item.action === 'openMdt') {
                showMdt(item.data || item);
            } else if (item.action === 'mdt:close' || item.action === 'closeMdt') {
                appWrapper.style.display = 'none';
                captureFocus(false);
            }
        });
    }

    // Inisialisasi
    displayCitizen(CITIZEN_DB[0]);
    displayVehicle(VEHICLE_DB[0]);
    setupBridge();

    if (isGameClient()) {
        document.body.classList.add('in-game');
    } else {
        document.body.classList.add('preview-mode');
        document.documentElement.classList.add('preview-mode');
        showMdt({
            officerName: 'Ofc. Nathan Hayes [402]',
            rank: 'Captain • On-Duty'
        });
    }
})();
