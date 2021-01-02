import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';


export const uploadFT = (file, id: string, fullname: string, filename: string) => {

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

      const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      const todo = json.filter((el => ((el['TYPE'] === 'SENT') || el['TYPE'] === 'RECEIVED')));

      const result = [];

      todo.forEach((element: any) => {

        const els = {
          type: 'FLASH TRANSFER',
          ...element,
          HTComm: 0,
          TVA: 0,
          timestamp: new Date(),
          loadby: id,
          loadbyName: fullname,
          filename
        };

        const dt = els['DATE'].split('-');
        const dte = new Date(dt[2], dt[1] - 1, dt[0]);
        dte.setHours(11, 0, 0, 0);
        els['DATE'] = dte;

        els['Date'] = dte;

        els['FRAIS '] = +els['FRAIS '];
        els['MONTANT'] = +els['MONTANT'];

        if (els['TYPE'] === 'SENT') {
          els['HTComm'] = ((els['FRAIS ']) / 1.1925) * 0.35;
          els['code'] = 'EFT';
        } else if (els['TYPE'] === 'RECEIVED') {
          els['HTComm'] = ((els['FRAIS ']) / 1.1925);
          els['code'] = 'RFT';
        }

        els['TVA'] = (els['FRAIS '] - (els['FRAIS '] / 1.1925));

        console.log(els);

        result.push(els);

      });

      resolve(result);

      //   loadFTFiles(json, id, fullname);

    };

    fileReader.readAsArrayBuffer(file);

  });
};

export const loadFTFiles = (result: any[], workbook: Excel.Workbook, filename: string) => {

  // console.log('-------------------------');



  const headers = Object.keys(result[0])
    .map((uniq) => {
      return { header: uniq, key: uniq, width: 14 };
    });

  const eft = result.filter((el) => el['TYPE'] === 'SENT');

  if (eft.length > 0) {
    const worksheet1 = workbook.addWorksheet('EFT de ' + filename);
    worksheet1.columns = headers;
    worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
    worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet1.addRows(eft);
  }

  const rft = result.filter((el) => el['TYPE'] === 'RECEIVED');

  if (rft.length > 0) {
    const worksheet2 = workbook.addWorksheet('RFT de ' + filename);
    worksheet2.columns = headers;
    // worksheet2.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet2.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';

    worksheet2.addRows(rft);
  }

  const c2c = result.filter((el) => (el['TYPE'] !== 'SENT' && el['TYPE'] !== 'RECEIVED'));

  if (c2c.length > 0) {
    const worksheet3 = workbook.addWorksheet('Autres de ' + filename);
    worksheet3.columns = headers;
    // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet3.addRows(c2c);
  }

  return workbook;

};
