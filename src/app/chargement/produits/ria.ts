import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';

import { Papa } from 'ngx-papaparse';

export function uploadRIA(file: any, papa: Papa, id: string, fullname: string, filename: string) {

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

            let labels = ['SC Order Number', 'PIN', 'Delivery Method', 'Teller', 'Branch', 'Branch Code',
                'Reconciliation Branch', 'Reconciliation Branch Code',
                'Sent Amount', 'Sending Currency', 'Country From', 'Country to', 'Payment Amount', 'Beneficiary Currency',
                'Commission Amount', 'Commission Currency', 'SA Commission Amount', 'SA Commission Currency', 'Date', 'Rate',
                'CTE', 'TVA1', 'Customer Fee', 'Action'];

            let riajson = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

            console.log(riajson);

            if ((riajson[1]['Action'] === undefined || riajson[1]['Action'] === '') && (riajson[1]['Pay Date'] === undefined)) {
                riajson = riajson.map((el) => {
                    const tr = {};
                    // console.log(el);
                    // (el['SC Order Number'] as string).split(',').forEach((e, i) => {
                    //   tr[labels[i]] = e;
                    // });

                    let decorti = [];

                    if (el['SC Order Number']) {
                        decorti = papa.parse(el['SC Order Number']).data[0];
                        labels.forEach((lb, i) => {
                            tr[lb] = decorti[i];
                        });
                    } else if (el['SC Order Number,PIN,Delivery Method,Teller,Branch,Branch Code,Reconciliation Branch,Reconciliation Branch Code,Sent Amount,Sending Currency,Country From,Country to,Payment Amount,Beneficiary Currency,Commission Amount,Commission Currency,SA Commission Amount,SA Commission Currency,Date,Rate,CTE,TVA1,Customer Fee,Action']) {
                        decorti = papa.parse(el['SC Order Number,PIN,Delivery Method,Teller,Branch,Branch Code,Reconciliation Branch,Reconciliation Branch Code,Sent Amount,Sending Currency,Country From,Country to,Payment Amount,Beneficiary Currency,Commission Amount,Commission Currency,SA Commission Amount,SA Commission Currency,Date,Rate,CTE,TVA1,Customer Fee,Action']).data[0];
                        labels.forEach((lb, i) => {
                            tr[lb] = decorti[i];
                        });
                    } else if (el['SC Order Number,PIN,Delivery Method,Payer Teller Name,Payer Branch,Payer Branch Code,Country From,Country to,Payment Amount,Beneficiary Currency,Commission Amount,Commission Currency,SA Commission Amount,SA Commission Currency,Pay Date']) {
                        console.log('--->');
                        decorti = papa.parse(el['SC Order Number,PIN,Delivery Method,Payer Teller Name,Payer Branch,Payer Branch Code,Country From,Country to,Payment Amount,Beneficiary Currency,Commission Amount,Commission Currency,SA Commission Amount,SA Commission Currency,Pay Date']).data[0];
                        ['SC Order Number', 'PIN', 'Delivery Method', 'Payer Teller Name', 'Payer Branch', 'Payer Branch Code', 'Country From', 'Country to', 'Payment Amount', 'Beneficiary Currency', 'Commission Amount', 'Commission Currency', 'SA Commission Amount', 'SA Commission Currency', 'Pay Date'].forEach((lb, i) => {
                            tr[lb] = decorti[i];
                        });
                    }
                    console.log('element: ', decorti);



                    return tr;
                });
            }

            console.log(riajson);

            const riaresult = [];

            let todo = riajson.filter((el => (['Sent', 'Paid', 'Cancelled'].indexOf(el['Action']) > -1)));

            if (todo.length === 0) {
                todo = riajson;
            }

            todo.forEach((element: any) => {

                const els = {
                    type: 'RIA',
                    ...element,
                    HTComm: 0,
                    TVA: 0,
                    timestamp: new Date(),
                    loadby: id,
                    loadbyName: fullname,
                    filename
                };

                // console.log(els);

                els['type'] = 'RIA';

                els['Commission Amount'] = (els['Action']) ?
                    +(els['Commission Amount'].replace(/,/g, '')) / 10000 :
                    +(els['Commission Amount'].replace(/,/g, ''));

                if (els['Sent Amount']) {
                    els['Sent Amount'] = (els['Action']) ?
                        Math.abs(+(els['Sent Amount'].replace(/,/g, '')) / 10000) :
                        +(els['Sent Amount'].replace(/,/g, ''));
                }

                // console.log(els['Date']);

                let dte: Date;

                console.log(element);

                if (els['Action']) {
                    const val = els['Date'].split(' ');
                    console.log(els['Date'] + ' ~~~~~~> ' + val);
                    const dt = val[0].split('/');
                    
                    if (val[1]) {
                        const hr = val[1].split(':');
                        dt[2] = dt[2].length === 2 ? ('20' + dt[2]) : dt[2];
                        dte = new Date(+dt[2], +dt[0] - 1, +dt[1], +hr[0], +hr[1]);
                    } else {
                        // const y = (+dt[1]) + 1;
                        dt[2] = dt[2].length === 2 ? ('20' + dt[2]) : dt[2];
                        dte = new Date(+dt[2], +dt[0] - 1, +dt[1], 5, 0);
                    }

                    els['Date'] = dte;
                } else {
                    const val = els['Pay Date'].split(' ');
                    console.log(els['Pay Date'] + ' ~~~~~~> ' + val);
                    const dt = val[0].split('/');

                    dt[2] = dt[2].length === 2 ? ('20' + dt[2]) : dt[2];
                    if (val[1]) {
                        const hr = val[1].split(':');
                        dte = new Date(+dt[2], +dt[0] - 1, +dt[1], +hr[0], +hr[1]);
                    } else {
                        dt[2] = dt[2].length === 2 ? ('20' + dt[2]) : dt[2];
                        dte = new Date(+dt[2], +dt[0] - 1, +dt[1], 5, 0);
                    }

                    els['Pay Date'] = dte;
                }

                els['Date'] = dte;

                els['Payment Amount'] = (els['Action']) ?
                    +(els['Payment Amount'].replace(/,/g, '')) / 10000 :
                    +(els['Payment Amount'].replace(/,/g, ''));

                if (els['Rate']) {
                    els['Rate'] = +(els['Rate'].replace(/,/g, '')) / 10000;
                }

                if (els['CTE']) {
                    els['CTE'] = +(els['CTE'].replace(/,/g, '')) / 10000;
                }

                if (els['TVA1']) {
                    els['TVA1'] = +(els['TVA1'].replace(/,/g, '')) / 10000;
                }

                if (els['Customer Fee']) {
                    els['Customer Fee'] = +(els['Customer Fee'].replace(/,/g, '')) / 10000;
                }

                const relcomm = els['Commission Amount'] * 0.7;

                if (els['Action']) {
                    if (els['Action'] === 'Sent') {
                        els['HTComm'] = relcomm;
                        els['TVA'] = els['HTComm'] * 0.1925;
                        els['code'] = 'ERIA';
                    } else if (els['Action'] === 'Paid') {
                        els['HTComm'] = relcomm;
                        els['TVA'] = 0;
                        els['code'] = 'RRIA';
                    } else if (els['Action'] === 'Cancelled') {
                        els['Sent Amount'] = -1 * els['Sent Amount'];
                        els['Customer Fee'] = -1 * els['Customer Fee'];
                        els['HTComm'] = -1 * relcomm;
                        els['TVA'] = els['HTComm'] * 0.1925;
                        els['code'] = 'ARIA';
                    }
                } else {
                    if (els['Sent Amount'] !== undefined && els['Sent Amount'] >= 0) {
                        els['HTComm'] = relcomm;
                        els['TVA'] = els['HTComm'] * 0.1925;
                        els['code'] = 'ERIA';
                        els['Action'] = 'Sent';
                    } else if (els['Payment Amount'] !== undefined) {
                        els['HTComm'] = relcomm;
                        els['TVA'] = 0;
                        els['code'] = 'RRIA';
                        els['Action'] = 'Paid';
                    } else if (els['Sent Amount'] < 0) {
                        els['Sent Amount'] = -1 * els['Sent Amount'];
                        els['Customer Fee'] = -1 * els['Customer Fee'];
                        els['HTComm'] = -1 * relcomm;
                        els['TVA'] = els['HTComm'] * 0.1925;
                        els['Action'] = 'Cancelled';
                        els['code'] = 'ARIA';
                    }
                }

                riaresult.push(els);
            });

            console.log(riaresult);

            resolve(riaresult);

            //   loadRIAFiles(json);

        };

        fileReader.readAsArrayBuffer(file);
    });

}

export function loadRIAFiles(result: any[], workbook: Excel.Workbook, filename: string) {

    const headers = Object.keys(result[0])
        .map((uniq) => {
            return { header: uniq, key: uniq, width: 14 };
        });

    const eria = result.filter((el) => el['Action'] === 'Sent');

    if (eria.length > 0) {
        const worksheet1 = workbook.addWorksheet('ERIA de ' + filename);
        worksheet1.columns = headers;
        // worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
        // worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet1.addRows(eria);
    }

    const rria = result.filter((el) => el['Action'] === 'Paid');

    if (rria.length > 0) {
        const worksheet2 = workbook.addWorksheet('RRIA de ' + filename);
        worksheet2.columns = headers;
        // worksheet2.getColumn(3).numFmt = 'dd/mm/yyyy';
        // worksheet2.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet2.addRows(rria);
    }

    const autres = result.filter((el) => (el['Action'] !== 'Sent' && el['Action'] !== 'Paid'));

    if (autres.length > 0) {
        const worksheet3 = workbook.addWorksheet('Autres');
        worksheet3.columns = headers;
        // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
        // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet3.addRows(autres);
    }

    return workbook;

};
