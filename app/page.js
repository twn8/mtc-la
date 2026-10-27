'use client';
import { useEffect } from 'react';

export default function Home() {
  // DEKLARASI VARIABEL GLOBAL DI SINI (AGAR TIDAK "NOT DEFINED")
  if (typeof window !== 'undefined') {
    window.cacheWOData = window.cacheWOData || [];
    window.cachePMData = window.cachePMData || [];
    window.savedPMFilter = window.savedPMFilter || { tanggal: '', line: '', jenisPM: '' };
  }

  useEffect(() => {
    // 1. GLOBAL NAVIGATION TABS
    window.switchMainTab = function(tab) {
      const pWO = document.getElementById('panelWO');
      const pPM = document.getElementById('panelPMMassal');
      const pRiw = document.getElementById('panelRiwayat');

      if (pWO) pWO.style.display = tab === 'wo' ? 'block' : 'none';
      if (pPM) pPM.style.display = tab === 'pm_massal' ? 'block' : 'none';
      if (pRiw) pRiw.style.display = tab === 'riwayat' ? 'block' : 'none';

      const btnWO = document.getElementById('tabBtnWO');
      const btnPM = document.getElementById('tabBtnPM');
      const btnRiw = document.getElementById('tabBtnRiwayat');

      if (btnWO) btnWO.className = tab === 'wo' ? 'tab-btn active' : 'tab-btn';
      if (btnPM) btnPM.className = tab === 'pm_massal' ? 'tab-btn active' : 'tab-btn';
      if (btnRiw) btnRiw.className = tab === 'riwayat' ? 'tab-btn active' : 'tab-btn';

      if (tab === 'riwayat') {
        if (typeof window.loadWOTableData === 'function') window.loadWOTableData();
        if (typeof window.loadPMTableData === 'function') window.loadPMTableData();
      }
    };

    window.toggleRiwayatSubView = function(sub) {
      const cWO = document.getElementById('containerRiwayatWO');
      const cPM = document.getElementById('containerRiwayatPM');
      const fArea = document.getElementById('filterPMArea');

      if (cWO) cWO.style.display = sub === 'wo' ? 'block' : 'none';
      if (cPM) cPM.style.display = sub === 'pm' ? 'block' : 'none';
      if (fArea) fArea.style.display = sub === 'pm' ? 'block' : 'none';

      const btnSubWO = document.getElementById('btnSubWO');
      const btnSubPM = document.getElementById('btnSubPM');

      if (btnSubWO) btnSubWO.className = sub === 'wo' ? 'sub-tab-btn active' : 'sub-tab-btn';
      if (btnSubPM) btnSubPM.className = sub === 'pm' ? 'sub-tab-btn active' : 'sub-tab-btn';

      if (sub === 'wo' && typeof window.loadWOTableData === 'function') window.loadWOTableData();
      if (sub === 'pm' && typeof window.loadPMTableData === 'function') window.loadPMTableData();
    };

    // 2. HELPER TANGGAL & HARI
    window.todayLocal = function() {
      var d = new Date();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + m + '-' + day;
    };

    window.hariDariTanggal = function(val) {
      var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      var p = val.split('-');
      return days[new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10)).getDay()];
    };

    window.closeModal = function(id) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    };

    // 3. DAFTAR MESIN BERDASARKAN LINE (Unit Digabung)
    window.getRawMesinListByLine = function(lineVal) {
      if (['09', '10', '11'].includes(lineVal)) return ['Material Transport', 'Extruder', 'VCU', 'Haul Off', 'CCM', 'BE', 'Bundling', 'Straping', 'Inclining'];
      if (['12', '13', '23'].includes(lineVal)) return ['Material Transport', 'Extruder', 'VCU', 'Haul Off', 'CCM', 'BE', 'Inclining'];
      if (lineVal === '21') return ['Material Transport', 'Extruder', 'VCU', 'ECU', 'HO', 'CCM', 'BE', 'Pelontar'];
      if (lineVal === '18') return ['Material Transport', 'Extruder', 'Cooling Bath', 'HO', 'CCM', 'BE', 'Inclining'];
      if (['14', '15', '16', '17', '19', '20', '22', '24'].includes(lineVal)) return ['Material Transport', 'Extruder', 'VCU', 'ECU', 'HO', 'CCM', 'BE', 'Inclining'];
      if (lineVal === 'Utility') return ['Chiller 12.1', 'Chiller 12.2', 'Kompressor', 'Dryer 1', 'Dryer 2'];
      if (lineVal === 'QA') return ['Bak Pressure Test', 'Impact Test'];
      if (lineVal === 'Crusher') return ['Palman', 'Shredder', 'AKS', 'Pulverizer'];
      return ['Mesin Umum'];
    };

    // 4. FORM WO HANDLERS
    window.onWOLineChange = function() {
      var line = document.getElementById('woLineSelect').value;
      var mesinSelect = document.getElementById('woMesinSelect');
      if (!mesinSelect) return;
      mesinSelect.innerHTML = '<option value="">-- Pilih Mesin --</option>';
      mesinSelect.disabled = !line;
      if (!line) return;
      window.getRawMesinListByLine(line).forEach(function(m) {
        var opt = document.createElement('option');
        opt.value = m; opt.textContent = m;
        mesinSelect.appendChild(opt);
      });
    };

    window.onWOJenisChange = function() {
      var jenis = document.getElementById('woJenisPekerjaan').value;
      var targetSelect = document.getElementById('woTargetPM');
      var isPM = jenis === 'Preventive Maintenance (PM)';
      if (targetSelect) targetSelect.disabled = !isPM;
      if (!isPM && targetSelect) {
        targetSelect.value = '';
        const groupAdd = document.getElementById('groupWOAdditional');
        if (groupAdd) groupAdd.style.display = 'none';
      }
      window.updateWOKodePekerjaan();
    };

    window.onWOTargetPMChange = function() {
      var target = document.getElementById('woTargetPM').value;
      var addGroup = document.getElementById('groupWOAdditional');
      if (addGroup) addGroup.style.display = target === 'Additional' ? 'flex' : 'none';
      window.updateWOKodePekerjaan();
    };

    window.updateWOKodePekerjaan = function() {
      var jenis = document.getElementById('woJenisPekerjaan').value;
      var target = document.getElementById('woTargetPM').value;
      var ketAdd = document.getElementById('woKetAdditional') ? document.getElementById('woKetAdditional').value.trim() : '';
      var kodeInput = document.getElementById('woJenisKode');
      if (!kodeInput) return;
      if (jenis === 'Breakdown (Stop)') kodeInput.value = 'BD-S';
      else if (jenis === 'Breakdown (Running)') kodeInput.value = 'BD-R';
      else if (jenis === 'Corrective (Improvement)') kodeInput.value = 'COR/IMP';
      else if (jenis === 'Preventive Maintenance (PM)') {
        kodeInput.value = target === 'Additional' ? (ketAdd ? ('PM ' + ketAdd) : 'PM Additional') : (target ? ('PM ' + target) : 'PM');
      }
    };

    window.calculateWODurasi = function() {
      const s = document.getElementById('woJamMulai').value;
      const e = document.getElementById('woJamSelesai').value;
      if (!s || !e) return;
      const [sH, sM] = s.split(':').map(Number);
      const [eH, eM] = e.split(':').map(Number);
      let diff = (eH * 60 + eM) - (sH * 60 + sM);
      if (diff < 0) diff += 1440;
      const durInput = document.getElementById('woDurasi');
      if (durInput) durInput.value = diff;
    };

    window.toggleWORCFAPic = function() {
      var choice = document.getElementById('woRCFA').value;
      var picInput = document.getElementById('woPicRCFA');
      if (picInput) {
        picInput.disabled = choice !== 'YES';
        if (choice !== 'YES') picInput.value = '';
      }
    };

    // 5. FORM PM MASSAL HANDLERS
    window.onPMTanggalChange = function() {
      var val = document.getElementById('pmTanggal').value;
      var hariInput = document.getElementById('pmHari');
      if (val && hariInput) hariInput.value = window.hariDariTanggal(val);
    };

    window.onPMMassalTargetChange = function() {
      var target = document.getElementById('pmJenisSelect').value;
      var addGroup = document.getElementById('groupPMMassalAdditional');
      if (addGroup) addGroup.style.display = target === 'Additional' ? 'flex' : 'none';
    };

    window.generatePMMesinTable = function() {
      var lineVal = document.getElementById('pmLineSelect').value;
      var tbody = document.getElementById('pmMesinTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      if (!lineVal) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Pilih Line terlebih dahulu.</td></tr>';
        return;
      }

      var rawList = window.getRawMesinListByLine(lineVal);
      var pmMesinList = ['Elektrikal'];
      var vcuEcuAdded = false, haulOffAdded = false, ccmAdded = false, incliningAdded = false;

      rawList.forEach(function(m) {
        var lower = m.toLowerCase();
        if (lower.indexOf('vcu') !== -1 || lower.indexOf('ecu') !== -1) {
          if (!vcuEcuAdded) { pmMesinList.push('VCU & ECU'); vcuEcuAdded = true; }
        } else if (lower.indexOf('ho') !== -1 || lower === 'haul off') {
          if (!haulOffAdded) { pmMesinList.push('Haul Off'); haulOffAdded = true; }
        } else if (lower.indexOf('ccm') !== -1) {
          if (!ccmAdded) { pmMesinList.push('CCM'); ccmAdded = true; }
        } else if (lower.indexOf('inclining') !== -1) {
          if (!incliningAdded) { pmMesinList.push('Inclining'); incliningAdded = true; }
        } else {
          pmMesinList.push(m);
        }
      });

      pmMesinList.forEach(function(mesin) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td style="font-weight: bold;">' + mesin + '<input type="hidden" class="pm-mesin-name" value="' + mesin + '"></td>' +
                       '<td><input type="text" class="pm-pic-input" placeholder="Nama PIC"></td>' +
                       '<td><input type="time" class="pm-jam-selesai-input"></td>' +
                       '<td><input type="text" class="pm-ket-input" placeholder="Keterangan"></td>';
        tbody.appendChild(tr);
      });
    };

    // 6. FETCH API MOCK (google.script.run)
    window.google = {
      script: {
        run: {
          successCallback: null,
          failureCallback: null,
          withSuccessHandler: function(cb) { this.successCallback = cb; return this; },
          withFailureHandler: function(cb) { this.failureCallback = cb; return this; },
          submitLaporanAkhir: async function(payload) {
            try {
              const res = await fetch('/api/sheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'submitLaporanAkhir', data: payload })
              });
              const json = await res.json();
              if (json.success && this.successCallback) this.successCallback(json);
              else if (this.failureCallback) this.failureCallback(new Error(json.message));
            } catch (err) { if (this.failureCallback) this.failureCallback(err); }
          },
          updateLaporanWO: async function(payload) {
            try {
              const res = await fetch('/api/sheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateLaporanWO', data: payload })
              });
              const json = await res.json();
              if (json.success && this.successCallback) this.successCallback(json);
              else if (this.failureCallback) this.failureCallback(new Error(json.message));
            } catch (err) { if (this.failureCallback) this.failureCallback(err); }
          },
          submitPMMassal: async function(payload) {
            try {
              const res = await fetch('/api/sheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'submitPMMassal', data: payload })
              });
              const json = await res.json();
              if (json.success && this.successCallback) this.successCallback(json);
              else if (this.failureCallback) this.failureCallback(new Error(json.message));
            } catch (err) { if (this.failureCallback) this.failureCallback(err); }
          },
          updateHistoriPM: async function(payload) {
            try {
              const res = await fetch('/api/sheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateHistoriPM', data: payload })
              });
              const json = await res.json();
              if (json.success && this.successCallback) this.successCallback(json);
              else if (this.failureCallback) this.failureCallback(new Error(json.message));
            } catch (err) { if (this.failureCallback) this.failureCallback(err); }
          },
          getLaporanData: async function() {
            try {
              const res = await fetch('/api/sheets?action=getLaporanData');
              const json = await res.json();
              if (json.success && this.successCallback) this.successCallback(json.data);
            } catch (err) { if (this.failureCallback) this.failureCallback(err); }
          },
          getHistoriPMData: async function() {
            try {
              const res = await fetch('/api/sheets?action=getHistoriPMData');
              const json = await res.json();
              if (json.success && this.successCallback) this.successCallback(json.data);
            } catch (err) { if (this.failureCallback) this.failureCallback(err); }
          },
          getFilteredHistoriPMData: async function(filters) {
            try {
              const params = new URLSearchParams({
                action: 'getFilteredHistoriPMData',
                tanggal: filters.tanggal || '',
                line: filters.line || '',
                jenisPM: filters.jenisPM || ''
              });
              const res = await fetch(`/api/sheets?${params.toString()}`);
              const json = await res.json();
              if (json.success && this.successCallback) this.successCallback(json.data);
            } catch (err) { if (this.failureCallback) this.failureCallback(err); }
          }
        }
      }
    };

    // INISIALISASI TANGGAL AWAL
    var today = window.todayLocal();
    if (document.getElementById('woTanggal')) document.getElementById('woTanggal').value = today;
    if (document.getElementById('pmTanggal')) document.getElementById('pmTanggal').value = today;
    window.onPMTanggalChange();

    // GLOBAL SUBMIT / TABLE LOADERS
    window.handleWOSubmit = function(e) {
      e.preventDefault();
      var payload = {
        tanggal: document.getElementById('woTanggal').value,
        shiftReg: document.getElementById('woShiftReg').value,
        line: document.getElementById('woLineSelect').value,
        mesin: document.getElementById('woMesinSelect').value,
        jenisPekerjaan: document.getElementById('woJenisPekerjaan').value,
        jenisKode: document.getElementById('woJenisKode').value,
        problem: document.getElementById('woProblem').value,
        penyebab: document.getElementById('woPenyebab').value,
        partBermasalah: document.getElementById('woPart').value,
        action: document.getElementById('woAction').value,
        durasiPerbaikan: document.getElementById('woDurasi').value,
        namaPerbaikan: document.getElementById('woNamaPIC').value,
        statusUtama: document.getElementById('woStatus').value,
        rcfaChoice: document.getElementById('woRCFA').value,
        picRcfa: document.getElementById('woPicRCFA').value
      };

      window.google.script.run
        .withSuccessHandler(function(res) {
          alert('✅ Berhasil disimpan dengan No WO: ' + res.noWO);
          document.getElementById('formWO').reset();
          document.getElementById('woTanggal').value = window.todayLocal();
          window.onWOLineChange();
        })
        .withFailureHandler(function(err) { alert('❌ Gagal: ' + err.message); })
        .submitLaporanAkhir(payload);
    };

    window.submitPMMassalData = function() {
      var tanggal = document.getElementById('pmTanggal').value;
      var line = document.getElementById('pmLineSelect').value;
      var jenisPM = document.getElementById('pmJenisSelect').value;
      var ketAdd = document.getElementById('pmKetAdditional').value.trim();

      if (!tanggal || !line || !jenisPM) { alert('Tanggal, Line, dan Target PM wajib diisi!'); return; }
      if (jenisPM === 'Additional' && !ketAdd) { alert('Keterangan Target PM Additional wajib diisi!'); return; }

      var detailMesin = [];
      document.querySelectorAll('.pm-mesin-name').forEach(function(elem, i) {
        detailMesin.push({
          mesin: elem.value,
          pic: document.querySelectorAll('.pm-pic-input')[i].value.trim(),
          jamSelesai: document.querySelectorAll('.pm-jam-selesai-input')[i].value,
          keterangan: document.querySelectorAll('.pm-ket-input')[i].value.trim()
        });
      });

      var payload = {
        tanggal: tanggal,
        hari: document.getElementById('pmHari').value,
        line: line,
        jenisPM: jenisPM,
        ketAdditional: ketAdd,
        estimasiMulai: document.getElementById('pmEstMulai').value,
        estimasiSelesai: document.getElementById('pmEstSelesai').value,
        estimasiPreheating: document.getElementById('pmEstPreheating').value,
        detailMesin: detailMesin
      };

      window.google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            alert('✅ Berhasil menyimpan ' + res.count + ' baris PM Line!');
            window.switchMainTab('riwayat');
            window.toggleRiwayatSubView('pm');
          } else {
            alert('❌ Gagal: ' + res.message);
          }
        })
        .withFailureHandler(function(err) { alert('❌ Gagal: ' + err.message); })
        .submitPMMassal(payload);
    };

    window.loadWOTableData = function() {
      window.google.script.run
        .withSuccessHandler(function(data) {
          window.cacheWOData = data || [];
          var tbody = document.getElementById('bodyRiwayatWO');
          if (!tbody) return;
          tbody.innerHTML = '';
          if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="17" style="text-align:center;">Belum ada data WO.</td></tr>'; return; }
          data.forEach(function(r) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td style="text-align:center;"><button class="btn-edit" onclick="openModalEditWO(' + r.rowIndex + ')">✏️ Edit</button></td>' +
                           '<td>' + r.tanggal + '</td><td><b>' + r.noWO + '</b></td><td>' + r.shiftReg + '</td><td>' + r.line + '</td>' +
                           '<td>' + r.mesin + '</td><td>' + r.jenisPekerjaan + '</td><td><b>' + r.jenisKode + '</b></td>' +
                           '<td>' + r.problem + '</td><td>' + r.penyebab + '</td><td style="background:#fff9e6;font-weight:bold;">' + r.partBermasalah + '</td>' +
                           '<td>' + r.action + '</td><td>' + r.namaPerbaikan + '</td><td>' + (r.statusSelesai === '✓' ? 'SELESAI' : 'BELUM') + '</td>' +
                           '<td>' + r.durasiPerbaikan + ' mnt</td><td>' + (r.rcfaYes === '✓' ? 'YES' : 'NO') + '</td><td>' + (r.picRcfa || '-') + '</td>';
            tbody.appendChild(tr);
          });
        })
        .withFailureHandler(function() {})
        .getLaporanData();
    };

    window.loadPMTableData = function() {
      window.google.script.run
        .withSuccessHandler(function(data) {
          window.cachePMData = data || [];
          window.renderPMTable(window.cachePMData);
        })
        .withFailureHandler(function() {})
        .getHistoriPMData();
    };

    window.applyPMFilter = function() {
      var tgl = document.getElementById('filterPmTanggal').value;
      var line = document.getElementById('filterPmLine').value;
      var jenis = document.getElementById('filterPmJenis').value;

      window.savedPMFilter = { tanggal: tgl, line: line, jenisPM: jenis };

      var tbody = document.getElementById('bodyRiwayatPM');
      if (tbody) tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;">Mencari data...</td></tr>';

      window.google.script.run
        .withSuccessHandler(function(data) {
          window.cachePMData = data || [];
          window.renderPMTable(window.cachePMData);
        })
        .withFailureHandler(function(err) {
          if (tbody) tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; color:red;">Gagal mengambil data filter.</td></tr>';
        })
        .getFilteredHistoriPMData(window.savedPMFilter);
    };

    window.filterPMHariIni = function() {
      document.getElementById('filterPmTanggal').value = window.todayLocal();
      document.getElementById('filterPmLine').value = '';
      document.getElementById('filterPmJenis').value = '';
      window.applyPMFilter();
    };

    window.resetPMFilter = function() {
      window.savedPMFilter = { tanggal: '', line: '', jenisPM: '' };
      document.getElementById('filterPmTanggal').value = '';
      document.getElementById('filterPmLine').value = '';
      document.getElementById('filterPmJenis').value = '';
      window.loadPMTableData();
    };

    window.renderPMTable = function(data) {
      var tbody = document.getElementById('bodyRiwayatPM');
      if (!tbody) return;
      tbody.innerHTML = '';
      if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;">Data tidak ditemukan.</td></tr>'; return; }

      data.forEach(function(r) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td style="text-align:center;" class="no-print"><button class="btn-edit" onclick="openModalEditPM(' + r.rowIndex + ')">✏️ Edit</button></td>' +
                       '<td>' + r.hari + '</td><td>' + r.tanggal + '</td><td>' + r.line + '</td><td>' + r.jenisPM + '</td>' +
                       '<td>' + (r.estimasiMulai || '-') + '</td><td>' + (r.estimasiSelesai || '-') + '</td><td>' + (r.estimasiPreheating || '-') + '</td>' +
                       '<td>' + r.mesin + '</td><td>' + (r.pic || '-') + '</td><td>' + (r.jamSelesai || '-') + '</td><td>' + (r.keterangan || '-') + '</td>';
        tbody.appendChild(tr);
      });
    };

    window.printHistoriPM = function() { window.print(); };

    window.sendPMToWhatsApp = function() {
      if (!window.cachePMData || window.cachePMData.length === 0) { alert('Tidak ada data PM!'); return; }
      document.getElementById('modalPilihWA').style.display = 'flex';
    };

    window.kirimPMWhatsApp = function(format) {
      window.closeModal('modalPilihWA');
      if (!window.cachePMData || !window.cachePMData.length) return;
      var sample = window.cachePMData[0];
      var text = '*LAPORAN PREVENTIVE MAINTENANCE*\n📅 Tanggal: ' + sample.tanggal + '\n🏭 Line: ' + sample.line + '\n🛠️ Jenis: ' + sample.jenisPM;
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
    };

    window.openModalEditWO = function(rowIndex) {
      var item = (window.cacheWOData || []).find(function(x) { return x.rowIndex === rowIndex; });
      if (!item) return;
      document.getElementById('editWoRowIndex').value = item.rowIndex;
      document.getElementById('editWoNoWO').value = item.noWO;
      document.getElementById('editWoTanggal').value = item.rawTanggal || '';
      document.getElementById('editWoShiftReg').value = item.shiftReg;
      document.getElementById('editWoLine').value = item.line;
      document.getElementById('editWoMesin').value = item.mesin;
      document.getElementById('modalEditWO').style.display = 'flex';
    };

    window.openModalEditPM = function(rowIndex) {
      var item = (window.cachePMData || []).find(function(x) { return x.rowIndex === rowIndex; });
      if (!item) return;
      document.getElementById('editPmRowIndex').value = item.rowIndex;
      document.getElementById('editPmTanggal').value = item.rawTanggal || '';
      document.getElementById('editPmHari').value = item.hari;
      document.getElementById('editPmLine').value = item.line;
      document.getElementById('editPmMesin').value = item.mesin;
      document.getElementById('editPmJenisPM').value = item.jenisPM;
      document.getElementById('editPmPic').value = item.pic;
      document.getElementById('editPmEstMulai').value = item.estimasiMulai;
      document.getElementById('editPmEstSelesai').value = item.estimasiSelesai;
      document.getElementById('editPmEstPreheating').value = item.estimasiPreheating;
      document.getElementById('editPmJamSelesai').value = item.jamSelesai;
      document.getElementById('editPmKeterangan').value = item.keterangan;
      document.getElementById('modalEditPM').style.display = 'flex';
    };

    window.handleEditWOSubmit = function(e) {
      e.preventDefault();
      var payload = { 
        rowIndex: parseInt(document.getElementById('editWoRowIndex').value, 10), 
        noWO: document.getElementById('editWoNoWO').value,
        tanggal: document.getElementById('editWoTanggal').value, 
        shiftReg: document.getElementById('editWoShiftReg').value 
      };
      window.google.script.run
        .withSuccessHandler(function(res) { if (res.success) { alert('✅ Berhasil diperbarui!'); window.closeModal('modalEditWO'); window.loadWOTableData(); } })
        .withFailureHandler(function(err) { alert('❌ Gagal: ' + err.message); })
        .updateLaporanWO(payload);
    };

    window.handleEditPMSubmit = function(e) {
      e.preventDefault();
      var payload = {
        rowIndex: parseInt(document.getElementById('editPmRowIndex').value, 10),
        tanggal: document.getElementById('editPmTanggal').value,
        hari: document.getElementById('editPmHari').value,
        line: document.getElementById('editPmLine').value,
        mesin: document.getElementById('editPmMesin').value,
        jenisPM: document.getElementById('editPmJenisPM').value,
        pic: document.getElementById('editPmPic').value,
        estimasiMulai: document.getElementById('editPmEstMulai').value,
        estimasiSelesai: document.getElementById('editPmEstSelesai').value,
        estimasiPreheating: document.getElementById('editPmEstPreheating').value,
        jamSelesai: document.getElementById('editPmJamSelesai').value,
        keterangan: document.getElementById('editPmKeterangan').value
      };
      window.google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            alert('✅ Histori PM berhasil diperbarui!');
            window.closeModal('modalEditPM');
            window.loadPMTableData();
          }
        })
        .withFailureHandler(function(err) { alert('❌ Gagal: ' + err.message); })
        .updateHistoriPM(payload);
    };
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!DOCTYPE html>
      <html>
      <head>
        <base target="_top">
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laporan Kegiatan Maintenance</title>
        <style>
          * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          body { margin: 0; padding: 0; background-color: #f1f5f9; color: #334155; }
          .app-header { background-color: #1e293b; color: white; padding: 12px 20px; font-size: 18px; font-weight: bold; display: flex; align-items: center; gap: 10px; }
          .tab-bar { display: flex; background-color: #1e293b; }
          .tab-btn { flex: 1; padding: 12px; border: none; background-color: #334155; color: #94a3b8; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
          .tab-btn.active { background-color: #10b981; color: white; }
          .container { padding: 20px; max-width: 100%; }
          .panel { background: white; padding: 20px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
          .grid-4 { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; }
          .grid-4 > .form-group { flex: 1 1 calc(25% - 15px); min-width: 200px; }
          .grid-2 { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; }
          .grid-2 > .form-group { flex: 1 1 calc(50% - 15px); min-width: 280px; }
          .grid-3 { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; }
          .grid-3 > .form-group { flex: 1 1 calc(33.333% - 15px); min-width: 220px; }
          .form-group { display: flex; flex-direction: column; gap: 6px; }
          .form-group label { font-size: 13px; font-weight: 600; color: #475569; }
          .form-group input, .form-group select, .form-group textarea { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 14px; outline: none; }
          .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #10b981; }
          .form-group textarea { resize: vertical; min-height: 80px; }
          .read-only-input { background-color: #f1f5f9; font-weight: bold; text-align: center; }
          .highlight-box { background-color: #fffbebf5; border: 1px solid #fde68a; padding: 12px; border-radius: 6px; }
          .highlight-box label { color: #d97706; font-weight: bold; }
          .highlight-box input { border-color: #fcd34d; }
          .btn-green { background-color: #10b981; color: white; padding: 12px; border: none; border-radius: 4px; font-weight: bold; font-size: 15px; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .btn-green:hover { background-color: #059669; }
          .sub-tab-bar { display: flex; gap: 10px; margin-bottom: 15px; }
          .sub-tab-btn { padding: 8px 16px; border: 1px solid #cbd5e1; background-color: #f8fafc; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 13px; }
          .sub-tab-btn.active { background-color: #10b981; color: white; border-color: #10b981; }
          .table-container { overflow-x: auto; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; white-space: nowrap; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; text-align: center; vertical-align: middle; }
          .btn-edit { background-color: #f59e0b; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; }
          .btn-edit:hover { background-color: #d97706; }
          .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
          .modal-content { background: white; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
          .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
          .modal-header h3 { margin: 0; }
          .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; }
          @media print {
            body * { visibility: hidden; }
            #containerRiwayatPM, #containerRiwayatPM * { visibility: visible; }
            #containerRiwayatPM { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>

        <div class="app-header">
          <span style="flex: 1;">📋 Laporan Kegiatan - Maintenance Pipa Lemah Abang</span>
        </div>

        <div class="tab-bar">
          <button class="tab-btn active" id="tabBtnWO" onclick="window.switchMainTab('wo')">📝 Input Laporan Maintenance</button>
          <button class="tab-btn" id="tabBtnPM" onclick="window.switchMainTab('pm_massal')">🛠️ Input PM Line</button>
          <button class="tab-btn" id="tabBtnRiwayat" onclick="window.switchMainTab('riwayat')">📊 Lihat Riwayat Tabel</button>
        </div>

        <div class="container">
          <!-- FORM 1: INPUT WO -->
          <div id="panelWO" class="panel">
            <form id="formWO" onsubmit="window.handleWOSubmit(event)">
              <div class="grid-4">
                <div class="form-group"><label>Tanggal *</label><input type="date" id="woTanggal" required></div>
                <div class="form-group">
                  <label>Shift & Reg *</label>
                  <select id="woShiftReg" required>
                    <option value="">-- Pilih Shift & Reg --</option>
                    <option value="1A">1A</option><option value="1B">1B</option><option value="1C">1C</option><option value="1D">1D</option>
                    <option value="2A">2A</option><option value="2B">2B</option><option value="2C">2C</option><option value="2D">2D</option>
                    <option value="3A">3A</option><option value="3B">3B</option><option value="3C">3C</option><option value="3D">3D</option><option value="NS">NS</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Line *</label>
                  <select id="woLineSelect" onchange="window.onWOLineChange()" required>
                    <option value="">-- Pilih Line --</option>
                    <option value="09">Line 09</option><option value="10">Line 10</option><option value="11">Line 11</option>
                    <option value="12">Line 12</option><option value="13">Line 13</option><option value="14">Line 14</option>
                    <option value="15">Line 15</option><option value="16">Line 16</option><option value="17">Line 17</option>
                    <option value="18">Line 18</option><option value="19">Line 19</option><option value="20">Line 20</option>
                    <option value="21">Line 21</option><option value="22">Line 22</option><option value="23">Line 23</option>
                    <option value="24">Line 24</option>
                    <option value="Mixing_L1">Mixing_L1</option><option value="Mixing_L2">Mixing_L2</option>
                    <option value="Utility">Utility</option><option value="QA">QA</option><option value="Crusher">Crusher</option><option value="Fabrikasi">Fabrikasi</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Mesin *</label>
                  <select id="woMesinSelect" required disabled><option value="">-- Pilih Line Dahulu --</option></select>
                </div>
              </div>

              <div class="grid-3">
                <div class="form-group">
                  <label>Jenis Pekerjaan *</label>
                  <select id="woJenisPekerjaan" onchange="window.onWOJenisChange()" required>
                    <option value="Breakdown (Stop)">Breakdown (Stop)</option>
                    <option value="Breakdown (Running)">Breakdown (Running)</option>
                    <option value="Corrective (Improvement)">Corrective (Improvement)</option>
                    <option value="Preventive Maintenance (PM)">Preventive Maintenance (PM)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Target PM</label>
                  <select id="woTargetPM" onchange="window.onWOTargetPMChange()" disabled>
                    <option value="">-- Pilih Jam --</option>
                    <option value="1000">1000 Jam</option><option value="2000">2000 Jam</option>
                    <option value="3000">3000 Jam</option><option value="4000">4000 Jam</option>
                    <option value="5000">5000 Jam</option><option value="6000">6000 Jam</option>
                    <option value="6000-2">6000-2 Jam</option><option value="Additional">Additional</option>
                  </select>
                </div>
                <div class="form-group" id="groupWOAdditional" style="display: none;">
                  <label>Keterangan Target PM *</label>
                  <input type="text" id="woKetAdditional" placeholder="Keterangan..." oninput="window.updateWOKodePekerjaan()">
                </div>
                <div class="form-group">
                  <label>Kode Pekerjaan</label>
                  <input type="text" id="woJenisKode" value="BD-S" class="read-only-input" readonly>
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group"><label>Problem / Abnormality *</label><textarea id="woProblem" required></textarea></div>
                <div class="form-group"><label>Penyebab (Root Cause) *</label><textarea id="woPenyebab" required></textarea></div>
              </div>

              <div class="grid-2">
                <div class="form-group highlight-box"><label>PART YANG BERMASALAH *</label><input type="text" id="woPart" required></div>
                <div class="form-group"><label>Action *</label><textarea id="woAction" required></textarea></div>
              </div>

              <div class="grid-4">
                <div class="form-group"><label>Jam Mulai *</label><input type="time" id="woJamMulai" onchange="window.calculateWODurasi()" required></div>
                <div class="form-group"><label>Jam Selesai *</label><input type="time" id="woJamSelesai" onchange="window.calculateWODurasi()" required></div>
                <div class="form-group"><label>Durasi (Menit)</label><input type="number" id="woDurasi" class="read-only-input" value="0" readonly></div>
                <div class="form-group"><label>Nama PIC *</label><input type="text" id="woNamaPIC" required></div>
              </div>

              <div class="grid-3">
                <div class="form-group">
                  <label>Status Perbaikan *</label>
                  <select id="woStatus" required><option value="SELESAI">SELESAI</option><option value="BELUM SELESAI">BELUM SELESAI</option></select>
                </div>
                <div class="form-group">
                  <label>Membutuhkan RCFA? *</label>
                  <select id="woRCFA" onchange="window.toggleWORCFAPic()" required><option value="NO">NO</option><option value="YES">YES</option></select>
                </div>
                <div class="form-group"><label>PIC RCFA</label><input type="text" id="woPicRCFA" disabled></div>
              </div>

              <button type="submit" class="btn-green">💾 Simpan Laporan Akhir</button>
            </form>
          </div>

          <!-- FORM 2: INPUT PM MASSAL -->
          <div id="panelPMMassal" class="panel" style="display: none;">
            <div class="grid-4">
              <div class="form-group"><label>Tanggal PM *</label><input type="date" id="pmTanggal" onchange="window.onPMTanggalChange()"></div>
              <div class="form-group"><label>Hari</label><input type="text" id="pmHari" class="read-only-input" readonly></div>
              <div class="form-group">
                <label>Line *</label>
                <select id="pmLineSelect" onchange="window.generatePMMesinTable()">
                  <option value="">-- Pilih Line --</option>
                  <option value="09">Line 09</option><option value="10">Line 10</option><option value="11">Line 11</option>
                  <option value="12">Line 12</option><option value="13">Line 13</option><option value="14">Line 14</option>
                  <option value="15">Line 15</option><option value="16">Line 16</option><option value="17">Line 17</option>
                  <option value="18">Line 18</option><option value="19">Line 19</option><option value="20">Line 20</option>
                  <option value="21">Line 21</option><option value="22">Line 22</option><option value="23">Line 23</option>
                  <option value="24">Line 24</option>
                </select>
              </div>
              <div class="form-group">
                <label>Target PM *</label>
                <select id="pmJenisSelect" onchange="window.onPMMassalTargetChange()">
                  <option value="">-- Pilih Target PM --</option>
                  <option value="1000">1000 Jam</option><option value="2000">2000 Jam</option>
                  <option value="3000">3000 Jam</option><option value="4000">4000 Jam</option>
                  <option value="5000">5000 Jam</option><option value="6000">6000 Jam</option>
                  <option value="6000-2">6000-2 Jam</option><option value="Additional">Additional</option>
                </select>
              </div>
              <div class="form-group" id="groupPMMassalAdditional" style="display: none;">
                <label>Keterangan Target PM *</label>
                <input type="text" id="pmKetAdditional" placeholder="Keterangan...">
              </div>
            </div>

            <div class="grid-3">
              <div class="form-group"><label>Jam Mulai</label><input type="time" id="pmEstMulai"></div>
              <div class="form-group"><label>Est. Selesai</label><input type="time" id="pmEstSelesai"></div>
              <div class="form-group"><label>Est. Preheating</label><input type="time" id="pmEstPreheating"></div>
            </div>

            <div style="font-weight: bold; margin: 15px 0 10px 0;">Daftar Eksekusi Mesin Line</div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width: 25%;">Mesin</th>
                    <th style="width: 25%;">PIC / Teknisi</th>
                    <th style="width: 20%;">Jam Selesai Aktual</th>
                    <th style="width: 30%;">Keterangan</th>
                  </tr>
                </thead>
                <tbody id="pmMesinTableBody">
                  <tr><td colspan="4" style="text-align: center; color: #64748b;">Pilih Line terlebih dahulu.</td></tr>
                </tbody>
              </table>
            </div>

            <div style="margin-top: 15px;">
              <button onclick="window.submitPMMassalData()" class="btn-green">💾 Simpan Laporan PM Line</button>
            </div>
          </div>

          <!-- PANEL 3: RIWAYAT TABEL -->
          <div id="panelRiwayat" class="panel" style="display: none;">
            <div class="sub-tab-bar">
              <button class="sub-tab-btn active" id="btnSubWO" onclick="window.toggleRiwayatSubView('wo')">📋 Riwayat Laporan WO</button>
              <button class="sub-tab-btn" id="btnSubPM" onclick="window.toggleRiwayatSubView('pm')">🛠️ Histori PM Line</button>
            </div>

            <div id="filterPMArea" style="display: none; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1; margin-bottom: 15px;">
              <div class="grid-4" style="margin-bottom: 0;">
                <div class="form-group"><label>Filter Tanggal PM</label><input type="date" id="filterPmTanggal"></div>
                <div class="form-group">
                  <label>Filter Line</label>
                  <select id="filterPmLine">
                    <option value="">-- Semua Line --</option>
                    <option value="09">Line 09</option><option value="10">Line 10</option><option value="11">Line 11</option>
                    <option value="12">Line 12</option><option value="13">Line 13</option><option value="14">Line 14</option>
                    <option value="15">Line 15</option><option value="16">Line 16</option><option value="17">Line 17</option>
                    <option value="18">Line 18</option><option value="19">Line 19</option><option value="20">Line 20</option>
                    <option value="21">Line 21</option><option value="22">Line 22</option><option value="23">Line 23</option>
                    <option value="24">Line 24</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Filter Jenis PM</label>
                  <select id="filterPmJenis">
                    <option value="">-- Semua Jenis PM --</option>
                    <option value="1000">1000 Jam</option><option value="2000">2000 Jam</option>
                    <option value="3000">3000 Jam</option><option value="4000">4000 Jam</option>
                    <option value="5000">5000 Jam</option><option value="6000">6000 Jam</option>
                    <option value="6000-2">6000-2 Jam</option><option value="Additional">Additional</option>
                  </select>
                </div>
                <div class="form-group" style="justify-content: flex-end;">
                  <button type="button" onclick="window.applyPMFilter()" class="btn-green" style="height: 40px; width: 100%;">🔍 Cari / Filter</button>
                </div>
                <div class="form-group" style="justify-content: flex-end;">
                  <button type="button" onclick="window.resetPMFilter()" style="height: 40px; width: 100%; background-color: #64748b; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">🔄 Reset</button>
                </div>
              </div>

              <div style="display: flex; gap: 10px; margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 12px; flex-wrap: wrap;">
                <button type="button" onclick="window.filterPMHariIni()" style="background-color: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">📅 Hari Ini</button>
                <button type="button" onclick="window.printHistoriPM()" style="background-color: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">🖨️ Print Histori PM</button>
                <button type="button" onclick="window.sendPMToWhatsApp()" style="background-color: #25D366; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">📲 Kirim Laporan ke WA</button>
              </div>
            </div>

            <!-- TABEL WO -->
            <div id="containerRiwayatWO" class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width: 60px;">AKSI</th>
                    <th>TANGGAL</th><th>NO WO</th><th>SHIFT</th><th>LINE</th><th>MESIN</th>
                    <th>JENIS</th><th>KODE</th><th>PROBLEM</th><th>PENYEBAB</th>
                    <th style="background-color:#fff9e6;">PART BERMASALAH</th>
                    <th>ACTION</th><th>NAMA PIC</th><th>STATUS</th><th>DURASI</th><th>RCFA</th><th>PIC RCFA</th>
                  </tr>
                </thead>
                <tbody id="bodyRiwayatWO"><tr><td colspan="17" style="text-align: center;">Memuat data WO...</td></tr></tbody>
              </table>
            </div>

            <!-- TABEL PM -->
            <div id="containerRiwayatPM" class="table-container" style="display: none;">
              <table>
                <thead>
                  <tr style="background-color: #d9ead3;">
                    <th style="width: 60px;" class="no-print">Aksi</th>
                    <th style="width: 70px;">Hari</th><th style="width: 90px;">Tanggal</th><th style="width: 50px;">Line</th>
                    <th style="width: 250px;">Jenis PM</th><th style="width: 85px;">Jam Mulai</th><th style="width: 85px;">Est. Selesai</th>
                    <th style="width: 95px;">Est. Preheating</th><th style="width: 140px;">Mesin</th><th style="width: 120px;">PIC</th>
                    <th style="width: 85px;">Jam Selesai</th><th>Keterangan</th>
                  </tr>
                </thead>
                <tbody id="bodyRiwayatPM"><tr><td colspan="12" style="text-align: center;">Memuat data PM...</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- MODAL PILIH WA -->
        <div id="modalPilihWA" class="modal-overlay" style="display: none;">
          <div class="modal-content" style="max-width: 420px;">
            <div class="modal-header"><h3>📲 Pilih Format Laporan</h3><button class="close-btn" onclick="window.closeModal('modalPilihWA')">&times;</button></div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button class="btn-green" onclick="window.kirimPMWhatsApp('pendek')">📝 Teks Pendek (ringkas + status)</button>
              <button class="btn-green" style="background-color: #0284c7;" onclick="window.kirimPMWhatsApp('lengkap')">📄 Teks Lengkap (detail per mesin)</button>
            </div>
          </div>
        </div>

        <!-- MODAL EDIT WO -->
        <div id="modalEditWO" class="modal-overlay" style="display: none;">
          <div class="modal-content">
            <div class="modal-header"><h3>✏️ Edit Laporan WO</h3><button class="close-btn" onclick="window.closeModal('modalEditWO')">&times;</button></div>
            <form id="formEditWO" onsubmit="window.handleEditWOSubmit(event)">
              <input type="hidden" id="editWoRowIndex"><input type="hidden" id="editWoNoWO">
              <div class="grid-4">
                <div class="form-group"><label>Tanggal</label><input type="date" id="editWoTanggal" required></div>
                <div class="form-group">
                  <label>Shift & Reg</label>
                  <select id="editWoShiftReg" required>
                    <option value="1A">1A</option><option value="1B">1B</option><option value="1C">1C</option><option value="1D">1D</option>
                    <option value="2A">2A</option><option value="2B">2B</option><option value="2C">2C</option><option value="2D">2D</option>
                    <option value="3A">3A</option><option value="3B">3B</option><option value="3C">3C</option><option value="3D">3D</option><option value="NS">NS</option>
                  </select>
                </div>
                <div class="form-group"><label>Line</label><input type="text" id="editWoLine" class="read-only-input" readonly></div>
                <div class="form-group"><label>Mesin</label><input type="text" id="editWoMesin" class="read-only-input" readonly></div>
              </div>
              <button type="submit" class="btn-green">💾 Update Laporan WO</button>
            </form>
          </div>
        </div>

        <!-- MODAL EDIT PM -->
        <div id="modalEditPM" class="modal-overlay" style="display: none;">
          <div class="modal-content">
            <div class="modal-header"><h3>✏️ Edit Histori PM Line</h3><button class="close-btn" onclick="window.closeModal('modalEditPM')">&times;</button></div>
            <form id="formEditPM" onsubmit="window.handleEditPMSubmit(event)">
              <input type="hidden" id="editPmRowIndex">
              <div class="grid-4">
                <div class="form-group"><label>Tanggal</label><input type="date" id="editPmTanggal" required></div>
                <div class="form-group"><label>Hari</label><input type="text" id="editPmHari" class="read-only-input" readonly></div>
                <div class="form-group"><label>Line</label><input type="text" id="editPmLine" class="read-only-input" readonly></div>
                <div class="form-group"><label>Mesin</label><input type="text" id="editPmMesin" class="read-only-input" readonly></div>
              </div>
              <div class="grid-2">
                <div class="form-group"><label>Jenis PM</label><input type="text" id="editPmJenisPM" class="read-only-input" readonly></div>
                <div class="form-group"><label>PIC / Teknisi</label><input type="text" id="editPmPic" required></div>
              </div>
              <div class="grid-4">
                <div class="form-group"><label>Jam Mulai</label><input type="time" id="editPmEstMulai"></div>
                <div class="form-group"><label>Est. Selesai</label><input type="time" id="editPmEstSelesai"></div>
                <div class="form-group"><label>Est. Preheating</label><input type="time" id="editPmEstPreheating"></div>
                <div class="form-group"><label>Jam Selesai Aktual</label><input type="time" id="editPmJamSelesai"></div>
              </div>
              <div class="form-group" style="margin-bottom: 15px;"><label>Keterangan</label><textarea id="editPmKeterangan"></textarea></div>
              <button type="submit" class="btn-green">💾 Update Data PM</button>
            </form>
          </div>
        </div>

      </body>
      </html>
    ` }} />
  );
}