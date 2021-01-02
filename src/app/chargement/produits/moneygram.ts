import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';

import * as countries from 'countries-api';
import { belgiquefrance, uemoa, international, cemac, usacanada, benin } from '../comm/moneygram_commission';

export function uploadMG(file, id: string, fullname: string, mgfees: any, filename: string) {

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

            // 

            // 

            let result = [];

            const todo = json
                .filter((element) => {
                    return ((element['Base Amt'] !== undefined
                        && element['Base Amt'] !== null
                        && +element['Base Amt'] !== 0
                        && element['Base Amt'] !== 'Base Amt')
                        ||
                        (element['Tran Type'] === 'REF' && element['Comm Amt'] > 0));
                });



            todo.forEach((element: any) => {

                let afbcomm = Math.abs((element['Comm Amt'] * 0.65));
                let transfercomm = 0;

                if (element['Tran Type'] === 'SEN') {
                    const iso2 = (countries.findByCCA3(element['Rcv Cntry']).data)[0].cca2;
                    if (international.indexOf(iso2) > -1) {
                        transfercomm = getComm(element['Base Amt'], mgfees['international']);
                    } else if (usacanada.indexOf(iso2) > -1) {
                        transfercomm = getComm(element['Base Amt'], mgfees['usacanada']);
                    } else if (belgiquefrance.indexOf(iso2) > -1) {
                        transfercomm = getComm(element['Base Amt'], mgfees['belgiquefrance']);
                    } else if (uemoa.indexOf(iso2) > -1) {
                        transfercomm = getComm(element['Base Amt'], mgfees['uemoa']);
                    } else if (cemac.indexOf(iso2) > -1) {
                        transfercomm = getComm(element['Base Amt'], mgfees['cemac']);
                    } else if (benin.indexOf(iso2) > -1) {
                        transfercomm = getComm(element['Base Amt'], mgfees['benin']);
                    } else {
                        // console.log('---> ' + element['Reference ID'] + ' == ' + iso2);
                        throw new Error('Problème de zone');
                    }
                    element['code'] = 'EMG';
                } else if (element['Tran Type'] === 'REC') {
                    element['code'] = 'RMG';
                } else if (element['Tran Type'] === 'REF') {
                    const iso2 = (countries.findByCCA3(element['Rcv Cntry']).data)[0].cca2;
                    if (international.indexOf(iso2) > -1) {
                        transfercomm = -1 * getComm(element['Base Amt'], mgfees['international']);
                    } else if (usacanada.indexOf(iso2) > -1) {
                        transfercomm = -1 * getComm(element['Base Amt'], mgfees['usacanada']);
                    } else if (belgiquefrance.indexOf(iso2) > -1) {
                        transfercomm = -1 * getComm(element['Base Amt'], mgfees['belgiquefrance']);
                    } else if (uemoa.indexOf(iso2) > -1) {
                        transfercomm = -1 * getComm(element['Base Amt'], mgfees['uemoa']);
                    } else if (cemac.indexOf(iso2) > -1) {
                        transfercomm = -1 * getComm(element['Base Amt'], mgfees['cemac']);
                    } else if (benin.indexOf(iso2) > -1) {
                        transfercomm = -1 * getComm(element['Base Amt'], mgfees['benin']);
                    } else {
                        // console.log('---> ' + element['Reference ID'] + ' == ' + iso2);
                        throw new Error('Problème de zone');
                    }
                    afbcomm = -1 * afbcomm;
                    element['code'] = 'AMG';
                    element['Base Amt'] = -1 * element['Base Amt'];
                    element['Fee Amt'] = -1 * element['Fee Amt'];
                    element['TVA'] = -1 * element['TVA'];
                }

                const date = new Date(element['Tran Date']);
                date.setHours(11, 0, 0, 0);

                const els = {
                    type: 'MONEYGRAM',
                    AFBComm: afbcomm,
                    ITComm: transfercomm,
                    HTComm: afbcomm + transfercomm,
                    TVA: (element['Tran Type'] === 'SEN') ? ((afbcomm + transfercomm) * 0.1925) : 0,
                    ...element,
                    timestamp: new Date(),
                    loadby: id,
                    loadbyName: fullname,
                    filename
                };

                els['Tran Date'] = date;
                // els['TVA'] = els['Fee Amt'] * 0.1925;

                els['Date'] = new Date(els['Tran Date']);

                els['Base Amt'] = +els['Base Amt'];
                els['Fee Amt'] = +els['Fee Amt'];
                els['Comm Amt'] = +els['Comm Amt'];

                els['Fx Rev Share Amt'] = +els['Fx Rev Share Amt'];

                // console.log(els);

                result.push(els);

            });

            // -----------------------

            const autres: any[] = result.filter((el) => (el['Tran Type'] !== 'REC' && el['Tran Type'] !== 'SEN'));
            const ids = autres.map((ats) => ats['Reference ID']);

            result = result.map((el) => {
                if (el['Tran Type'] === 'SEN' && ids.indexOf(el['Reference ID']) !== -1) {
                    el['Tran Type'] = 'ASEN';
                    el['code'] = 'AEMG';
                }
                return el;
            });

            // -----------------------

            resolve(result);

            // loadMGFiles(mgjson, id, fullname, mgfees);

        };

        fileReader.readAsArrayBuffer(file);
    });

}

function getComm(amount: number, jsonelement: { [key: number]: number }) {

    // console.log(jsonelement);
    const keys = Object.keys(jsonelement).map(key => +key);

    for (const key of keys) {
        // console.log(amount + ' and ' + key);
        if (+amount <= +key) {
            return jsonelement[+key];
        }
    }

    throw new Error('Pas de commissions');
}

export function loadMGFiles(result: any, workbook: Excel.Workbook, filename: string) {

    console.log(result);

    const headers = Object.keys(result[0])
        .map((uniq) => {
            return { header: uniq, key: uniq, width: 14 };
        });

    let autres: any[] = result.filter((el) => (el['Tran Type'] !== 'REC' && el['Tran Type'] !== 'SEN'));
    const ids = autres.map((ats) => ats['Reference ID']);

    let emg = result.filter((el) => el['Tran Type'] === 'SEN');

    if (autres.length > 0) {
        const eemg = emg.filter((el) => ids.indexOf(el['Reference ID']) !== -1);
        autres = [...autres, ...eemg];
        autres.sort((mg1, mg2) => {
            return +mg1['Reference ID'] > +mg2['Reference ID'] ? 1 : -1;
        });
        emg = emg.filter((el) => ids.indexOf(el['Reference ID']) === -1);
    }

    if (emg.length > 0) {
        const worksheet1 = workbook.addWorksheet('EMG ' + filename);
        worksheet1.columns = headers;
        worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
        worksheet1.getColumn(18).numFmt = 'dd/mm/yyyy HH:mm';

        worksheet1.addRows(emg);
    }

    const rmg = result.filter((el) => el['Tran Type'] === 'REC');

    if (rmg.length > 0) {
        const worksheet2 = workbook.addWorksheet('RMG du ' + filename);
        worksheet2.columns = headers;
        worksheet2.getColumn(6).numFmt = 'dd/mm/yyyy';
        worksheet2.getColumn(18).numFmt = 'dd/mm/yyyy HH:mm';

        worksheet2.addRows(rmg);
    }

    if (autres.length > 0) {
        const worksheet3 = workbook.addWorksheet('AUTRES MG du ' + filename);
        worksheet3.columns = headers;
        worksheet3.getColumn(18).numFmt = 'dd/mm/yyyy';
        worksheet3.getColumn(6).numFmt = 'dd/mm/yyyy';
        worksheet3.addRows(autres);
    }


    return workbook;
};
