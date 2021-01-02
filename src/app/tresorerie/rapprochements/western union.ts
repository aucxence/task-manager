import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';

export function rapprocherWU(t1, t2, id1, id2, nml1, nml2, fttc1, fttc2, tolnml, tolfttc) {

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
            // console.log('Nominal: ' + Math.abs(+map1[prop][nml1]) + ' = ' + Math.abs(map2[prop][nml2]));

            let mgfees = Math.round((Math.abs(map1[prop][fttc1])));
            let otherfees = Math.round((Math.abs(map2[prop][fttc2])));

            if (map1[prop]['TYPE'] === 'RECEIVED') { mgfees = 0; }
            if (map2[prop]['Etat'] === 'S') { otherfees = 0; }

            if (Math.abs(map1[prop][nml1]) === Math.abs(map2[prop][nml2])) {
                // console.log('Frais: ' + Math.abs(+map1[prop][fttc1]) + ' = ' + Math.abs(map2[prop][fttc2]));

                if (mgfees === Math.abs(otherfees)) {

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
                } else if ((mgfees - otherfees) < tolfttc) {
                    map1[prop]['suspens'] = false;
                    map1[prop]['difference'] = (mgfees - Math.abs(map2[prop][fttc2]));
                    map1[prop]['comment'] = 'Différence négligeable frais';

                    map2[prop]['suspens'] = false;
                    map2[prop]['difference'] = (mgfees - Math.abs(map2[prop][fttc2]));
                    map2[prop]['comment'] = 'Différence négligeable frais';

                    exact_match.push({
                        'partenaire': map1[prop],
                        'cashit': map2[prop]
                    });

                    delete map1[prop];
                    delete map2[prop];
                } else {
                    console.log(typeof map1[prop][fttc1] + ' -- ' + typeof map2[prop][fttc2]);
                    console.log(map1[prop][fttc1] + ' -- ' + map2[prop][fttc2]);

                    map1[prop]['suspens'] = true;
                    map1[prop]['difference'] = (mgfees - otherfees);
                    map1[prop]['comment'] = 'Erreur sur les frais';

                    map2[prop]['suspens'] = true;
                    map2[prop]['difference'] = (mgfees - otherfees);
                    map2[prop]['comment'] = 'Erreur sur les frais';

                    errored_match.push({
                        'partenaire': map1[prop],
                        'cashit': map2[prop]
                    });

                    delete map1[prop];
                    delete map2[prop];
                }
            } else if (Math.abs(Math.abs(map1[prop][nml1]) - Math.abs(map2[prop][nml2])) < tolnml) {

                map1[prop]['comment'] = 'Différence négligeable Nominal';
                map2[prop]['comment'] = 'Différence négligeable Nominal';

                map1[prop]['difference'] = Math.abs(Math.abs(+map1[prop][nml1]) - Math.abs(map2[prop][nml2]));
                map2[prop]['difference'] = Math.abs(Math.abs(+map1[prop][nml1]) - Math.abs(map2[prop][nml2]));

                if (mgfees === Math.abs(otherfees)) {
                    map1[prop]['suspens'] = false;
                    map2[prop]['suspens'] = false;

                    exact_match.push({
                        'partenaire': map1[prop],
                        'cashit': map2[prop]
                    });

                    delete map1[prop];
                    delete map2[prop];
                } else if (Math.abs(map1[prop][fttc1] - map2[prop][fttc2]) < tolfttc) {
                    map1[prop]['suspens'] = false;
                    map1[prop]['comment'] = map1[prop]['comment'] + ' et les frais';
                    map2[prop]['suspens'] = false;
                    map2[prop]['comment'] = map1[prop]['comment'] + ' et les frais';

                    map1[prop]['difference'] = map1[prop]['difference'] + Math.abs(mgfees - Math.abs(map2[prop][fttc2]));
                    map2[prop]['difference'] = map2[prop]['difference'] + Math.abs(mgfees - Math.abs(map2[prop][fttc2]));

                    exact_match.push({
                        'partenaire': map1[prop],
                        'cashit': map2[prop]
                    });

                    delete map1[prop];
                    delete map2[prop];
                } else {
                    console.log(typeof map1[prop][fttc1] + ' -- ' + typeof map2[prop][fttc2]);

                    map1[prop]['suspens'] = true;
                    map1[prop]['comment'] = 'Erreur sur les frais';
                    map2[prop]['suspens'] = true;
                    map2[prop]['comment'] = 'Erreur sur les frais';

                    map1[prop]['difference'] = Math.abs(mgfees - Math.abs(map2[prop][fttc2]));
                    map2[prop]['difference'] = Math.abs(mgfees - Math.abs(map2[prop][fttc2]));

                    errored_match.push({
                        'partenaire': map1[prop],
                        'cashit': map2[prop]
                    });

                    delete map1[prop];
                    delete map2[prop];
                }
            } else {
                map1[prop]['suspens'] = true;
                map1[prop]['comment'] = 'Erreur sur le Nominal';
                map2[prop]['suspens'] = true;
                map2[prop]['comment'] = 'Erreur sur le Nominal';

                map1[prop]['difference'] = Math.abs(Math.abs(+map1[prop][nml1]) - Math.abs(map2[prop][nml2]));
                map2[prop]['difference'] = Math.abs(Math.abs(+map1[prop][nml1]) - Math.abs(map2[prop][nml2]));

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

export function uploadActiviteWU(file: any, id: string, fullname: string, filename: string) {

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
                ['wuId Activité', 'Date Activité', 'useless1', 'MTCN Activité', 'useless2', 'other1', 'OperID', 'other2',
                    'TermID', 'useless5', 'Etat', 'chargesUSD', 'principal Activité', 'agentShare', 'agentShare',
                    'charges Activité', 'commission Activité', 'commissionUSD', 'Taxes Activité', 'profitEUR', 'profitUSD', 'Total Activité']
            ], { origin: 0 });

            let json = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            json = json.filter((e) => (e['MTCN Activité'] && e['MTCN Activité'].length === 10 && e['Etat']));

            const result = json.map((el) => {

                // console.log(el['ChargesEUR']);
                el['charges Activité'] = (+(el['charges Activité'].replace(/\s/g, '').replace(/,/g, '')));
                // console.log('becomes ', el['ChargesEUR']);

                el['Taxes Activité'] = (+(el['Taxes Activité'].replace(/\s/g, '').replace(/,/g, '')));

                el['Total Activité'] = (+(el['Total Activité'].replace(/\s/g, '').replace(/,/g, '')));

                // console.log(el['PrincipalEUR']);
                el['principal Activité'] = (+(el['principal Activité'].replace(/\s/g, '').replace(/,/g, '')));
                // console.log('becomes ', el['PrincipalEUR']);

                // el['TaxesEUR'] = (+(el['TaxesEUR'].replace(/\s/g, '').replace(/,/g, '')));
                // el['TotalEUR'] = (+(el['TotalEUR'].replace(/\s/g, '').replace(/,/g, '')));



                // el['Charges'] = el['ChargesEUR'] * 655.957;
                // el['principal'] = el['PrincipalEUR'] * 655.957;
                // el['Taxes'] = el['TaxesEUR'] * 655.957;
                // el['Total'] = el['TotalEUR'] * 655.957;

                el['HTComm Activité'] = el['charges Activité'] * 0.2 * 0.6 / 1.1925;
                el['TVA Activité'] = el['HTComm Activité'] * 0.1925;

                el['type'] = 'WESTERN UNION';

                el['timestamp'] = new Date();
                el['loadby'] = id;
                el['loadbyName'] = fullname;

                if (el['Etat'] === 'S') {
                    el['code'] = 'RWU';
                    el['TYPE Activité'] = 'RECEIVED';
                } else if (el['Etat'] === 'P-S' || el['Etat'] === 'UP-S') {
                    el['code'] = 'EWU';
                    el['TYPE Activité'] = 'SENT';
                }

                const dt = el['Date Activité'].split('/');
                const dte = new Date(dt[2], dt[1] - 1, dt[0]);
                dte.setHours(11, 0, 0, 0);

                el['Date Activité'] = dte;

                el['filename'] = filename;

                return el;
            });

            console.log(json);

            resolve(result);
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

                el['agentShare'] = el['agentShareEUR'] * 655.957;
                el['commission'] = el['commissionEUR'] * 655.957;
                el['principal'] = +el['principalEUR'] * 655.957;
                el['profit'] = +el['profitEUR'] * 655.957;

                el['charges'] = 0;

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

export function wuXLS(result: any, workbook: Excel.Workbook, partnerheaders: string[], cashitheaders: string[],
    partnerdata: any[], cashitdata: any[]) {

    const headers = [...partnerheaders, ...cashitheaders].map((uniq) => {
        return { header: uniq, key: uniq, width: 14 };
    });

    console.log(headers);

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

        const worksheet1 = workbook.addWorksheet('Suspends WU Montant');
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
        const worksheet1 = workbook.addWorksheet('Données WU Activité');
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
        const worksheet1 = workbook.addWorksheet('Données WU Commission');
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