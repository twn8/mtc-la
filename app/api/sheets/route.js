import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const spreadsheetId = process.env.SPREADSHEET_ID;

// Helper untuk membaca data (GET)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const sheets = google.sheets({ version: 'v4', auth });

    if (action === 'getLaporanData') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Laporan_Akhir_WO!A:R',
      });
      const rows = response.data.values || [];
      
      if (rows.length <= 1) return NextResponse.json({ success: true, data: [] });

      // Format data agar mudah dibaca oleh frontend
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

    return NextResponse.json({ success: false, message: 'Action GET tidak ditemukan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Helper untuk menulis/submit data (POST)
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const sheets = google.sheets({ version: 'v4', auth });

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

      let tanggalInput = now.toISOString().slice(0, 10);
      if (data.tanggal) tanggalInput = data.tanggal;

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Laporan_Akhir_WO!A:R',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            tanggalInput,
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

    return NextResponse.json({ success: false, message: 'Action POST tidak ditemukan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}