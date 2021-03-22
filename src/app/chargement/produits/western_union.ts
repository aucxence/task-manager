import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';

export function uploadWU(file: any, id: string, fullname: string, filename: string) {

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (e) => {

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

      XLSX.utils.sheet_add_aoa(worksheet, [
        ['wuId', 'Date', 'useless1', 'MTCN', 'useless2', 'other1', 'OperID', 'other2',
          'TermID', 'useless5', 'Etat', 'chargesUSD', 'principal', 'agentShare', 'agentShare',
          'charges', 'commission', 'commissionUSD', 'Taxes', 'profitEUR', 'profitUSD', 'Total']
      ], { origin: 0 });

      let json = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      console.log(json);

      json = json.filter((e) => (e['MTCN'] && e['MTCN'].length === 10 && e['Etat']));

      console.log(json);

      let form = false;

      if (json.length === 0) {
        XLSX.utils.sheet_add_aoa(worksheet, [
          ['wuId', 'Date', 'useless1', 'MTCN', 'useless2', 'OperID', 'OperID', 'TermID',
            'TermID', 'Etat', 'Etat', 'principal', 'principal', 'agentShare', 'charges',
            'charges', 'commission', 'Taxes', 'Taxes', 'profitEUR', 'Total', 'Total']
        ], { origin: 0 });

        json = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        console.log(json);

        json = json.filter((e) => (e['MTCN'] && e['MTCN'].length === 10 && e['Etat']));

        console.log(json);

        form = true;
      }

      const result = json.map((el) => {

        // console.log(el['ChargesEUR']);
        el['charges'] = (+(el['charges'].replace(/\s/g, '').replace(/,/g, '')));
        // console.log('becomes ', el['ChargesEUR']);

        // console.log(el['PrincipalEUR']);
        el['principal'] = (+(el['principal'].replace(/\s/g, '').replace(/,/g, '')));
        // console.log('becomes ', el['PrincipalEUR']);

        // el['TaxesEUR'] = (+(el['TaxesEUR'].replace(/\s/g, '').replace(/,/g, '')));
        // el['TotalEUR'] = (+(el['TotalEUR'].replace(/\s/g, '').replace(/,/g, '')));



        // el['Charges'] = el['ChargesEUR'] * 655.95707416907;
        // el['principal'] = el['PrincipalEUR'] * 655.95707416907;
        // el['Taxes'] = el['TaxesEUR'] * 655.95707416907;
        // el['Total'] = el['TotalEUR'] * 655.95707416907;

        el['HTComm'] = el['charges'] * 0.6 / 1.1925;
        el['TVA'] = el['HTComm'] * 0.1925;

        el['type'] = 'WESTERN UNION';

        el['timestamp'] = new Date();
        el['loadby'] = id;
        el['loadbyName'] = fullname;

        if (el['Etat'] === 'S') {
          el['code'] = 'RWU';
        } else if (el['Etat'] === 'P-S' || el['Etat'] === 'UP-S') {
          el['code'] = 'EWU';
        }

        const dt = el['Date'].split('/');
        console.log(dt);
        const dte = (form === false) ?
          (dt[2].length === 4) ?
            new Date(dt[2], dt[1] - 1, dt[0]) :
            new Date(+('20' + dt[2].toString()), dt[0] - 1, dt[1]) :
          new Date(+('20' + dt[2].toString()), dt[0] - 1, dt[1]);
        dte.setHours(11, 0, 0, 0);

        el['Date'] = dte;

        el['filename'] = filename;

        return el;
      });

      console.log(json);

      resolve(result);
    };

    fileReader.readAsArrayBuffer(file);
  });

}

export function loadWUFiles(wu: any[], workbook: Excel.Workbook, filename: string) {

  const rwu = wu.filter(e => (e['code'] === 'RWU'));

  if (rwu.length > 0) {
    const worksheet = workbook.addWorksheet('RWU de ' + filename);
    const headers = Object.keys(rwu[0])
      .map((uniq) => {
        return { header: uniq, key: uniq, width: 14 };
      });
    worksheet.columns = headers;
    // worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet.addRows(rwu);
  }

  const ewu = wu.filter(e => (e['code'] === 'EWU'));

  if (ewu.length > 0) {
    const worksheet = workbook.addWorksheet('EWU de ' + filename);
    const headers = Object.keys(ewu[0])
      .map((uniq) => {
        return { header: uniq, key: uniq, width: 14 };
      });
    worksheet.columns = headers;
    // worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet.addRows(ewu);
  }

  return workbook;

}

export function uploadEWU(file: any, id: string, fullname: string, filename: string) {

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (e) => {

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

      XLSX.utils.sheet_add_aoa(worksheet, [
        ['wuId', 'Date', 'useless1', 'MTCN', 'useless2', 'eur', 'usd', 'principalEUR',
          'principalUSD', 'useless5', 'chargesEUR', 'chargesUSD', 'Principal', 'agentShareEUR', 'agentShareUSD',
          'Charges', 'commissionEUR', 'commissionUSD', 'Taxes', 'profitEUR', 'profitUSD', 'Total']
      ], { origin: 0 });

      const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      console.log(json);

      const todo2: any[] = json
        .filter((element) => element['wuId'] === undefined && element['Date'] !== undefined && (element['Date'].length === 10 || element['Date'] === 'N/A'));
      const todo1: any[] = json.filter((element) => element['MTCN'] !== undefined
        && element['MTCN'].length === 10);

      console.log(todo1);
      console.log(todo2);

      const result = todo1.map((el, index) => {
        for (const prop in todo2[index]) {
          if (prop === 'Date') {
          } else {
            el[prop] = todo2[index][prop];
          }
        }

        el['agentShareEUR'] = +(el['agentShareEUR'].replace(/\s/g, '').replace(/,/g, ''));
        el['agentShareUSD'] = +(el['agentShareUSD'].replace(/\s/g, '').replace(/,/g, ''));

        el['chargesEUR'] = +(el['chargesEUR'].replace(/\s/g, '').replace(/,/g, ''));
        el['chargesUSD'] = +(el['chargesUSD'].replace(/\s/g, '').replace(/,/g, ''));

        el['commissionEUR'] = +(el['commissionEUR'].replace(/\s/g, '').replace(/,/g, ''));
        el['commissionUSD'] = +(el['commissionUSD'].replace(/\s/g, '').replace(/,/g, ''));

        el['principalEUR'] = +(el['principalEUR'].replace(/\s/g, '').replace(/,/g, ''));
        el['principalUSD'] = +(el['principalUSD'].replace(/\s/g, '').replace(/,/g, ''));

        el['profitEUR'] = +(el['profitEUR'].replace(/\s/g, '').replace(/,/g, ''));
        el['profitUSD'] = +(el['profitUSD'].replace(/\s/g, '').replace(/,/g, ''));

        el['agentShare'] = el['agentShareEUR'] * 655.95707416907;
        el['charges'] = el['chargesEUR'] * 655.95707416907;
        el['commission'] = el['commissionEUR'] * 655.95707416907;
        el['principal'] = +el['principalEUR'] * 655.95707416907;
        el['profit'] = +el['profitEUR'] * 655.95707416907;

        el['HTComm'] = el['profit'] * 0.6 / 1.1925;
        el['TVA'] = el['HTComm'] * 0.1925;

        el['type'] = 'ENVOIS WESTERN UNION';
        el['TYPE'] = 'SENT';

        el['timestamp'] = new Date();
        el['loadby'] = id;
        el['loadbyName'] = fullname;
        if (el['principal'] >= 0) {
          el['code'] = 'EWU';
        } else {
          el['code'] = 'AWU';
          el['type'] = 'ENVOIS WESTERN UNION';
          el['TYPE'] = 'CANCELLED';
        }

        el['filename'] = filename;

        const dt = el['Date'].split('/');
        let year = dt[2];
        let dte = new Date(year, dt[1] - 1, dt[0]);
        if (dt[2].length === 2) {
          year = '20' + dt[2];
          dte = new Date(year, dt[0] - 1, dt[1]);
        }
        
        dte.setHours(11, 0, 0, 0);

        el['Date'] = dte;

        return el;
      });

      // console.log(todo1.length);

      // console.log(todo1);

      // console.log(result);

      const ewu = result.filter((el) => el['TYPE'] === 'SENT' || el['TYPE'] === 'CANCELLED');

      resolve(ewu);

      //   loadRWUFiles(json);

      // console.log(json);
    };

    fileReader.readAsArrayBuffer(file);
  });

}

export function loadEWUFiles(aewu: any[], workbook: Excel.Workbook, filename: string) {

  const ewu = aewu.filter((el) => el['TYPE'] === 'SENT');

  if (ewu.length > 0) {
    const worksheet = workbook.addWorksheet('EWU de ' + filename);
    const headers = Object.keys(ewu[0])
      .map((uniq) => {
        return { header: uniq, key: uniq, width: 14 };
      });
    worksheet.columns = headers;
    worksheet.addRows(ewu);
  }

  const awu = aewu.filter((el) => el['TYPE'] === 'CANCELLED');

  if (awu.length > 0) {
    const worksheet = workbook.addWorksheet('AWU de ' + filename);
    const headers = Object.keys(awu[0])
      .map((uniq) => {
        return { header: uniq, key: uniq, width: 14 };
      });
    worksheet.columns = headers;
    worksheet.addRows(awu);
  }

  return workbook;

}

export function uploadRWU(file: any, id: string, fullname: string, filename: string) {

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (e) => {

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

      XLSX.utils.sheet_add_aoa(worksheet, [
        ['wuId', 'Date', 'useless1', 'MTCN', 'useless2', 'eur', 'usd', 'principalEUR',
          'principalUSD', 'agentShareEUR', 'agentShareUSD',
          'commissionEUR', 'commissionUSD', 'useless3', 'profitEUR', 'profitUSD']
      ], { origin: 0 });

      const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      const todo1: any[] = json.filter((element) => element['wuId'] !== undefined
        && element['MTCN'] !== undefined
        && element['MTCN'].length === 10);

      const todo2: any[] = json.filter((element) => element['wuId'] === undefined
        && element['Date'] !== undefined
        && (element['Date'].length === 10
          || element['Date'] === 'N/A'));

      // console.log(todo1);
      // console.log(todo2);

      const result = todo1.map((el, index) => {
        for (const prop in todo2[index]) {
          if (prop === 'Date' && todo2[index][prop] === 'N/A') {
          } else {
            el[prop] = todo2[index][prop];
          }
        }

        el['agentShareEUR'] = +(el['agentShareEUR'].replace(/\s/g, '').replace(/,/g, ''));
        el['agentShareUSD'] = +(el['agentShareUSD'].replace(/\s/g, '').replace(/,/g, ''));

        el['commissionEUR'] = +(el['commissionEUR'].replace(/\s/g, '').replace(/,/g, ''));
        el['commissionUSD'] = +(el['commissionUSD'].replace(/\s/g, '').replace(/,/g, ''));

        el['principalEUR'] = +(el['principalEUR'].replace(/\s/g, '').replace(/,/g, ''));
        el['principalUSD'] = +(el['principalUSD'].replace(/\s/g, '').replace(/,/g, ''));

        el['profitEUR'] = +(el['profitEUR'].replace(/\s/g, '').replace(/,/g, ''));
        el['profitUSD'] = +(el['profitUSD'].replace(/\s/g, '').replace(/,/g, ''));

        el['agentShare'] = el['agentShareEUR'] * 655.95707416907;
        el['commission'] = el['commissionEUR'] * 655.95707416907;
        el['principal'] = +el['principalEUR'] * 655.95707416907;
        el['profit'] = +el['profitEUR'] * 655.95707416907;

        el['HTComm'] = el['profit'] * 0.6;
        el['TVA'] = 0;

        el['type'] = 'RETRAITS WESTERN UNION';
        el['TYPE'] = 'RECEIVED';

        el['timestamp'] = new Date();
        const dt = el['Date'].split('/');
        const dte = new Date(dt[2], dt[1] - 1, dt[0]);
        dte.setHours(11, 0, 0, 0);

        el['Date'] = dte;

        el['loadby'] = id;
        el['loadbyName'] = fullname;
        el['code'] = 'RWU';

        el['filename'] = filename;

        return el;
      });

      // console.log(todo1.length);

      // console.log(todo1);

      // console.log(result);

      const rwu = result.filter((el) => el['TYPE'] === 'RECEIVED');

      resolve(rwu);

      //   loadRWUFiles(json);

      // console.log(json);
    };

    fileReader.readAsArrayBuffer(file);
  });

}

export function loadRWUFiles(rwu: any[], workbook: Excel.Workbook, filename: string) {

  if (rwu.length > 0) {
    const worksheet = workbook.addWorksheet('RWU de ' + filename);
    const headers = Object.keys(rwu[0])
      .map((uniq) => {
        return { header: uniq, key: uniq, width: 14 };
      });
    worksheet.columns = headers;
    // worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet.addRows(rwu);
  }

  return workbook;

}
