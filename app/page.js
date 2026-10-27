'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const elWO = document.getElementById('woTanggal');
    const elPM = document.getElementById('pmTanggal');
    if (elWO) elWO.value = today;
    if (elPM) elPM.value = today;

    // --- DAFTAR MESIN BERDASARKAN LINE ---
    window.getRawMesinListByLine = function(lineVal) {
      if (['09', '10', '11'].includes(lineVal)) return ['Material Transport', 'Extruder', 'VCU unit 1', 'VCU unit 2', 'ECU unit 1', 'ECU unit 2', 'HO unit 1', 'HO unit 2', 'CCM unit 1', 'CCM unit 2', 'BE', 'Bundling', 'Straping', 'Inclining'];
      if (['12', '13', '23'].includes(lineVal)) return ['Material Transport', 'Extruder', 'VCU unit 1', 'VCU unit 2', 'HO unit 1', 'HO unit 2', 'CCM unit 1', 'CCM unit 2', 'BE', 'Inclining unit 1', 'Inclining unit 2'];
      if (lineVal === '21') return ['Material Transport', 'Extruder', 'VCU', 'ECU', 'HO', 'CCM', 'BE', 'Pelontar'];
      if (lineVal === '18') return ['Material Transport', 'Extruder', 'Cooling Bath', 'HO', 'CCM', 'BE', 'Inclining'];
      if (['14', '15', '16', '17', '19', '20', '22', '24'].includes(lineVal)) return ['Material Transport', 'Extruder', 'VCU', 'ECU', 'HO', 'CCM', 'BE', 'Inclining'];
      if (lineVal === 'Utility') return ['Chiller 12.1', 'Chiller 12.2', 'Kompressor', 'Dryer 1', 'Dryer 2'];
      if (lineVal === 'QA') return ['Bak Pressure Test', 'Impact Test'];
      if (lineVal === 'Crusher') return ['Palman', 'Shredder', 'AKS', 'Pulverizer'];
      return ['Mesin Umum'];
    };

    window.onWOLineChange = function() {
      const line = document.getElementById('woLineSelect').value;
      const mesinSelect = document.getElementById('woMesinSelect');
      mesinSelect.innerHTML = '<option value="">-- Pilih Mesin --</option>';
      mesinSelect.disabled = !line;
      if (!line) return;
      window.getRawMesinListByLine(line).forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        mesinSelect.appendChild(opt);
      });
    };

    // --- TAB SWITCHER ---
    window.switchMainTab = function(tab) {
      document.getElementById('panelWO').style.display = tab === 'wo' ? 'block' : 'none';
      document.getElementById('panelPM').style.display = tab === 'pm_massal' ? 'block' : 'none';
      document.getElementById('panelRiwayat').style.display = tab === 'riwayat' ? 'block' : 'none';

      document.getElementById('tabBtnWO').className = 'tab-btn ' + (tab === 'wo' ? 'active' : '');
      document.getElementById('tabBtnPM').className = 'tab-btn ' + (tab === 'pm_massal' ? 'active' : '');
      document.getElementById('tabBtnRiwayat').className = 'tab-btn ' + (tab === 'riwayat' ? 'active' : '');

      if (tab === 'riwayat') window.loadWOTable();
    };

    window.switchSubRiwayatTab = function(subTab) {
      document.getElementById('subTabWO').className = 'sub-tab-btn ' + (subTab === 'wo' ? 'active' : '');
      document.getElementById('subTabPM').className = 'sub-tab-btn ' + (subTab === 'pm' ? 'active' : '');
      document.getElementById('tableWrapperWO').style.display = subTab === 'wo' ? 'block' : 'none';
      document.getElementById('tableWrapperPM').style.display = subTab === 'pm' ? 'block' : 'none';

      if (subTab === 'wo') window.loadWOTable();
      else window.loadPMTable();
    };

    // --- GENERATE PM ROWS ---
    window.generatePMRows = function() {
      const line = document.getElementById('pmLineSelect').value;
      const container = document.getElementById('pmRowsContainer');
      container.innerHTML = '';
      if (!line) return;

      const mesinList = window.getRawMesinListByLine(line);
      mesinList.forEach((mesin, idx) => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 8px; align-items: center; background: #f8fafc; padding: 8px; border-radius: 4px;';
        div.innerHTML = `
          <div style="flex: 2; font-weight: 600; font-size: 13px;">${mesin}</div>
          <input type="hidden" class="pm-mesin-val" value="${mesin}">
          <div style="flex: 1;"><input type="text" placeholder="PIC" class="pm-pic-val" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;"></div>
          <div style="flex: 1;"><input type="time" class="pm-jam-val" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;"></div>
          <div style="flex: 2;"><input type="text" placeholder="Keterangan / Status" class="pm-ket-val" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;"></div>
        `;
        container.appendChild(div);
      });
    };

    // --- SUBMIT WO ---
    window.handleCustomWOSubmit = async function(event) {
      event.preventDefault();
      const payload = {
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
        const res = await fetch('/api/sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'submitLaporanAkhir', data: payload })
        });
        const result = await res.json();
        if (result.success) {
          alert('✅ Laporan Berhasil Disimpan dengan No WO: ' + result.noWO);
          document.getElementById('formWO').reset();
          document.getElementById('woTanggal').value = today;
        } else {
          alert('❌ Gagal: ' + result.message);
        }
      } catch (err) {
        alert('❌ Error: ' + err.message);
      }
    };

    // --- SUBMIT PM MASSAL ---
    window.handlePMMassalSubmit = async function(event) {
      event.preventDefault();
      const detailMesin = [];
      const rowElements = document.querySelectorAll('#pmRowsContainer > div');
      
      rowElements.forEach(el => {
        const mesin = el.querySelector('.pm-mesin-val').value;
        const pic = el.querySelector('.pm-pic-val').value;
        const jamSelesai = el.querySelector('.pm-jam-val').value;
        const keterangan = el.querySelector('.pm-ket-val').value;
        if (pic || jamSelesai || keterangan) {
          detailMesin.push({ mesin, pic, jamSelesai, keterangan });
        }
      });

      if (detailMesin.length === 0) {
        alert('⚠️ Harap isi minimal 1 data PIC/Jam Selesai pada mesin!');
        return;
      }

      const payload = {
        hari: document.getElementById('pmHari').value,
        tanggal: document.getElementById('pmTanggal').value,
        line: document.getElementById('pmLineSelect').value,
        jenisPM: document.getElementById('pmJenis').value,
        ketAdditional: document.getElementById('pmKetAdditional').value,
        estimasiMulai: document.getElementById('pmMulai').value,
        estimasiSelesai: document.getElementById('pmSelesai').value,
        estimasiPreheating: document.getElementById('pmPreheating').value,
        detailMesin
      };

      try {
        const res = await fetch('/api/sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'submitPMMassal', data: payload })
        });
        const result = await res.json();
        if (result.success) {
          alert('✅ Berhasil menyimpan ' + result.count + ' data Histori PM!');
          document.getElementById('formPM').reset();
          document.getElementById('pmTanggal').value = today;
          document.getElementById('pmRowsContainer').innerHTML = '';
        } else {
          alert('❌ Gagal: ' + result.message);
        }
      } catch (err) {
        alert('❌ Error: ' + err.message);
      }
    };

    // --- LOAD TABEL RIWAYAT WO ---
    window.loadWOTable = async function() {
      const tbody = document.getElementById('bodyRiwayatWO');
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Memuat data...</td></tr>';
      try {
        const res = await fetch('/api/sheets?action=getLaporanData');
        const result = await res.json();
        if (result.success && result.data.length > 0) {
          tbody.innerHTML = '';
          result.data.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${r.tanggal}</td>
              <td><b>${r.noWO}</b></td>
              <td>${r.shiftReg}</td>
              <td>${r.line}</td>
              <td>${r.mesin}</td>
              <td>${r.problem}</td>
              <td style="background:#fff9e6; font-weight:bold;">${r.partBermasalah}</td>
              <td>${r.action}</td>
              <td>${r.namaPerbaikan}</td>
            `;
            tbody.appendChild(tr);
          });
        } else {
          tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Belum ada data laporan.</td></tr>';
        }
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:red;">Gagal memuat data.</td></tr>';
      }
    };

    // --- LOAD TABEL RIWAYAT PM ---
    window.loadPMTable = async function() {
      const tbody = document.getElementById('bodyRiwayatPM');
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Memuat data...</td></tr>';
      try {
        const res = await fetch('/api/sheets?action=getHistoriPMData');
        const result = await res.json();
        if (result.success && result.data.length > 0) {
          tbody.innerHTML = '';
          result.data.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${r.tanggal} (${r.hari})</td>
              <td><b>Line ${r.line}</b></td>
              <td>${r.jenisPM}</td>
              <td>${r.estimasiMulai} - ${r.estimasiSelesai}</td>
              <td>${r.mesin}</td>
              <td>${r.pic}</td>
              <td><b>${r.jamSelesai}</b></td>
              <td>${r.keterangan}</td>
            `;
            tbody.appendChild(tr);
          });
        } else {
          tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Belum ada data Histori PM.</td></tr>';
        }
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:red;">Gagal memuat data PM.</td></tr>';
      }
    };
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laporan Kegiatan Maintenance</title>
        <style>
          * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          body { margin: 0; padding: 0; background-color: #f1f5f9; color: #334155; }
          .app-header { background-color: #1e293b; color: white; padding: 12px 20px; font-size: 18px; font-weight: bold; }
          .tab-bar { display: flex; background-color: #1e293b; }
          .tab-btn { flex: 1; padding: 12px; border: none; background-color: #334155; color: #94a3b8; font-weight: 600; font-size: 14px; cursor: pointer; text-align: center; }
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
          .btn-green { background-color: #10b981; color: white; padding: 12px; border: none; border-radius: 4px; font-weight: bold; font-size: 15px; cursor: pointer; width: 100%; }
          .sub-tab-bar { display: flex; gap: 10px; margin-bottom: 15px; }
          .sub-tab-btn { padding: 8px 16px; border: 1px solid #cbd5e1; background-color: #f8fafc; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 13px; }
          .sub-tab-btn.active { background-color: #10b981; color: white; border-color: #10b981; }
          .table-container { overflow-x: auto; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; white-space: nowrap; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <div class="app-header">📋 Laporan Kegiatan - Maintenance Pipa Lemah Abang</div>

        <div class="tab-bar">
          <button class="tab-btn active" id="tabBtnWO" onclick="window.switchMainTab('wo')">📝 Input Laporan Maintenance</button>
          <button class="tab-btn" id="tabBtnPM" onclick="window.switchMainTab('pm_massal')">🛠️ Input PM Line</button>
          <button class="tab-btn" id="tabBtnRiwayat" onclick="window.switchMainTab('riwayat')">📊 Lihat Riwayat Tabel</button>
        </div>

        <div class="container">
          
          <!-- PANEL 1: INPUT LAPORAN WO -->
          <div id="panelWO" class="panel">
            <form id="formWO" onsubmit="window.handleCustomWOSubmit(event)">
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
                    <option value="Utility">Utility</option><option value="QA">QA</option><option value="Crusher">Crusher</option>
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
                  <select id="woRCFA"><option value="NO">NO</option><option value="YES">YES</option></select>
                </div>
                <div class="form-group">
                  <label>PIC RCFA</label>
                  <input type="text" id="woPicRCFA">
                </div>
              </div>

              <button type="submit" class="btn-green">💾 Simpan Laporan Akhir</button>
            </form>
          </div>

          <!-- PANEL 2: INPUT PM MASSAL -->
          <div id="panelPM" class="panel" style="display: none;">
            <form id="formPM" onsubmit="window.handlePMMassalSubmit(event)">
              <div class="grid-4">
                <div class="form-group">
                  <label>Hari *</label>
                  <select id="pmHari" required>
                    <option value="">-- Pilih Hari --</option>
                    <option value="Senin">Senin</option><option value="Selasa">Selasa</option><option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option><option value="Jumat">Jumat</option><option value="Sabtu">Sabtu</option><option value="Minggu">Minggu</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Tanggal *</label>
                  <input type="date" id="pmTanggal" required>
                </div>
                <div class="form-group">
                  <label>Line *</label>
                  <select id="pmLineSelect" onchange="window.generatePMRows()" required>
                    <option value="">-- Pilih Line --</option>
                    <option value="09">Line 09</option><option value="10">Line 10</option><option value="11">Line 11</option>
                    <option value="12">Line 12</option><option value="13">Line 13</option><option value="14">Line 14</option>
                    <option value="15">Line 15</option><option value="16">Line 16</option><option value="17">Line 17</option>
                    <option value="18">Line 18</option><option value="19">Line 19</option><option value="20">Line 20</option>
                    <option value="21">Line 21</option><option value="22">Line 22</option><option value="23">Line 23</option>
                    <option value="24">Line 24</option>
                    <option value="Utility">Utility</option><option value="QA">QA</option><option value="Crusher">Crusher</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Jenis PM *</label>
                  <select id="pmJenis" required>
                    <option value="Bulanan">Bulanan</option>
                    <option value="Mingguan">Mingguan</option>
                    <option value="Additional">Additional</option>
                  </select>
                </div>
              </div>

              <div class="grid-4">
                <div class="form-group">
                  <label>Estimasi Mulai</label>
                  <input type="time" id="pmMulai" value="08:00">
                </div>
                <div class="form-group">
                  <label>Estimasi Selesai</label>
                  <input type="time" id="pmSelesai" value="12:00">
                </div>
                <div class="form-group">
                  <label>Estimasi Preheating</label>
                  <input type="time" id="pmPreheating" value="07:00">
                </div>
                <div class="form-group">
                  <label>Keterangan Additional (Opsional)</label>
                  <input type="text" id="pmKetAdditional" placeholder="Jika jenis Additional">
                </div>
              </div>

              <h4 style="margin-top: 20px; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px;">Daftar Mesin & PIC</h4>
              <div id="pmRowsContainer" style="margin-bottom: 20px;">
                <p style="color: #64748b; font-style: italic;">Pilih Line terlebih dahulu untuk memunculkan daftar mesin.</p>
              </div>

              <button type="submit" class="btn-green">💾 Simpan Histori PM Massal</button>
            </form>
          </div>

          <!-- PANEL 3: LIHAT RIWAYAT TABEL -->
          <div id="panelRiwayat" class="panel" style="display: none;">
            <div class="sub-tab-bar">
              <button class="sub-tab-btn active" id="subTabWO" onclick="window.switchSubRiwayatTab('wo')">📋 Riwayat Laporan WO</button>
              <button class="sub-tab-btn" id="subTabPM" onclick="window.switchSubRiwayatTab('pm')">🛠️ Riwayat Histori PM</button>
            </div>

            <!-- TABEL WO -->
            <div id="tableWrapperWO" class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>TANGGAL</th><th>NO WO</th><th>SHIFT</th><th>LINE</th><th>MESIN</th>
                    <th>PROBLEM</th><th>PART BERMASALAH</th><th>ACTION</th><th>PIC</th>
                  </tr>
                </thead>
                <tbody id="bodyRiwayatWO">
                  <tr><td colspan="9" style="text-align: center;">Memuat data...</td></tr>
                </tbody>
              </table>
            </div>

            <!-- TABEL PM -->
            <div id="tableWrapperPM" class="table-container" style="display: none;">
              <table>
                <thead>
                  <tr>
                    <th>TANGGAL</th><th>LINE</th><th>JENIS PM</th><th>ESTIMASI WAKTU</th>
                    <th>MESIN</th><th>PIC</th><th>JAM SELESAI</th><th>KETERANGAN</th>
                  </tr>
                </thead>
                <tbody id="bodyRiwayatPM">
                  <tr><td colspan="8" style="text-align: center;">Memuat data...</td></tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </body>
      </html>
    ` }} />
  );
}