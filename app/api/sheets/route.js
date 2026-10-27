import { google } from 'googleapis';
import { NextResponse } from 'next/server';

function getAuth() {
  if (process.env.GOOGLE_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } else {
    return new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
}

const auth = getAuth();
const spreadsheetId = process.env.SPREADSHEET_ID;

// Helper Format Tanggal & Waktu ala Google Script
function formatDate_(value) {
  if (!value) return '';
  try {
    if (typeof value === 'string' && value.includes('-')) {
      const parts = value.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {}
  return String(value);
}

function formatTime_(value) {
  if (!value) return '';
  try {
    const str = String(value).trim();
    if (str.includes(':')) {
      const parts = str.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
  } catch (e) {}
  return String(value);
}

function hitungSelisihMenit_(jamMulai, jamSelesai) {
  try {
    const m = jamMulai.split(':');
    const s = jamSelesai.split(':');
    const totalMulai = parseInt(m[0], 10) * 60 + parseInt(m[1], 10);
    const totalSelesai = parseInt(s[0], 10) * 60 + parseInt(s[1], 10);
    const selisih = totalSelesai - totalMulai;
    return selisih >= 0 ? selisih : 0;
  } catch (e) {
    return 0;
  }
}

// ===== METHOD GET =====
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Get Laporan WO
    if (action === 'getLaporanData') {
      const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Laporan_Akhir_WO!A:R' });
      const rows = response.data.values || [];
      if (rows.length <= 1) return NextResponse.json({ success: true, data: [] });

      const data = rows.slice(1).map((row, idx) => ({
        rowIndex: idx + 2,
        tanggal: formatDate_(row[0]),
        rawTanggal: row[0] || '',
        noWO: row[1] || '',
        shiftReg: row[2] || '',
        line: row[3] || '',
        mesin: row[4] || '',
        jenisPekerjaan: row[5] || '',
        jenisKode: row[6] || '',
        problem: row[7] || '',
        penyebab: row[8] || '',
        partBermasalah: row[9] || '',
        action: row[10] || '',
        namaPerbaikan: row[11] || '',
        statusSelesai: row[12] || '',
        statusBelumSelesai: row[13] || '',
        durasiPerbaikan: row[14] || '',
        rcfaYes: row[15] || '',
        rcfaNo: row[16] || '',
        picRcfa: row[17] || ''
      }));
      return NextResponse.json({ success: true, data });
    }

// 2. Get Histori PM & Filtered PM
  if (action === 'getHistoriPMData' || action === 'getFilteredHistoriPMData') {
    const filterTanggal = searchParams.get('tanggal') || '';
    const filterLine = searchParams.get('line') || '';
    const filterJenis = searchParams.get('jenisPM') || '';

    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Histori_PM!A:K' });
    const rows = response.data.values || [];
    if (rows.length <= 1) return NextResponse.json({ success: true, data: [] });

    const groupedData = {};
    rows.slice(1).forEach((row, idx) => {
      const hari = row[0] ? String(row[0]) : '';
      const rawTgl = row[1] || '';
      const line = row[2] ? String(row[2]) : '';
      const jenisPM = row[3] ? String(row[3]) : '';
      const groupKey = `${rawTgl}_${line}_${jenisPM}`;

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          hari,
          tanggal: formatDate_(rawTgl),
          rawTanggal: String(rawTgl),
          line,
          jenisPM,
          estimasiMulai: formatTime_(row[4]) || '08:30',
          estimasiSelesai: formatTime_(row[5]),
          estimasiPreheating: formatTime_(row[6]),
          rows: []
        };
      }

      groupedData[groupKey].rows.push({
        rowIndex: idx + 2,
        mesin: row[7] ? String(row[7]) : '',
        pic: row[8] ? String(row[8]) : '',
        rawJamSelesai: row[9],
        jamSelesai: formatTime_(row[9]),
        keterangan: row[10] ? String(row[10]) : ''
      });
    });

    let result = [];
    for (const key in groupedData) {
      const group = groupedData[key];
      let semuaSelesai = true;
      let jamSelesaiList = [];

      group.rows.forEach(r => {
        if (!r.rawJamSelesai || String(r.rawJamSelesai).trim() === '') semuaSelesai = false;
        else jamSelesaiList.push(r.jamSelesai);
      });

      let jamProses = '';
      let durasiText = '****';
      if (!semuaSelesai) {
        jamProses = `${group.estimasiMulai}****`;
      } else {
        jamSelesaiList.sort();
        const jamTerakhir = jamSelesaiList[jamSelesaiList.length - 1];
        jamProses = `${group.estimasiMulai}\n${jamTerakhir}`;
        const durasiMenit = hitungSelisihMenit_(group.estimasiMulai, jamTerakhir);
        if (durasiMenit >= 0) {
          const jam = Math.floor(durasiMenit / 60);
          const menit = durasiMenit % 60;
          durasiText = ((jam > 0 ? jam + ' jam ' : '') + (menit > 0 ? menit + ' menit' : '')).trim();
          if (durasiMenit === 0) durasiText = '0 menit';
        }
      }

      group.rows.forEach(r => {
        result.push({
          rowIndex: r.rowIndex,
          hari: group.hari,
          tanggal: group.tanggal,
          rawTanggal: group.rawTanggal,
          line: group.line,
          jenisPM: group.jenisPM,
          estimasiMulai: group.estimasiMulai,
          estimasiSelesai: group.estimasiSelesai,
          estimasiPreheating: group.estimasiPreheating,
          mesin: r.mesin,
          pic: r.pic,
          jamSelesai: r.jamSelesai,
          keterangan: r.keterangan,
          jamProses,
          durasiText
        });
      });
    }

    // ===== PERBAIKAN FILTER TANGGAL DI SINI =====
    if (filterTanggal) {
      result = result.filter(r => {
        let tglSheet = String(r.rawTanggal || '').trim();
        
        // Jika format di spreadsheet YYYY-MM-DD
        if (tglSheet.includes('-')) {
          tglSheet = tglSheet.slice(0, 10);
        } 
        // Jika format di spreadsheet DD/MM/YYYY, ubah dulu ke YYYY-MM-DD agar cocok dengan input date
        else if (tglSheet.includes('/')) {
          const parts = tglSheet.split('/');
          if (parts.length === 3) {
            tglSheet = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
        
        return tglSheet === filterTanggal;
      });
    }

    if (filterLine) {
      result = result.filter(r => String(r.line).trim() === String(filterLine).trim());
    }
    
    if (filterJenis) {
      result = result.filter(r => {
        const jenis = String(r.jenisPM).trim();
        if (filterJenis === 'Additional') return jenis.startsWith('Additional');
        return jenis === filterJenis;
      });
    }

    return NextResponse.json({ success: true, data: result });
  }

    return NextResponse.json({ success: false, message: 'Action tidak ditemukan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ===== METHOD POST =====
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Submit Laporan WO
    if (action === 'submitLaporanAkhir') {
      const now = new Date();
      const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
      const prefix = 'WO-' + dateCode + '-';

      const getRows = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Laporan_Akhir_WO!B:B' });
      const woValues = getRows.data.values ? getRows.data.values.flat() : [];
      let sequence = 1;
      woValues.forEach(wo => {
        if (wo && String(wo).startsWith(prefix)) {
          const num = parseInt(String(wo).substring(prefix.length), 10);
          if (!isNaN(num) && num >= sequence) sequence = num + 1;
        }
      });
      const noWO = prefix + String(sequence).padStart(3, '0');

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Laporan_Akhir_WO!A:R',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            data.tanggal || now.toISOString().slice(0, 10),
            noWO,
            data.shiftReg || '',
            data.line || '',
            data.mesin || '',
            data.jenisPekerjaan || '',
            data.jenisKode || '',
            data.problem || '',
            data.penyebab || '',
            data.partBermasalah || '',
            data.action || '',
            data.namaPerbaikan || '',
            data.statusUtama === 'SELESAI' ? '✓' : '',
            data.statusUtama === 'BELUM SELESAI' ? '✓' : '',
            parseInt(data.durasiPerbaikan, 10) || 0,
            data.rcfaChoice === 'YES' ? '✓' : '',
            data.rcfaChoice === 'NO' ? '✓' : '',
            data.picRcfa || ''
          ]]
        }
      });
      return NextResponse.json({ success: true, noWO });
    }

    // 2. Update Laporan WO
    if (action === 'updateLaporanWO') {
      const row = data.rowIndex;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Laporan_Akhir_WO!A${row}:R${row}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            data.tanggal || '', data.noWO || '', data.shiftReg || '', data.line || '', data.mesin || '',
            data.jenisPekerjaan || '', data.jenisKode || '', data.problem || '', data.penyebab || '',
            data.partBermasalah || '', data.action || '', data.namaPerbaikan || '',
            data.statusUtama === 'SELESAI' ? '✓' : '', data.statusUtama === 'BELUM SELESAI' ? '✓' : '',
            parseInt(data.durasiPerbaikan, 10) || 0, data.rcfaChoice === 'YES' ? '✓' : '',
            data.rcfaChoice === 'NO' ? '✓' : '', data.picRcfa || ''
          ]]
        }
      });
      return NextResponse.json({ success: true });
    }

    // 3. Submit PM Massal
    if (action === 'submitPMMassal') {
      let jenisPMFormatted = data.jenisPM || '';
      if (data.ketAdditional && data.ketAdditional.trim() !== '') {
        jenisPMFormatted = 'Additional - ' + data.ketAdditional.trim();
      }

      const rowsToAppend = data.detailMesin.map(item => [
        data.hari || '', data.tanggal || '', data.line || '', jenisPMFormatted,
        data.estimasiMulai || '', data.estimasiSelesai || '', data.estimasiPreheating || '',
        item.mesin || '', item.pic || '', item.jamSelesai || '', item.keterangan || ''
      ]);

      if (rowsToAppend.length > 0) {
        await sheets.spreadsheets.values.append({
          spreadsheetId, range: 'Histori_PM!A:K', valueInputOption: 'USER_ENTERED',
          requestBody: { values: rowsToAppend }
        });
      }
      return NextResponse.json({ success: true, count: rowsToAppend.length });
    }

    // 4. Update Histori PM
    if (action === 'updateHistoriPM') {
      const row = data.rowIndex;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Histori_PM!A${row}:K${row}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            data.hari || '', data.tanggal || '', data.line || '', data.jenisPM || '',
            data.estimasiMulai || '', data.estimasiSelesai || '', data.estimasiPreheating || '',
            data.mesin || '', data.pic || '', data.jamSelesai || '', data.keterangan || ''
          ]]
        }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Action POST tidak ditemukan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}