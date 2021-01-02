import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';

export const uploadOM = (file, id, fullname, puces, filename) => {

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

            XLSX.utils.sheet_add_aoa(worksheet, [
                ['N', 'Date', 'Heure', 'Reference', 'Service', 'Agence', 'Statut', 'Mode', 'Compte1', 'Wallet1', 'N° Pseudo',
                    'Compte2', 'Wallet2', 'Debit', 'Credit', 'Sous-distributeur', 'Super-distributeur']
            ], { origin: 0 });

            const omjson = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            const result = [];

            const todo = omjson.filter((el => el['Statut'] === 'Succès'));

            todo.forEach((element: any) => {

                const els = {
                    type: 'ORANGE MONEY',
                    ...element,
                    HTComm: 0,
                    TVA: 0,
                    timestamp: new Date(),
                    loadby: id,
                    loadbyName: fullname,
                    filename
                };

                const dt = els['Date'].split('/');
                const dte = new Date(dt[2], dt[1] - 1, dt[0]);
                const hr = els['Heure'].split(':');
                dte.setHours(hr[0], hr[1], hr[2], 0);
                els['Date'] = dte;

                // console.log(els['Debit']);
                // console.log(els['Credit']);

                els['Debit'] = (els['Debit'] !== undefined) ?
                    +(els['Debit'].replace(/\s/g, '').replace(',', '.')) :
                    0;
                els['Credit'] = (els['Credit'] !== undefined && els['Credit'] !== 0) ?
                    +(els['Credit'].replace(/\s/g, '').replace(',', '.')) :
                    0;

                els['Super-distributeur'] = (els['Super-distributeur'] !== undefined) ?
                    +(els['Super-distributeur'].replace(/\s/g, '').replace(',', '.')) :
                    0;

                els['Sous-distributeur'] = (els['Sous-distributeur'] !== undefined) ?
                    +(els['Sous-distributeur'].replace(/\s/g, '').replace(',', '.')) :
                    0;

                els['HTComm'] = ((els['Super-distributeur']) / 1.1925);
                els['TVA'] = ((els['HTComm']) * 0.1925);

                els['Agence'] = getAgence(els['Compte1'], puces);
                
                if (els['Service'] === 'Cash in') {
                    els['code'] = 'DOM';
                } else if (els['Service'] === 'Cash Out' || els['Service'] === 'Cash Out For Non Register') {
                    els['code'] = 'ROM';
                }

                // console.log(els);

                result.push(els);
            });

            resolve(result.filter((eF) => eF['Agence'] !== 'SIM PARTENAIRE'));

            // loadOMFiles(json);
        };

        fileReader.readAsArrayBuffer(file);

    });
};

const getAgence = (puce: string, puces: any[]) => {

    const agence = puces.filter((pc) => (pc['Puce'] === puce));

    if (agence.length > 0) { return agence[0]['Agence'] }

    return 'AGENCE INCONNUE';
};

export const loadOMFiles = (result: any[], workbook: Excel.Workbook, filename: string) => {

    const headers = Object.keys(result[0])
        .map((uniq) => {
            return { header: uniq, key: uniq, width: 14 };
        });

    const total = result.filter(el => (el['Service'] === 'Cash in' || el['Service'] === 'Cash Out' || el['Service'] === 'Cash Out For Non Register'));

    if (result.length > 0) {
        const worksheet5 = workbook.addWorksheet('Total Commission de ' + filename);
        worksheet5.columns = headers;
        worksheet5.getColumn(3).numFmt = 'dd/mm/yyyy';
        worksheet5.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';

        worksheet5.addRows(total);
    }

    const depot = result.filter((el) => el['Service'] === 'Cash in');

    if (depot.length > 0) {
        const worksheet1 = workbook.addWorksheet('Cash in de ' + filename);
        worksheet1.columns = headers;
        worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
        worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet1.addRows(depot);
    }

    const retrait = result.filter((el) => (el['Service'] === 'Cash Out' || el['Service'] === 'Cash Out For Non Register'));

    if (retrait.length > 0) {
        const worksheet2 = workbook.addWorksheet('Cash out de ' + filename);
        worksheet2.columns = headers;
        worksheet2.getColumn(3).numFmt = 'dd/mm/yyyy';
        worksheet2.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet2.addRows(retrait);
    }

    const c2c = result.filter((el) => (el['Service'] === 'C2C Transfer'));

    if (c2c.length > 0) {
        const worksheet3 = workbook.addWorksheet('C2C Transfer de ' + filename);
        worksheet3.columns = headers;
        worksheet3.getColumn(3).numFmt = 'dd/mm/yyyy';
        worksheet3.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';

        worksheet3.addRows(c2c);
    }

    const autres = result.filter((el) => (el['Service'] !== 'Cash in'
        && el['Service'] !== 'Cash Out'
        && el['Service'] !== 'C2C Transfer'
        && el['Service'] !== 'Cash Out For Non Register'));

    if (autres.length > 0) {
        const worksheet4 = workbook.addWorksheet('Autres de ' + filename);
        worksheet4.columns = headers;
        worksheet4.getColumn(3).numFmt = 'dd/mm/yyyy';
        worksheet4.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';

        worksheet4.addRows(autres);
    }

    return workbook;

};
