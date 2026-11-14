/**
 * Boss Desk Controller - CEF Interface
 * Menghubungkan Web UI Boss Desk dengan Server Pawn (Faction Goodside & Family Badside)
 */

let currentDeskType = 'goodside'; // 'goodside' | 'badside'
let currentAction = '';
let selectedTargetPid = 0;
let currentMembers = [];
let currentNearbyPlayers = [];
let availableRanks = [];

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi bridge listeners
    if (typeof CefBridge !== 'undefined') {
        // Menerima data pembukaan UI dari Pawn
        CefBridge.on('cef:initBossDesk', (data) => {
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch (e) { console.error("Parse JSON error", e); }
            }
            setupDeskData(data);
        });

        // Update saldo brankas secara langsung
        CefBridge.on('cef:updateBossVault', (cleanCash, dirtyCash) => {
            updateVaultDisplay(cleanCash, dirtyCash);
        });

        // Update list member
        CefBridge.on('cef:updateBossMembers', (membersJson) => {
            if (typeof membersJson === 'string') {
                try { membersJson = JSON.parse(membersJson); } catch (e) { }
            }
            renderMembers(membersJson);
        });

        // Beritahu game client siap
        CefBridge.emit('cef_onBossDeskReady');
    }

    // Tombol ESC untuk tutup
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
            closeDesk();
        }
    });
});

function formatMoney(amount) {
    return new Intl.NumberFormat('en-US').format(amount || 0);
}

function setupDeskData(data) {
    if (!data) return;

    currentDeskType = data.type || 'goodside';
    document.body.setAttribute('data-type', currentDeskType);

    // Set judul & info
    const badge = document.getElementById('badge-label');
    const title = document.getElementById('org-title');
    const roleInfo = document.getElementById('player-role-info');

    title.innerText = data.orgName || (currentDeskType === 'badside' ? 'Badside Family' : 'Faction Goodside');
    roleInfo.innerText = `Pangkat Anda: ${data.myRankName || 'Petinggi'}`;

    if (currentDeskType === 'badside') {
        badge.innerText = "Badside / Family";
    } else {
        badge.innerText = "Goodside / Faction";
    }

    // Update Saldo
    updateVaultDisplay(data.cashBalance || 0, data.dirtyBalance || 0);

    // Simpan pangkat yang tersedia
    availableRanks = data.ranks || [];

    // Pemain sekitar
    currentNearbyPlayers = data.nearby || [];

    // Render anggota
    renderMembers(data.members || []);
}

function updateVaultDisplay(cleanCash, dirtyCash) {
    const elClean = document.getElementById('vault-balance');
    const elDirty = document.getElementById('vault-dirty-balance');

    if (elClean) elClean.innerText = '$' + formatMoney(cleanCash);
    if (elDirty) elDirty.innerText = '$' + formatMoney(dirtyCash);
}

function renderMembers(members) {
    currentMembers = members || [];
    const tbody = document.getElementById('memberTableBody');
    const subtitle = document.getElementById('member-count-subtitle');

    if (!tbody) return;
    tbody.innerHTML = '';

    subtitle.innerText = `Total ${currentMembers.length} anggota terdaftar dalam database.`;

    if (currentMembers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-placeholder">
                    Belum ada anggota lain yang terdaftar dalam organisasi.
                </td>
            </tr>
        `;
        return;
    }

    currentMembers.forEach((m) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${escapeHtml(m.name)}</strong>
                <div style="font-size: 11px; color: #64748b;">PID: ${m.pid}</div>
            </td>
            <td>
                <span class="member-rank-badge">${escapeHtml(m.rankName || 'Anggota')}</span>
            </td>
            <td style="color: #94a3b8; font-size: 12px;">
                ${escapeHtml(m.lastOnline || 'Tidak diketahui')}
            </td>
            <td style="text-align: right; white-space: nowrap;">
                <button class="member-actions-btn" onclick="openRankModal(${m.pid}, '${escapeHtml(m.name)}', ${m.rank})">
                    <i class="fa-solid fa-pen-to-square"></i> Pangkat
                </button>
                <button class="member-actions-btn danger" onclick="confirmKickMember(${m.pid}, '${escapeHtml(m.name)}')">
                    <i class="fa-solid fa-trash"></i> Kick
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function switchTab(tabId, el) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (el) el.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.add('active');
}

function switchTabByName(tabId) {
    const navButtons = document.querySelectorAll('.nav-btn');
    const mapping = { 'main': 0, 'members': 1, 'vault': 2 };
    if (mapping[tabId] !== undefined && navButtons[mapping[tabId]]) {
        switchTab(tabId, navButtons[mapping[tabId]]);
    }
}

// Modal Handler
function openModal(action) {
    currentAction = action;
    const modal = document.getElementById('actionModal');
    const title = document.getElementById('modalTitle');
    const input = document.getElementById('modalInput');
    const selectNearby = document.getElementById('modalSelectNearby');
    const selectRank = document.getElementById('modalSelectRank');

    modal.style.display = 'flex';
    input.value = '';
    input.style.display = 'block';
    selectNearby.style.display = 'none';
    selectRank.style.display = 'none';

    if (action === 'invite') {
        title.innerText = "Undang Anggota Terdekat";
        if (currentNearbyPlayers && currentNearbyPlayers.length > 0) {
            input.style.display = 'none';
            selectNearby.style.display = 'block';
            selectNearby.innerHTML = '<option value="">-- Pilih Pemain Terdekat --</option>';
            currentNearbyPlayers.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.innerText = `${p.name} (ID: ${p.id})`;
                selectNearby.appendChild(opt);
            });
            selectNearby.focus();
        } else {
            input.placeholder = "Masukkan Player ID (contoh: 12)";
            input.type = "number";
            input.focus();
        }
    } else if (action === 'kick') {
        title.innerText = "Keluarkan Anggota (Kick)";
        input.placeholder = "Masukkan Nama Karakter / PID";
        input.type = "text";
        input.focus();
    } else if (action === 'deposit' || action === 'withdraw') {
        title.innerText = action === 'deposit' ? "Setor Uang Kas Resmi ($)" : "Tarik Uang Kas Resmi ($)";
        input.placeholder = "Nominal uang (contoh: 50000)";
        input.type = "number";
        input.focus();
    } else if (action === 'deposit_dirty' || action === 'withdraw_dirty') {
        title.innerText = action === 'deposit_dirty' ? "Setor Uang Kotor ($)" : "Tarik Uang Kotor ($)";
        input.placeholder = "Nominal uang kotor (contoh: 25000)";
        input.type = "number";
        input.focus();
    }
}

function openRankModal(pid, name, currentRank) {
    currentAction = 'set_rank';
    selectedTargetPid = pid;

    const modal = document.getElementById('actionModal');
    const title = document.getElementById('modalTitle');
    const input = document.getElementById('modalInput');
    const selectNearby = document.getElementById('modalSelectNearby');
    const selectRank = document.getElementById('modalSelectRank');

    modal.style.display = 'flex';
    input.style.display = 'none';
    selectNearby.style.display = 'none';
    selectRank.style.display = 'block';

    title.innerText = `Ubah Pangkat: ${name}`;
    selectRank.innerHTML = '<option value="">-- Pilih Jabatan / Pangkat Baru --</option>';

    if (availableRanks && availableRanks.length > 0) {
        availableRanks.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.innerText = `${r.id}. ${r.name}`;
            if (r.id === currentRank) opt.selected = true;
            selectRank.appendChild(opt);
        });
    }

    selectRank.focus();
}

function confirmKickMember(pid, name) {
    if (confirm(`Yakin ingin mengeluarkan ${name} dari organisasi?`)) {
        if (typeof CefBridge !== 'undefined') {
            CefBridge.emit('cef_onBossAction', 'kick_pid', pid.toString());
        }
    }
}

function closeModal() {
    document.getElementById('actionModal').style.display = 'none';
}

function submitModal() {
    const input = document.getElementById('modalInput');
    const selectNearby = document.getElementById('modalSelectNearby');
    const selectRank = document.getElementById('modalSelectRank');

    let val = '';

    if (currentAction === 'invite') {
        if (selectNearby.style.display !== 'none') {
            val = selectNearby.value;
        } else {
            val = input.value.trim();
        }
        if (!val) return alert("Pilih atau masukkan ID pemain!");
    } else if (currentAction === 'set_rank') {
        val = `${selectedTargetPid}|${selectRank.value}`;
        if (!selectRank.value) return alert("Pilih pangkat baru!");
    } else {
        val = input.value.trim();
        if (!val) return alert("Field tidak boleh kosong!");
    }

    if (typeof CefBridge !== 'undefined') {
        CefBridge.emit('cef_onBossAction', currentAction, val.toString());
    }

    closeModal();
}

function closeDesk() {
    if (typeof CefBridge !== 'undefined') {
        CefBridge.emit('cef_onBossDeskClose');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
