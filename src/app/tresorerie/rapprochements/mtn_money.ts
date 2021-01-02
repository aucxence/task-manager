import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';

import { Papa } from 'ngx-papaparse';

export function uploadCxMOMO(file: any, papa: Papa, id: string, fullname: string, filename: string) {

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

            if (momojson[0]['Statut']) {
                const todo = momojson.filter((el => (el['Statut'] === 'RÃ©ussi')));

                todo.forEach((element: any) => {

                    const els = {
                        ...element,
                        'CommTTC Cx': 0,
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

                    els['Identifiant Cx'] = els['Identifiant'];

                    // els['De'] = els['De'].split(':')[1].split('/')[0].substring(3);
                    // els['Ã '] = els['Ã '].split(':')[1].split('/')[0].substring(3);

                    // console.log(els);

                    els['CommTTC Cx'] = els['Montant'];
                    els['HTComm'] = els['CommTTC Cx'] / 1.1925;
                    els['TVA'] = els['HTComm'] * 0.1925;

                    const dte = new Date(els['Date']);
                    dte.setHours(8, 0, 0, 0);

                    els['Date'] = dte;

                    delete els['Identifiant'];
                    delete els['Date'];
                    delete els['TYPE'];
                    delete els['De'];
                    delete els['Ã '];
                    delete els['Montant'];

                    result.push(els);
                });
            } else if (momojson[0]['Id,"External Transaction Id","Date","Status","Type","Provider Category","Information","Note/Message","From","From Name","From Handler Name","To","To Name","To Handler Name","Initiated By","On Behalf Of","Amount","Currency","Fee","Currency","Discount","Currency","Promotion","Currency","Coupon","Currency","Balance","Currency"']) {
                const todo = momojson.map((el) => {
                    const tr = {};
                    // console.log(el);
                    // (el['SC Order Number'] as string).split(',').forEach((e, i) => {
                    //   tr[labels[i]] = e;
                    // });

                    let decorti = [];

                    if (el['Id,"External Transaction Id","Date","Status","Type","Provider Category","Information","Note/Message","From","From Name","From Handler Name","To","To Name","To Handler Name","Initiated By","On Behalf Of","Amount","Currency","Fee","Currency","Discount","Currency","Promotion","Currency","Coupon","Currency","Balance","Currency"']) {
                        console.log('--->');
                        decorti = papa.parse(el['Id,"External Transaction Id","Date","Status","Type","Provider Category","Information","Note/Message","From","From Name","From Handler Name","To","To Name","To Handler Name","Initiated By","On Behalf Of","Amount","Currency","Fee","Currency","Discount","Currency","Promotion","Currency","Coupon","Currency","Balance","Currency"']).data[0];
                        ['Id', 'External Transaction Id', 'Date', 'Status', 'Type', 'Provider Category', 'Information', 'Note/Message', 'From', 'From Name', 'From Handler Name', 'To', 'To Name', 'To Handler Name', 'Initiated By', 'On Behalf Of', 'Amount', 'Currency', 'Fee', 'Currency', 'Discount', 'Currency', 'Promotion', 'Currency', 'Coupon', 'Currency', 'Balance', 'Currency'].forEach((lb, i) => {
                            tr[lb] = decorti[i];
                        });
                    }
                    console.log('element: ', decorti);



                    return tr;
                }).filter((el => (el['Status'] === 'Successful')));

                todo.forEach((element: any) => {

                    const els = {
                        ...element,
                        'CommTTC Cx': 0,
                        HTComm: 0,
                        TVA: 0,
                        timestamp: new Date(),
                        loadby: id,
                        loadbyName: fullname,
                        filename
                    };

                    els['TYPE'] = els['Type'];
                    els['type'] = 'MTN MOBILE MONEY';

                    els['Amount'] = Math.abs(+(els['Amount']));

                    els['Identifiant Cx'] = els['Id'];

                    // els['De'] = els['De'].split(':')[1].split('/')[0].substring(3);
                    // els['Ã '] = els['Ã '].split(':')[1].split('/')[0].substring(3);

                    // console.log(els);

                    els['CommTTC Cx'] = els['Amount'];
                    els['HTComm'] = els['CommTTC Cx'] / 1.1925;
                    els['TVA'] = els['HTComm'] * 0.1925;

                    let dte: Date;

                    const val = els['Date'].split(' ');
                    const dt = val[0].split('/');
                    if (val[1]) {
                        const hr = val[1].split(':');
                        dte = new Date(+dt[2], +dt[0] - 1, +dt[1], +hr[0], +hr[1], +hr[2]);
                    } else {
                        dte = new Date(+dt[2], +dt[0] - 1, +dt[1], 5, 0);
                    }

                    els['Date'] = dte;

                    delete els['Identifiant'];
                    delete els['Date'];
                    delete els['TYPE'];
                    delete els['From Name'];
                    delete els['From Handler Name'];
                    delete els['Amount'];
                    delete els['To'];
                    delete els['To Name'];
                    delete els['To Handler Name'];
                    delete els['Initiated By'];

                    result.push(els);
                });
            }



            resolve(result);

            //   loadMOMOFiles(momoj);

            // console.log(json);

        };

        fileReader.readAsArrayBuffer(file);
    });
}

export function rapprocherMOMO(t1, t2, id1, id2, nml1, nml2, tolnml) {

    const map1 = {};
    const map2 = {};
    t1.forEach((el) => map1[el[id1]] = el);
    t2.forEach((el) => map2[el[id2]] = el);

    // console.log(map1);
    // console.log(map2);

    const exact_match = [];
    const errored_match = [];

    for (const prop in map1) {
        if (map2[prop] !== undefined) {

            if (Math.abs(map1[prop][nml1]) === Math.abs(map2[prop][nml2])) {
                // console.log('Frais: ' + Math.abs(+map1[prop][fttc1]) + ' = ' + Math.abs(map2[prop][fttc2]));

                map1[prop]['suspens'] = false;
                map1[prop]['difference'] = 0;
                map1[prop]['comment'] = 'R.A.S';

                map2[prop]['suspens'] = false;
                map2[prop]['difference'] = 0;
                map2[prop]['comment'] = 'R.A.S';

                exact_match.push({
                    'partenaire': map1[prop],
                    'cashit': map2[prop]
                });

                delete map1[prop];
                delete map2[prop];
            } else if (Math.abs(Math.abs(map1[prop][nml1]) - Math.abs(map2[prop][nml2])) < tolnml) {

                map1[prop]['comment'] = 'Différence négligeable Nominal';
                map2[prop]['comment'] = 'Différence négligeable Nominal';

                map1[prop]['suspens'] = false;
                map2[prop]['suspens'] = false;

                map1[prop]['difference'] = Math.abs(Math.abs(map1[prop][nml1]) - Math.abs(map2[prop][nml2]));
                map2[prop]['difference'] = Math.abs(Math.abs(map1[prop][nml1]) - Math.abs(map2[prop][nml2]));

                exact_match.push({
                    'partenaire': map1[prop],
                    'cashit': map2[prop]
                });

                delete map1[prop];
                delete map2[prop];
            } else {
                map1[prop]['suspens'] = true;
                map1[prop]['comment'] = 'Erreur sur la commission';
                map2[prop]['suspens'] = true;
                map2[prop]['comment'] = 'Erreur sur la commission';

                map1[prop]['difference'] = Math.abs(Math.abs(map1[prop][nml1]) - Math.abs(map2[prop][nml2]));
                map2[prop]['difference'] = Math.abs(Math.abs(map1[prop][nml1]) - Math.abs(map2[prop][nml2]));

                errored_match.push({
                    'partenaire': map1[prop],
                    'cashit': map2[prop]
                });

                delete map1[prop];
                delete map2[prop];
            }
        } else {
            map1[prop]['suspens'] = true;
            map1[prop]['comment'] = 'Equivalent Cash-IT non trouvé - Problème de référence';
        }
    }

    const suspens1 = { ...map1 };
    const suspens2 = { ...map2 };

    for (const prop in suspens2) {
        suspens2[prop]['suspens'] = true;
        suspens2[prop]['comment'] = 'Equivalent partenaire non trouvé - Problème de référence';
    }

    const result = {
        match: exact_match,
        inexactmatch: errored_match,
        suspens1: Object.keys(suspens1).map((e) => suspens1[e]),
        suspens2: Object.keys(suspens2).map((e) => suspens2[e])
    };

    return result;

}

export function momoXLS(result: any, workbook: Excel.Workbook, partnerheaders: string[], cashitheaders: string[],
    partnerdata: any[], cashitdata: any[]) {

    const headers = [...partnerheaders, ...cashitheaders].map((uniq) => {
        return { header: uniq, key: uniq, width: 14 };
    });

    if (result.match.length > 0) {
        const match: any[] = [];
        result.match.forEach((element) => {
            match.push({
                ...element['partenaire'],
                ...element['cashit']
            });
        });

        const worksheet1 = workbook.addWorksheet('Rapprochements');
        worksheet1.columns = headers;
        worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
        // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
        worksheet1.addRows(match);
    }

    if (result.inexactmatch.length > 0) {
        const inexactmatch: any[] = [];
        result.inexactmatch.forEach((element) => {
            inexactmatch.push({
                ...element['partenaire'],
                ...element['cashit']
            });
        });

        const worksheet1 = workbook.addWorksheet('Erreur Commissions');
        worksheet1.columns = headers;
        worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
        // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
        worksheet1.addRows(inexactmatch);
    }

    if (result.suspens1.length > 0 || result.suspens2.length > 0) {

        const worksheet1 = workbook.addWorksheet('Commissions Non rapprochées');
        worksheet1.columns = headers;
        worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
        // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
        worksheet1.addRows(result.suspens1);
        worksheet1.addRows(result.suspens2);
    }

    console.log(partnerdata);

    if (partnerdata.length > 0) {
        const worksheet1 = workbook.addWorksheet('Données MOMO Activité');
        const partneheaders = Object.keys(partnerdata[0])
            .map((uniq) => {
                return { header: uniq, key: uniq, width: 14 };
            });
        worksheet1.columns = partneheaders;
        // worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
        // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
        worksheet1.addRows(partnerdata);
    }

    if (cashitdata.length > 0) {
        const worksheet1 = workbook.addWorksheet('Données MOMO Commission');
        const cashiheaders = cashitheaders
            .map((uniq) => {
                return { header: uniq, key: uniq, width: 14 };
            });
        worksheet1.columns = cashiheaders;
        // worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
        // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
        worksheet1.addRows(cashitdata);
    }

    return workbook;
}
