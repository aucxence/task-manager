import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';

export const uploadRSW = (file, id, fullname, filename) => {

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
                ['Location Code', 'City', 'Local', 'Opérateur', 'Devise', 'Date d\'envoi', 'MTN', 'MTN payeur', 'Folio',
                    'Bénéficiaire', 'Montant de paiement']
            ], { origin: 0 });

            const swjson = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            const result = [];

            const todo = swjson.filter((e) => (e['Bénéficiaire'] !== undefined && e['Bénéficiaire'] !== 'Bénéficiaire'));

            todo.forEach((element: any) => {

                const els = {
                    type: 'RETRAITS SMALL WORLD',
                    code: 'RSW',
                    ...element,
                    HTComm: 0,
                    TVA: 0,
                    timestamp: new Date(),
                    loadby: id,
                    loadbyName: fullname,
                    filename
                };

                const parts = els['Date d\'envoi'].split(' ');

                const dt = parts[0].split('/');
                const dte = new Date(20 + dt[2], dt[1] - 1, dt[0]);

                const hr = parts[1].split(':');
                dte.setHours(hr[0], hr[1], hr[2], 0);

                els['Date'] = dte;

                // console.log(els['Date']);

                // console.log('before: ' + els['Montant de paiement']);

                els['Montant de paiement'] = (els['Montant de paiement'] !== undefined) ?
                    +(els['Montant de paiement'].replace(/\s/g, '').replace(/,/g, '')) :
                    0;

                // console.log('after: ' + els['Montant de paiement']);

                els['Fee'] = 0;

                els['AFBComm'] = els['Fee'] * 0.25;
                els['CommTTC'] = els['AFBComm'] * 0.65;

                els['HTComm'] = els['CommTTC'];

                els['TVA'] = 0;

                result.push(els);
            });

            // resolve(result.filter((eF) => eF['Agence'] !== 'SIM PARTENAIRE'));

            resolve(result);

            // loadOMFiles(json);
        };

        fileReader.readAsArrayBuffer(file);

    });
};

export const uploadESW = (file, id, fullname, filename) => {

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
                ['Local', 'Opérateur', 'Devise 1', 'Date d\'envoi', 'MTN', 'MTN agent', 'Expéditeur', 'Montant principal d\'Envoi', 'Total vente', 'MTN payeur', 'Pays',
                    'Bénéficiaire', 'Montant de paiement', 'Devise 2', 'Statut', 'Statut d\'avancement']
            ], { origin: 0 });

            const swjson = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            const result = [];

            const todo = swjson.filter((e) => (e['Bénéficiaire'] !== undefined && e['Opérateur'] !== 'Opérateur'));

            todo.forEach((element: any) => {

                const els = {
                    type: 'ENVOIS SMALL WORLD',
                    code: 'ESW',
                    ...element,
                    HTComm: 0,
                    TVA: 0,
                    timestamp: new Date(),
                    loadby: id,
                    loadbyName: fullname,
                    filename
                };

                const parts = els['Date d\'envoi'].split(' ');

                const dt = parts[0].split('/');
                const dte = new Date(20 + dt[2], dt[1] - 1, dt[0]);

                const hr = parts[1].split(':');
                dte.setHours(hr[0], hr[1], hr[2], 0);

                els['Date'] = dte;

                console.log(els['Date']);

                els['Montant principal d\'Envoi'] = (els['Montant principal d\'Envoi'] !== undefined) ?
                    +(els['Montant principal d\'Envoi'].replace(/\s/g, '').replace(/,/g, '')) :
                    0;

                els['Total vente'] = (els['Total vente'] !== undefined) ?
                    +(els['Total vente'].replace(/\s/g, '').replace(/,/g, '')) :
                    0;

                els['Fee'] = els['Total vente'] - els['Montant principal d\'Envoi'];

                els['AFBComm'] = els['Fee'] * 0.25;
                els['CommTTC'] = els['AFBComm'] * 0.65;

                els['HTComm'] = ((els['CommTTC']) / 1.1925);

                els['TVA'] = ((els['HTComm']) * 0.1925);

                result.push(els);
            });

            // resolve(result.filter((eF) => eF['Agence'] !== 'SIM PARTENAIRE'));

            resolve(result);

            // loadOMFiles(json);
        };

        fileReader.readAsArrayBuffer(file);

    });
};

export function loadSWFiles(result: any, workbook: Excel.Workbook, filename: string) {

    console.log(result);

    const headers = Object.keys(result[0])
        .map((uniq) => {
            return { header: uniq, key: uniq, width: 14 };
        });

    if (result.length > 0) {
        const worksheet1 = workbook.addWorksheet('RSW ' + filename);
        worksheet1.columns = headers;
        // worksheet1.getColumn(20).numFmt = 'dd/mm/yyyy';
        // worksheet1.getColumn(18).numFmt = 'dd/mm/yyyy HH:mm';

        worksheet1.addRows(result);
    }

    return workbook;
};