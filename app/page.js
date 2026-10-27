'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Jalankan skrip inisialisasi awal saat halaman dimuat
    const today = new Date().toISOString().slice(0, 10);
    const elWO = document.getElementById('woTanggal');
    const elPM = document.getElementById('pmTanggal');
    if (elWO) elWO.value = today;
    if (elPM) elPM.value = today;
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
          th { background-color: #f8fafc; font-weight: bold; text-align: center; }
          .btn-edit { background-color: #f59e0b; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>

        <div class="app-header">
          <span style="flex: 1;">📋 Laporan Kegiatan - Maintenance Pipa Lemah Abang</span>
        </div>

        <div class="tab-bar">
          <button class="tab-btn active" id="tabBtnWO" onclick="switchMainTab('wo')">📝 Input Laporan Maintenance</button>
          <button class="tab-btn" id="tabBtnPM" onclick="switchMainTab('pm_massal')">🛠️ Input PM Line</button>
          <button class="tab-btn" id="tabBtnRiwayat" onclick="switchMainTab('riwayat')">📊 Lihat Riwayat Tabel</button>
        </div>

        <div class="container">
          <!-- FORM WO -->
          <div id="panelWO" class="panel">
            <form id="formWO" onsubmit="handleWOSubmit(event)">
              <div class="grid-4">
                <div class="form-group">
                  <label>Tanggal *</label>
                  <input type="date" id="woTanggal" required>
                </div>
                <div class="form-group">
                  <label>Shift & Reg *</label>
                  <select id="woShiftReg" required>
                    <option value="">-- Pilih Shift & Reg --</option>
                    <option value="1A">1A</option><option value="1B">1B</option><option value="1C">1C</option><option value="1D">1D</option>
                    <option value="2A">2A</option><option value="2B">2B</option><option value="2C">2C</option><option value="2D">2D</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Line *</label>
                  <select id="woLineSelect" onchange="onWOLineChange()" required>
                    <option value="">-- Pilih Line --</option>
                    <option value="09">Line 09</option><option value="10">Line 10</option><option value="11">Line 11</option>
                    <option value="12">Line 12</option><option value="13">Line 13</option><option value="14">Line 14</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Mesin *</label>
                  <select id="woMesinSelect" required disabled>
                    <option value="">-- Pilih Line Dahulu --</option>
                  </select>
                </div>
              </div>

              <div class="grid-3">
                <div class="form-group">
                  <label>Jenis Pekerjaan *</label>
                  <select id="woJenisPekerjaan" required>
                    <option value="Breakdown (Stop)">Breakdown (Stop)</option>
                    <option value="Breakdown (Running)">Breakdown (Running)</option>
                    <option value="Corrective (Improvement)">Corrective (Improvement)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Kode Pekerjaan</label>
                  <input type="text" id="woJenisKode" value="BD-S" class="read-only-input" readonly>
                </div>
                <div class="form-group">
                  <label>Status Perbaikan *</label>
                  <select id="woStatus" required>
                    <option value="SELESAI">SELESAI</option>
                    <option value="BELUM SELESAI">BELUM SELESAI</option>
                  </select>
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label>Problem / Abnormality *</label>
                  <textarea id="woProblem" required></textarea>
                </div>
                <div class="form-group">
                  <label>Penyebab (Root Cause) *</label>
                  <textarea id="woPenyebab" required></textarea>
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group highlight-box">
                  <label>PART YANG BERMASALAH *</label>
                  <input type="text" id="woPart" required>
                </div>
                <div class="form-group">
                  <label>Action *</label>
                  <textarea id="woAction" required></textarea>
                </div>
              </div>

              <div class="grid-4">
                <div class="form-group">
                  <label>Durasi (Menit)</label>
                  <input type="number" id="woDurasi" value="0">
                </div>
                <div class="form-group">
                  <label>Nama PIC *</label>
                  <input type="text" id="woNamaPIC" required>
                </div>
                <div class="form-group">
                  <label>RCFA? *</label>
                  <select id="woRCFA">
                    <option value="NO">NO</option>
                    <option value="YES">YES</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>PIC RCFA</label>
                  <input type="text" id="woPicRCFA">
                </div>
              </div>

              <button type="submit" class="btn-green">💾 Simpan Laporan Akhir</button>
            </form>
          </div>

          <!-- TABEL RIWAYAT -->
          <div id="panelRiwayat" class="panel" style="display: none;">
            <div class="sub-tab-bar">
              <button class="sub-tab-btn active" onclick="loadWOTable()">📋 Riwayat Laporan WO</button>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>TANGGAL</th><th>NO WO</th><th>SHIFT</th><th>LINE</th><th>MESIN</th>
                    <th>PROBLEM</th><th>PENYEBAB</th><th>PART BERMASALAH</th><th>ACTION</th><th>PIC</th>
                  </tr>
                </thead>
                <tbody id="bodyRiwayatWO">
                  <tr><td colspan="10" style="text-align: center;">Memuat data...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <script>
          function switchMainTab(tab) {
            document.getElementById('panelWO').style.display = tab === 'wo' ? 'block' : 'none';
            document.getElementById('panelRiwayat').style.display = tab === 'riwayat' ? 'block' : 'none';
            if (tab === 'riwayat') loadWOTable();
          }

          function getRawMesinListByLine(lineVal) {
            if (['09', '10', '11'].includes(lineVal)) return ['Material Transport', 'Extruder', 'VCU unit 1', 'HO unit 1', 'CCM unit 1', 'BE'];
            return ['Mesin Umum'];
          }

          function onWOLineChange() {
            var line = document.getElementById('woLineSelect').value;
            var mesinSelect = document.getElementById('woMesinSelect');
            mesinSelect.innerHTML = '<option value="">-- Pilih Mesin --</option>';
            mesinSelect.disabled = !line;
            if (!line) return;
            getRawMesinListByLine(line).forEach(function(m) {
              var opt = document.createElement('option');
              opt.value = m;
              opt.textContent = m;
              mesinSelect.appendChild(opt);
            });
          }

          async function handleWOSubmit(e) {
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
              durasiPerbaikan: document.getElementById('woDurasi').value || 0,
              namaPerbaikan: document.getElementById('woNamaPIC').value,
              statusUtama: document.getElementById('woStatus').value,
              rcfaChoice: document.getElementById('woRCFA').value,
              picRcfa: document.getElementById('woPicRCFA').value
            };

            try {
              var res = await fetch('/api/sheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'submitLaporanAkhir', data: payload })
              });
              var result = await res.json();
              if (result.success) {
                alert('✅ Berhasil disimpan dengan No WO: ' + result.noWO);
                document.getElementById('formWO').reset();
              } else {
                alert('❌ Gagal: ' + result.message);
              }
            } catch (err) {
              alert('❌ Error koneksi: ' + err.message);
            }
          }

          async function loadWOTable() {
            var tbody = document.getElementById('bodyRiwayatWO');
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Memuat data...</td></tr>';
            try {
              var res = await fetch('/api/sheets?action=getLaporanData');
              var result = await res.json();
              if (result.success && result.data.length > 0) {
                tbody.innerHTML = '';
                result.data.forEach(function(r) {
                  var tr = document.createElement('tr');
                  tr.innerHTML = '<td>' + r.tanggal + '</td>' +
                                 '<td><b>' + r.noWO + '</b></td>' +
                                 '<td>' + r.shiftReg + '</td>' +
                                 '<td>' + r.line + '</td>' +
                                 '<td>' + r.mesin + '</td>' +
                                 '<td>' + r.problem + '</td>' +
                                 '<td style="background:#fff9e6;font-weight:bold;">' + r.partBermasalah + '</td>' +
                                 '<td>' + r.action + '</td>' +
                                 '<td>' + r.namaPerbaikan + '</td>';
                  tbody.appendChild(tr);
                });
              } else {
                tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Belum ada data laporan.</td></tr>';
              }
            } catch (err) {
              tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:red;">Gagal memuat data.</td></tr>';
            }
          }
        </script>
      </body>
      </html>
    ` }} />
  );
}