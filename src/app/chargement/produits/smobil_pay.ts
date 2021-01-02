import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';

export let smobpay = [];

export function uploadSMOBPAY(file: any, id: string, fullname: string, filename: string) {

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = async (e) => {

      const arrayBuffer: any = fileReader.result;
      const data = new Uint8Array(arrayBuffer);
      const arr = new Array();

      for (let i = 0; i !== data.length; ++i) {
        arr[i] = String.fromCharCode(data[i]);
      }

      const bstr = arr.join('');
      const workbook = XLSX.read(bstr, { type: 'binary' });

      const sheetname = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetname];

      const labels = [
        'n', 'Service', 'PTN', 'Service Number', 'Bill Number (optional)',
        'Customer Number (optional)', 'Custom Client Txid', 'Customer Reference',
        'Company Bid', 'Branch', 'Agent', 'Amount', 'Status', 'Paid At', 'Date processed',
        'Service Charge (collected)', 'Total (collected)', 'Service Charge Company',
        'Service Charge Agent', 'Provision Company', 'Provision Agent', 'Amount debited',
        'Account Balance Before', 'Account Balance After'
      ];

      const json = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

      smobpay = json.map((el: any) => {
        const tr = {};
        // console.log(el);

        let j = 0;

        // tslint:disable-next-line: forin
        for (const prop in el) {
          tr[labels[j]] = el[prop];
          j = j + 1;
        }

        return tr;
      });

      const result = [];

      const todo = smobpay.filter(el => (el['Status'] === 'SUCCESS'));

      todo.forEach((element: any) => {

        const els = {
          type: 'SMOBILPAY',
          ...element,
          CommTTC: 0,
          HTComm: 0,
          TVA: 0,
          timestamp: new Date(),
          loadby: id,
          loadbyName: fullname,
          filename
        };

        els['Service Charge (collected)'] = +els['Service Charge (collected)'];
        els['Total (collected)'] = +els['Total (collected)'];

        els['Service Charge Company'] = +els['Service Charge Company'];
        els['Service Charge Agent'] = +els['Service Charge Agent'];
        els['Provision Company'] = +els['Provision Company'];
        els['Provision Agent'] = +(els['Provision Agent']);

        els['CommTTC'] = els['Service Charge Company'] + els['Service Charge Agent']
          + els['Provision Company'] + els['Provision Agent'];

        els['HTComm'] = els['CommTTC'] / 1.1925;
        els['TVA'] = els['HTComm'] * 0.1925;

        els['PTN'] = els['PTN'].replace('"', '').replace('"', '');
        els['Service Number'] = els['Service Number'].replace('"', '').replace('"', '');
        els['Customer Number (optional)'] = els['Customer Number (optional)'].replace('"', '').replace('"', '');

        els['Amount'] = +els['Amount'];
        els['Paid At'] = new Date(els['Paid At']);

        els['Date'] = els['Paid At'];

        els['Account Balance Before'] = +els['Account Balance Before'];
        els['Account Balance After'] = +els['Account Balance After'];

        if (els['Service'] === 'ENEO Bills/Postpaid') {
          els['code'] = 'ENEO';
        } else if (els['Service'] === 'Camwater BIlls/Factures') {
          els['code'] = 'CDE';
        } else if (els['Service'] === 'CanalPlus') {
          els['code'] = 'CANALPLUS';
        } else if (els['Service'] === 'MTN Recharge/Topup') {
          els['code'] = 'MTN';
        } else if (els['Service'] === 'ORANGE Recharge/Airtime') {
          els['code'] = 'ORANGE';
        } else if (els['Service'] === 'NEXTTEL Recharge/Topup') {
          els['code'] = 'NEXTTEL';
        } else if (els['Service'] === 'CAMTEL Recharge/Topup') {
          els['code'] = 'CAMTEL';
        }

        console.log(els);

        result.push(els);

      });

      resolve(result);

      // console.log(rst);

      //   loadSMOBPAYFiles(rst);

    };

    fileReader.readAsArrayBuffer(file);
  });

};

export function loadSMOBPAYFiles(result: any[], workbook: Excel.Workbook, filename: string) {

  const headers = Object.keys(result[0])
    .map((uniq) => {
      return { header: uniq, key: uniq, width: 14 };
    });

  const ora = result.filter((el) => el['Service'] === 'ORANGE Recharge/Airtime');

  if (ora.length > 0) {
    const worksheet1 = workbook.addWorksheet('ORANGE Recharge Airtime ' + filename);
    worksheet1.columns = headers;
    // worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet1.addRows(ora);
  }

  const nrt = result.filter((el) => el['Service'] === 'NEXTTEL Recharge/Topup');

  if (nrt.length > 0) {
    const worksheet2 = workbook.addWorksheet('NEXTTEL Recharge Topup ' + filename);
    worksheet2.columns = headers;
    // worksheet2.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet2.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet2.addRows(nrt);
  }


  const mmco = result.filter((el) => (el['Service'] === 'MTN MoMo Cash Out / RETRAIT'));

  if (mmco.length > 0) {
    const worksheet3 = workbook.addWorksheet('MTN MoMo Cash Out RETRAIT ' + filename);
    worksheet3.columns = headers;
    // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet3.addRows(mmco);
  }

  const mrt = result.filter((el) => (el['Service'] === 'MTN Recharge/Topup'));

  if (mrt.length > 0) {
    const worksheet4 = workbook.addWorksheet('MTN Recharge Topup ' + filename);
    worksheet4.columns = headers;
    // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet4.addRows(mrt);
  }

  const ebp = result.filter((el) => (el['Service'] === 'ENEO Bills/Postpaid'));

  if (ebp.length > 0) {
    const worksheet5 = workbook.addWorksheet('ENEO Bills Postpaid ' + filename);
    worksheet5.columns = headers;
    // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet5.addRows(ebp);
  }


  const cp = result.filter((el) => (el['Service'] === 'CanalPlus'));

  if (cp.length > 0) {
    const worksheet6 = workbook.addWorksheet('CanalPlus ' + filename);
    worksheet6.columns = headers;
    // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet6.addRows(cp);
  }

  const cw = result.filter((el) => (el['Service'] === 'Camwater BIlls/Factures'));

  if (cw.length > 0) {
    const worksheet7 = workbook.addWorksheet('Camwater BIlls Factures ' + filename);
    worksheet7.columns = headers;
    // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet7.addRows(cw);
  }

  const autres = result.filter((el) => (el['Service'] !== 'CanalPlus' && el['Service'] !== 'ENEO Bills/Postpaid'
    && el['Service'] !== 'MTN Recharge/Topup' && el['Service'] !== 'MTN MoMo Cash Out / RETRAIT'
    && el['Service'] !== 'NEXTTEL Recharge/Topup' && el['Service'] !== 'ORANGE Recharge/Airtime'
    && el['Service'] !== 'Camwater BIlls/Factures'));


  if (autres.length > 0) {
    const worksheet8 = workbook.addWorksheet('Autres ' + filename);
    worksheet8.columns = headers;
    // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet8.addRows(autres);
  }

  if (result.length > 0) {
    const worksheet9 = workbook.addWorksheet('Total Commission ' + filename);
    worksheet9.columns = headers;
    // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet9.addRows(result);
  }

  return workbook;

}