import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';

export function uploadMOMO(file: any, id: string, fullname: string, momofees: any, filename: string) {

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

            const momojson = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            const result = [];

            const todo = momojson.filter((el => (el['Statut'] === 'RÃ©ussi')));

            todo.forEach((element: any) => {

                const els = {
                    ...element,
                    CommTTC: 0,
                    HTComm: 0,
                    TVA: 0,
                    timestamp: new Date(),
                    loadby: id,
                    loadbyName: fullname,
                    filename
                };

                els['TYPE'] = els['Type'];
                els['type'] = 'MTN MOBILE MONEY';

                els['Montant'] = Math.abs(+(els['Montant']));
                els['Frais'] = Math.abs(+(els['Frais']));

                els['Solde'] = Math.abs(+(els['Solde']));

                // els['De'] = els['De'].split(':')[1].split('/')[0].substring(3);
                // els['Ã '] = els['Ã '].split(':')[1].split('/')[0].substring(3);

                console.log(els);

                if (els['TYPE'] === 'Encaisser') {
                    els['CommTTC'] = Math.round(els['Montant'] * getComm(els['Montant'], momofees)['cashin']);
                    els['HTComm'] = els['CommTTC'] / 1.1925;
                    els['TVA'] = els['HTComm'] * 0.1925;
                    els['code'] = 'DMM';
                } else if (els['TYPE'] === 'DÃ©caissÃ©' ||  els['TYPE'] === 'Transfert Ã  partir de code de retrait') {
                    els['CommTTC'] = Math.round(els['Montant'] * getComm(els['Montant'], momofees)['cashout']);
                    els['HTComm'] = els['CommTTC'] / 1.1925;
                    els['TVA'] = els['HTComm'] * 0.1925;
                    els['code'] = 'RMM';
                }

                const dte = new Date(els['Date']);
                dte.setHours(8, 0, 0, 0);

                els['Date'] = dte;

                result.push(els);
            });

            resolve(result);

            //   loadMOMOFiles(momoj);

            // console.log(json);

        };

        fileReader.readAsArrayBuffer(file);
    });
}

export function loadMOMOFiles(result: any[], workbook: Excel.Workbook, filename: string) {

    const headers = Object.keys(result[0])
        .map((uniq) => {
            return { header: uniq, key: uniq, width: 14 };
        });

    const total = result.filter(el => (el['TYPE'] === 'Encaisser' || el['TYPE'] === 'DÃ©caissÃ©' || el['TYPE'] === 'Transfert Ã  partir de code de retrait'));

    if (total.length > 0) {
        const worksheet0 = workbook.addWorksheet('Total Commissions ' + filename);
        worksheet0.columns = headers;
        // worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
        // worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet0.addRows(total);
    }

    const transfert = result.filter((el) => el['TYPE'] === 'Transfert'
        || el['TYPE'] === 'Transfert monnaie virtuelle'
        || el['TYPE'] === 'Transfert par Lots');

    if (transfert.length > 0) {
        const worksheet1 = workbook.addWorksheet('Transfert ' + filename);
        worksheet1.columns = headers;
        // worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
        // worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet1.addRows(transfert);
    }

    const encais = result.filter((el) => el['TYPE'] === 'Encaisser');

    if (encais.length > 0) {
        const worksheet2 = workbook.addWorksheet('Encaisser de ' + filename);
        worksheet2.columns = headers;
        // worksheet2.getColumn(3).numFmt = 'dd/mm/yyyy';
        // worksheet2.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet2.addRows(encais);
    }


    const decaiss = result.filter((el) => (el['TYPE'] === 'DÃ©caissÃ©'));

    if (decaiss.length > 0) {
        const worksheet3 = workbook.addWorksheet('Décaisser ' + filename);
        worksheet3.columns = headers;
        // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
        // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet3.addRows(decaiss);
    }


    const autres = result.filter((el) => (el['TYPE'] !== 'DÃ©caissÃ©'
        && el['TYPE'] !== 'Encaisser'
        && el['TYPE'] !== 'Transfert'
        && el['TYPE'] !== 'Transfert monnaie virtuelle'
        && el['TYPE'] !== 'Transfert par Lots'
        && el['TYPE'] !== 'Transfert Ã  partir de code de retrait'));

    if (autres.length > 0) {
        const worksheet4 = workbook.addWorksheet('Autres de ' + filename);
        worksheet4.columns = headers;
        // worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
        // worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet4.addRows(autres);
    }

    return workbook;

}

function getComm(amount: number, jsonelement: { [key: number]: number }) {
    const keys = Object.keys(jsonelement).map(key => +key);

    for (const key of keys) {
        // console.log(amount + ' and ' + key);
        if (+amount <= +key) {
            return jsonelement[+key];
        }
    }

    throw new Error('Pas de commissions');
}