import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';

export function uploadRT(file, id: string, fullname: string, filename: string) {
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

            const result = [];

            const todo = json.filter((el => (el['Transaction Status'] === 'SEND_COMPLETE' || el['Transaction Status'] === 'RECEIVE_COMPLETE')));

            todo.forEach((element: any) => {

                const els = {
                    type: 'RAPID TRANSFER',
                    ...element,
                    HTComm: 0,
                    TVA: 0,
                    timestamp: new Date(),
                    loadby: id,
                    loadbyName: fullname,
                    filename
                };

                els['Deposit Date'] = new Date(els['Deposit Date']);
                els['Debit Authorized Date'] = new Date(els['Debit Authorized Date']);
                els['Payment Date'] = new Date(els['Payment Date']);

                els['Send Amount'] = +(els['Send Amount']);
                els['Send Commission'] = +(els['Send Commission']);
                els['VAT'] = +(els['VAT']);

                els['Receiving Amount'] = +(els['Receiving Amount']);
                els['Receiving Commission'] = +(els['Receiving Commission']);

                els['Other Stakeholder Commission'] = +(els['Other Stakeholder Commission']);
                els['Total Fee'] = +(els['Total Fee']);

                els['type'] = 'RAPID TRANSFER';
                els['Date'] = els['Deposit Date'];

                if (els['Transaction Status'] === 'SEND_COMPLETE') {
                    els['HTComm'] = els['Send Commission'] * 0.60;
                    els['TVA'] = els['HTComm'] * 0.1925;
                    els['code'] = 'ERT';
                } else if (els['Transaction Status'] === 'RECEIVE_COMPLETE') {
                    els['HTComm'] = els['Receiving Commission'] * 0.40;
                    els['TVA'] = 0;
                    els['code'] = 'RRT';
                }

                console.log(els);

                result.push(els);
            });

            resolve(result);

        };

        fileReader.readAsArrayBuffer(file);
    });
}

export const loadRTFiles = (result: any[], workbook: Excel.Workbook, filename: string) => {

    const headers = Object.keys(result[0])
        .map((uniq) => {
            return { header: uniq, key: uniq, width: 14 };
        });

    const ert = result.filter((el) => el['Transaction Status'] === 'SEND_COMPLETE');

    if (ert.length > 0) {
        const worksheet1 = workbook.addWorksheet('ERT de ' + filename);
        worksheet1.columns = headers;
        // worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
        // worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet1.addRows(ert);
    }


    const rrt = result.filter((el) => el['Transaction Status'] === 'RECEIVE_COMPLETE');

    const worksheet2 = workbook.addWorksheet('RRT de ' + filename);
    worksheet2.columns = headers;
    // worksheet2.getColumn(3).numFmt = 'dd/mm/yyyy';
    // worksheet2.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet2.addRows(rrt);


    const autres = result.filter((el) => (el['Transaction Status'] !== 'RECEIVE_COMPLETE' && el['Transaction Status'] !== 'SEND_COMPLETE'));

    if (autres.length > 0) {
        const worksheet3 = workbook.addWorksheet('Autres de ' + filename);
        worksheet3.columns = headers;
        // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
        // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet3.addRows(autres);
    }


    return workbook;

};
