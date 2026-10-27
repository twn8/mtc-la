import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Konfigurasi Auth: Mendukung Environment Variable (untuk Vercel) atau File lokal (untuk Localhost)
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

// ===== METHOD GET: Mengambil Data =====
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Ambil Data Laporan WO
    if (action === 'getLaporanData') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Laporan_Akhir_WO!A:R',
      });
      const rows = response.data.values || [];
      if (rows.length <= 1) return NextResponse.json({ success: true, data: [] });

      const formattedData = rows.slice(1).map((row, idx) => ({
        rowIndex: idx + 2,
        tanggal: row[0] || '',
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
      return NextResponse.json({ success: true, data: formattedData });
    }

    // 2. Ambil Data Histori PM
    if (action === 'getHistoriPMData') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Histori_PM!A:K',
      });
      const rows = response.data.values || [];
      if (rows.length <= 1) return NextResponse.json({ success: true, data: [] });

      const formattedPM = rows.slice(1).map((row, idx) => ({
        rowIndex: idx + 2,
        hari: row[0] || '',
        tanggal: row[1] || '',
        line: row[2] || '',
        jenisPM: row[3] || '',
        estimasiMulai: row[4] || '',
        estimasiSelesai: row[5] || '',
        estimasiPreheating: row[6] || '',
        mesin: row[7] || '',
        pic: row[8] || '',
        jamSelesai: row[9] || '',
        keterangan: row[10] || ''
      }));
      return NextResponse.json({ success: true, data: formattedPM });
    }

    return NextResponse.json({ success: false, message: 'Action GET tidak ditemukan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ===== METHOD POST: Menyimpan & Memperbarui Data =====
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Submit Laporan WO Baru
    if (action === 'submitLaporanAkhir') {
      const now = new Date();
      const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
      const prefix = 'WO-' + dateCode + '-';

      const getRows = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Laporan_Akhir_WO!B:B',
      });
      const woValues = getRows.data.values ? getRows.data.values.flat() : [];
      let sequence = 1;
      woValues.forEach((wo) => {
        if (wo && wo.startsWith(prefix)) {
          const num = parseInt(wo.substring(prefix.length), 10);
          if (!isNaN(num) && num >= sequence) sequence = num + 1;
        }
      });
      const noWO = prefix + String(sequence).padStart(3, '0');

      const statusSelesai = data.statusUtama === 'SELESAI' ? '✓' : '';
      const statusBelumSelesai = data.statusUtama === 'BELUM SELESAI' ? '✓' : '';
      const rcfaYes = data.rcfaChoice === 'YES' ? '✓' : '';
      const rcfaNo = data.rcfaChoice === 'NO' ? '✓' : '';

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
            statusSelesai,
            statusBelumSelesai,
            parseInt(data.durasiPerbaikan, 10) || 0,
            rcfaYes,
            rcfaNo,
            data.picRcfa || ''
          ]]
        }
      });

      return NextResponse.json({ success: true, noWO });
    }

    // 2. Submit PM Massal
    if (action === 'submitPMMassal') {
      const rowsToAppend = [];
      let jenisPMFormatted = data.jenisPM || '';
      if (data.ketAdditional && data.ketAdditional.trim() !== '') {
        jenisPMFormatted = 'Additional - ' + data.ketAdditional.trim();
      }

      data.detailMesin.forEach((item) => {
        rowsToAppend.push([
          data.hari || '',
          data.tanggal || '',
          data.line || '',
          jenisPMFormatted,
          data.estimasiMulai || '',
          data.estimasiSelesai || '',
          data.estimasiPreheating || '',
          item.mesin || '',
          item.pic || '',
          item.jamSelesai || '',
          item.keterangan || ''
        ]);
      });

      if (rowsToAppend.length > 0) {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Histori_PM!A:K',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: rowsToAppend }
        });
      }

      return NextResponse.json({ success: true, count: rowsToAppend.length });
    }

    return NextResponse.json({ success: false, message: 'Action POST tidak ditemukan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}