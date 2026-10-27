'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('wo');
  const [laporanList, setLaporanList] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const elWO = document.getElementById('woTanggal');
    if (elWO) elWO.value = today;
  }, []);

  // Fungsi ambil data riwayat WO
  async function loadRiwayatWO() {
    setLoadingRiwayat(true);
    try {
      const res = await fetch('/api/sheets?action=getLaporanData');
      const result = await res.json();
      if (result.success) {
        setLaporanList(result.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingRiwayat(false);
  }

  // Ganti tab utama
  function switchTab(tab) {
    setActiveTab(tab);
    if (tab === 'riwayat') {
      loadRiwayatWO();
    }
  }

  // Handler Submit WO
  async function handleCustomWOSubmit(event) {
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
      } else {
        alert('❌ Gagal: ' + result.message);
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f1f5f9', minHeight: '100vh', color: '#334155' }}>
      <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '12px 20px', fontSize: '18px', fontWeight: 'bold' }}>
        📋 Laporan Kegiatan - Maintenance Pipa Lemah Abang (Vercel Ready)
      </div>

      <div style={{ display: 'flex', backgroundColor: '#1e293b' }}>
        <button 
          onClick={() => switchTab('wo')} 
          style={{ flex: 1, padding: '12px', border: 'none', backgroundColor: activeTab === 'wo' ? '#10b981' : '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
          📝 Input Laporan Maintenance
        </button>
        <button 
          onClick={() => switchTab('riwayat')} 
          style={{ flex: 1, padding: '12px', border: 'none', backgroundColor: activeTab === 'riwayat' ? '#10b981' : '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
          📊 Lihat Riwayat Tabel
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'wo' && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <form id="formWO" onSubmit={handleCustomWOSubmit}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Tanggal *</label>
                  <input type="date" id="woTanggal" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Shift & Reg *</label>
                  <select id="woShiftReg" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    <option value="">-- Pilih Shift --</option>
                    <option value="1A">1A</option><option value="1B">1B</option><option value="1C">1C</option><option value="1D">1D</option>
                    <option value="2A">2A</option><option value="2B">2B</option><option value="2C">2C</option><option value="2D">2D</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Line *</label>
                  <select id="woLineSelect" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    <option value="">-- Pilih Line --</option>
                    <option value="09">Line 09</option><option value="10">Line 10</option><option value="11">Line 11</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Mesin *</label>
                  <input type="text" id="woMesinSelect" placeholder="Nama Mesin" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Problem *</label>
                  <textarea id="woProblem" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', minHeight: '80px' }}></textarea>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Penyebab (Root Cause) *</label>
                  <textarea id="woPenyebab" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', minHeight: '80px' }}></textarea>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', background: '#fffbeb', padding: '10px', border: '1px solid #fde68a', borderRadius: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#d97706' }}>PART YANG BERMASALAH *</label>
                  <input type="text" id="woPart" placeholder="Contoh: Bearing 6204" required style={{ padding: '10px', border: '1px solid #fcd34d', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Action *</label>
                  <textarea id="woAction" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', minHeight: '80px' }}></textarea>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Nama PIC *</label>
                  <input type="text" id="woNamaPIC" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Status *</label>
                  <select id="woStatus" style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    <option value="SELESAI">SELESAI</option>
                    <option value="BELUM SELESAI">BELUM SELESAI</option>
                  </select>
                </div>
              </div>

              <input type="hidden" id="woJenisPekerjaan" value="Breakdown (Stop)" />
              <input type="hidden" id="woJenisKode" value="BD-S" />
              <input type="hidden" id="woDurasi" value="30" />
              <input type="hidden" id="woRCFA" value="NO" />
              <input type="hidden" id="woPicRCFA" value="" />

              <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                💾 Simpan Laporan Akhir
              </button>
            </form>
          </div>
        )}

        {activeTab === 'riwayat' && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>📊 Riwayat Laporan Maintenance (WO)</h3>
            {loadingRiwayat ? (
              <p>Memuat data dari Google Sheets...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>TANGGAL</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>NO WO</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>SHIFT</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>LINE</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>MESIN</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>PROBLEM</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>PART BERMASALAH</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>ACTION</th>
                      <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>PIC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporanList.length === 0 ? (
                      <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>Belum ada data laporan.</td></tr>
                    ) : (
                      laporanList.map((item, index) => (
                        <tr key={index}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}>{item.tanggal}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontWeight: 'bold' }}>{item.noWO}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}>{item.shiftReg}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}>{item.line}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}>{item.mesin}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}>{item.problem}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px', backgroundColor: '#fff9e6' }}>{item.partBermasalah}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}>{item.action}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}>{item.namaPerbaikan}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}