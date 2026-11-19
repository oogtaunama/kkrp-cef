/**
 * KKRP Modern Disnaker (Job Center) - JavaScript Logic
 * Kompatibel dengan FiveM NUI dan SA-MP / open.mp CEF
 */

(function () {
    'use strict';

    // Database Pekerjaan Sipil Resmi Kota
    const JOBS_DATA = [
        {
            id: 1,
            key: 'farmer',
            title: 'Petani (Farmer)',
            category: 'natural',
            categoryLabel: 'Sumber Daya Alam',
            desc: 'Mengolah ladang subur di Flint County, menanam bibit gandum & jagung, serta memanen hasil tani berkualitas tinggi.',
            salary: '$350 - $650 / Siklus',
            hq: 'Flint County Farm',
            icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`
        },
        {
            id: 2,
            key: 'miner',
            title: 'Penambang (Miner)',
            category: 'natural',
            categoryLabel: 'Sumber Daya Alam',
            desc: 'Mengebor batu batuan di area Hunter Quarry untuk menemukan mineral tembaga, besi, dan emas berharga.',
            salary: '$400 - $750 / Tas Mineral',
            hq: 'Hunter Quarry Digsite',
            icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.78 2.22l-2.02 2.02-2.12-2.12a.996.996 0 0 0-1.41 0L12 4.34l-2.22-2.22c-.39-.39-1.02-.39-1.41 0L6.24 4.24a.996.996 0 0 0 0 1.41l2.12 2.12-6.14 6.14a2 2 0 0 0 0 2.83l3.54 3.54a2 2 0 0 0 2.83 0l6.14-6.14 2.12 2.12c.39.39 1.02.39 1.41 0l2.12-2.12c.39-.39.39-1.02 0-1.41L18.24 10.1l2.12-2.12a.996.996 0 0 0 0-1.41l-2.02-2.02 1.44-1.44a.996.996 0 0 0 0-1.41l-.5-.5a.996.996 0 0 0-1.41 0l-1.44 1.44z"/></svg>`
        },
        {
            id: 3,
            key: 'butcher',
            title: 'Jagal / Peternak Ayam (Butcher)',
            category: 'industry',
            categoryLabel: 'Industri & Pabrik',
            desc: 'Memproses peternakan ayam potong di pabrik pengolahan daging Bone County untuk pasokan restoran cepat saji.',
            salary: '$300 - $550 / Ekor',
            hq: 'Bone County Meat Processing',
            icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.48L22 7.05h-3.47l-.37 3.33-1.07-1.07c-.39-.39-1.02-.39-1.41 0l-1.77 1.77-1.06-1.06a.996.996 0 0 0-1.41 0L2.7 18.82c-.39.39-.39 1.02 0 1.41l2.83 2.83c.39.39 1.02.39 1.41 0l8.79-8.79 1.06 1.06-1.77 1.77c-.39.39-.39 1.02 0 1.41l1.07 1.07-.37 3.33c.18.9 1.01 1.08 2.34 1.08z"/></svg>`
        },
        {
            id: 4,
            key: 'oilman',
            title: 'Pekerja Kilang Minyak (Oilman)',
            category: 'industry',
            categoryLabel: 'Industri & Minyak',
            desc: 'Mengoperasikan anjungan pompa minyak dan tangki distilasi minyak mentah untuk mensuplai SPBU seantero kota.',
            salary: '$450 - $800 / Barel',
            hq: 'Green Palms Oil Fields',
            icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
        },
        {
            id: 5,
            key: 'bus',
            title: 'Supir Bus (Bus Driver)',
            category: 'transport',
            categoryLabel: 'Angkutan & Transportasi',
            desc: 'Mengemudikan armada bus transit kota menyusuri rute halte penting dari Los Santos hingga San Fierro.',
            salary: '$300 - $600 / Rute',
            hq: 'Los Santos Central Bus Station',
            icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`
        },
        {
            id: 6,
            key: 'fisherman',
            title: 'Nelayan Laut (Fisherman)',
            category: 'natural',
            categoryLabel: 'Sumber Daya Alam',
            desc: 'Berlayar dari dermaga ke perairan lepas samudra untuk menjaring ikan tuna, salmon, dan kepiting laut segar.',
            salary: '$350 - $700 / Keranjang Ikan',
            hq: 'Bayside Marina Pier',
            icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2c-5.33 4-8 8.67-8 14 0 4.42 3.58 8 8 8s8-3.58 8-8c0-5.33-2.67-10-8-14zm0 20c-3.31 0-6-2.69-6-6 0-3.41 1.76-7.07 6-10.82 4.24 3.75 6 7.41 6 10.82 0 3.31-2.69 6-6 6z"/></svg>`
        },
        {
            id: 7,
            key: 'cargo',
            title: 'Supir Logistik Kargo (Cargo Driver)',
            category: 'transport',
            categoryLabel: 'Angkutan & Kargo',
            desc: 'Distribusi barang industri dan peti kemas dari pelabuhan Ocean Docks ke gudang-gudang distributor di pedalaman.',
            salary: '$500 - $900 / Pengiriman',
            hq: 'Ocean Docks Logistics Yard',
            icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5l1.96 2.5H17V9.5h2.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>`
        },
        {
            id: 8,
            key: 'lumberjack',
            title: 'Penebang Kayu (Lumberjack)',
            category: 'natural',
            categoryLabel: 'Sumber Daya Alam',
            desc: 'Menebang pohon pinus dewasa di hutan lereng Gunung Chiliad / Angel Pine dan mengirim kayu balak ke sawmill.',
            salary: '$380 - $680 / Muatan Kayu',
            hq: 'Angel Pine Sawmill',
            icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M14 2l-4 4 1.41 1.41L13 5.83V14h2V5.83l1.59 1.58L18 6l-4-4zm-8 8l-4 4 1.41 1.41L5 13.83V22h2v-8.17l1.59 1.58L10 14l-4-4zm14 4l-4 4 1.41 1.41L19 19.83V22h2v-2.17l1.59 1.58L24 20l-4-4z"/></svg>`
        },
        {
            id: 9,
            key: 'tailor',
            title: 'Penjahit Konveksi (Tailor)',
            category: 'industry',
            categoryLabel: 'Industri & Pabrik',
            desc: 'Memotong pola kain, menyulam tekstil, dan memproduksi baju berkualitas tinggi untuk butik ternama Rodeo.',
            salary: '$320 - $580 / Pakaian',
            hq: 'Doherty Garment Factory',
            icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2c-4.41 0-8 3.59-8 8 0 2.21.9 4.21 2.34 5.66L12 21.31l5.66-5.65C19.1 14.21 20 12.21 20 10c0-4.41-3.59-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`
        }
    ];

    let currentJobId = 0; // 0 = Pengangguran
    let selectedJobForModal = null;
    let activeFilter = 'all';

    // DOM Elements
    const appWrapper = document.getElementById('jobcenterApp');
    const jobsGrid = document.getElementById('jobsGrid');
    const citizenNameEl = document.getElementById('citizenName');
    const currentJobLabelEl = document.getElementById('currentJobLabel');
    const btnClose = document.getElementById('btnCloseJc');
    const btnResign = document.getElementById('btnResignJob');
    const searchInput = document.getElementById('jobSearchInput');
    const categoryTabs = document.getElementById('categoryTabs');
    const confirmModal = document.getElementById('confirmModal');
    const modalConfirmText = document.getElementById('modalConfirmText');
    const btnModalCancel = document.getElementById('btnModalCancel');
    const btnModalConfirm = document.getElementById('btnModalConfirm');

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

    // Helper: Trigger event ke Game Client (FiveM NUI atau open.mp CEF)
    function emitToGame(eventName, ...args) {
        if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.emit === 'function') {
            CefBridge.emit(eventName, ...args);
        } else if (typeof cef !== 'undefined' && cef && typeof cef.emit === 'function') {
            cef.emit(eventName, ...args);
        }

        // Dukungan FiveM fetch NUI
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

    // Render Kartu Pekerjaan
    function renderJobs() {
        jobsGrid.innerHTML = '';
        const query = searchInput.value.toLowerCase().trim();

        const filtered = JOBS_DATA.filter(job => {
            const matchCategory = (activeFilter === 'all') || (job.category === activeFilter);
            const matchSearch = job.title.toLowerCase().includes(query) || job.desc.toLowerCase().includes(query);
            return matchCategory && matchSearch;
        });

        if (filtered.length === 0) {
            jobsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" style="opacity: 0.5; margin-bottom: 12px;">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    <p style="font-size: 14px;">Tidak ada lowongan pekerjaan yang cocok dengan pencarian.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(job => {
            const isCurrent = (currentJobId === job.id);
            const card = document.createElement('div');
            card.className = `job-card ${isCurrent ? 'current-active' : ''}`;

            card.innerHTML = `
                <div>
                    <div class="card-top">
                        <div class="job-icon-wrap">
                            ${job.icon}
                        </div>
                        <div class="job-header-info">
                            <span class="job-category-tag">${job.categoryLabel}</span>
                            <h3 class="job-title">${job.title}</h3>
                        </div>
                    </div>
                    <p class="job-desc">${job.desc}</p>
                </div>

                <div>
                    <div class="job-details-row">
                        <span class="salary-label">Estimasi Gaji:</span>
                        <span class="salary-val">${job.salary}</span>
                    </div>

                    <div class="job-actions">
                        <button class="btn-apply" data-jobid="${job.id}">
                            ${isCurrent ? `
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                Pekerjaan Aktif
                            ` : `
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                                Ambil Pekerjaan
                            `}
                        </button>
                        <button class="btn-gps" data-jobid="${job.id}" title="Set GPS ke Markas ${job.hq}">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        </button>
                    </div>
                </div>
            `;

            // Action Listeners
            const btnApply = card.querySelector('.btn-apply');
            btnApply.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isCurrent) return;
                openConfirmModal(job);
            });

            const btnGps = card.querySelector('.btn-gps');
            btnGps.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                emitToGame('cef_onJobSetGPS', parseInt(job.id, 10));
                if (!isGameClient()) {
                    alert(`GPS Checkpoint disetel ke markas ${job.title}: ${job.hq}!`);
                }
            });

            jobsGrid.appendChild(card);
        });
    }

    // Modal Konfirmasi
    function openConfirmModal(job) {
        selectedJobForModal = job;
        modalConfirmText.innerHTML = `Apakah Anda yakin ingin mendaftar dan mulai bekerja sebagai <b>${job.title}</b>?`;
        confirmModal.style.display = 'flex';
        captureFocus(true);
    }

    function closeConfirmModal() {
        confirmModal.style.display = 'none';
        selectedJobForModal = null;
    }

    btnModalCancel.addEventListener('click', (e) => {
        e.preventDefault();
        closeConfirmModal();
    });

    btnModalConfirm.addEventListener('click', (e) => {
        e.preventDefault();
        if (!selectedJobForModal) return;
        const job = selectedJobForModal;
        closeConfirmModal();

        currentJobId = job.id;
        currentJobLabelEl.textContent = `Status: ${job.title}`;
        renderJobs();

        // Kirim integer ID sesuai ekspektasi Argument_Integer di Pawn
        emitToGame('cef_onJobSelect', parseInt(job.id, 10));
    });

    // Berhenti Kerja
    btnResign.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentJobId === 0) return;
        currentJobId = 0;
        currentJobLabelEl.textContent = 'Status: Pengangguran';
        renderJobs();
        emitToGame('cef_onJobResign');
    });

    // Deteksi apakah sedang berjalan di dalam engine game (CEF open.mp / FiveM)
    const isGameClient = () => {
        return !!(
            (typeof window.GetParentResourceName === 'function') ||
            (typeof cef !== 'undefined' && cef !== null) ||
            (typeof window.cef !== 'undefined' && window.cef !== null)
        );
    };

    function showJobReopenBtn() {
        let btn = document.getElementById('previewJobReopenBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'previewJobReopenBtn';
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
                Buka Kembali UI Disnaker (Pratinjau)
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
                showJobCenter({
                    citizenName: 'Brenden Randall [ID: 24]',
                    currentJobId: currentJobId || 1
                });
            });
            document.body.appendChild(btn);
        }
    }

    // Tutup UI
    function closeJobCenterUI() {
        appWrapper.style.display = 'none';
        closeConfirmModal();
        captureFocus(false);
        emitToGame('cef_onJobCenterClose');

        if (!isGameClient()) {
            showJobReopenBtn();
        }
    }

    btnClose.addEventListener('click', (e) => {
        e.preventDefault();
        closeJobCenterUI();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
            e.preventDefault();
            if (confirmModal.style.display === 'flex') {
                closeConfirmModal();
            } else if (appWrapper.style.display !== 'none') {
                closeJobCenterUI();
            }
        }
    });

    // Kategori Tabs
    categoryTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;

        categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-category');
        renderJobs();
    });

    // Pencarian
    searchInput.addEventListener('input', () => {
        renderJobs();
    });

    // Buka UI & Update Data dari Server
    function showJobCenter(payload) {
        payload = payload || {};
        if (payload.citizenName) {
            citizenNameEl.textContent = payload.citizenName;
        }
        currentJobId = typeof payload.currentJobId !== 'undefined' ? Number(payload.currentJobId) : 0;

        const currentJobObj = JOBS_DATA.find(j => j.id === currentJobId);
        currentJobLabelEl.textContent = currentJobObj ? `Status: ${currentJobObj.title}` : 'Status: Pengangguran';

        renderJobs();
        appWrapper.style.display = 'flex';
        // Aktifkan kursor & tangkap input mouse CEF jika di dalam game
        captureFocus(true);
    }

    // Inisialisasi Bridge Listeners
    function setupBridge() {
        // Beritahu game engine bahwa JS sudah siap menerima data
        emitToGame('cef_onJobReady');

        if (typeof CefBridge !== 'undefined' && CefBridge && typeof CefBridge.on === 'function') {
            CefBridge.on('cef:openJobCenter', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                showJobCenter(parsed);
            });

            CefBridge.on('cef:setJobCenterData', (data) => {
                let parsed = data;
                if (typeof data === 'string') {
                    try { parsed = JSON.parse(data); } catch(e) {}
                }
                showJobCenter(parsed);
            });

            CefBridge.on('cef:closeJobCenter', () => {
                appWrapper.style.display = 'none';
                captureFocus(false);
            });
        }

        // Listener Event Masuk (FiveM NUI & window.cef event)
        window.addEventListener('message', (event) => {
            const item = event.data;
            if (!item) return;

            if (item.action === 'jobcenter:open' || item.action === 'openJobCenter') {
                showJobCenter(item.data || item);
            } else if (item.action === 'jobcenter:close' || item.action === 'closeJobCenter') {
                appWrapper.style.display = 'none';
                captureFocus(false);
            }
        });
    }

    // Inisialisasi awal
    renderJobs();
    setupBridge();

    // Jika dibuka di browser web biasa (GitHub Pages, Edge, Chrome) ATAU dengan query ?preview=true
    if (!isGameClient() || window.location.search.includes('preview=true')) {
        document.body.classList.add('preview-mode');
        showJobCenter({
            citizenName: 'Brenden Randall [ID: 24]',
            currentJobId: 1
        });
    }
})();
