import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';

export function compensMG(data: any[]) {
    let result: any[] = [], i = 1, cumul = 0, solde = 0;

    let switching = false;

    result = data
        .sort((tranA: any, tranB: any) => {
            return tranA['Base Amt'] > tranB['Base Amt'] ? -1 : 1;
        })
        .sort((tranA: any, tranB: any) => {
            return tranA['Tran Type'].localeCompare(tranB['Tran Type'])
        }).map((trans: any) => {
            let tr: {
                'N°': any;
                Date: any;
                Référence: any;
                type: any;
                'RMG Montant HT'?: any;
                'RMG Frais MG'?: any;
                'RMG Comm IT'?: any;
                'EMG Montant HT'?: any;
                'EMG Frais MG'?: any;
                'EMG Frais AFB'?: any;
                'EMG Com MG'?: any;
                'EMG Total'?: any;
                Solde: any;
                Cumul: any;
            };

            if (trans['Tran Type'] === 'REC') {
                cumul = (cumul + Math.abs(trans['Base Amt']));
                tr = {
                    'N°': i,
                    Date: trans['Tran Date'],
                    Référence: trans['Reference ID'],
                    type: trans['Tran Type'],
                    'RMG Montant HT': Math.abs(trans['Base Amt']),
                    'RMG Frais MG': trans['Fee Amt'],
                    'RMG Comm IT': trans['Fee Amt'] * 0.1625,
                    Solde: Math.abs(trans['Base Amt']),
                    Cumul: cumul
                };
            } else if (trans['Tran Type'] === 'REF') {
                if (!trans['transformed']) {
                    solde = Math.abs(trans['Base Amt']) + Math.abs(trans['Fee Amt']) + -1 * Math.abs(trans['Fee Amt'] * 0.1625);
                    cumul = cumul + solde;
                    tr = {
                        'N°': i,
                        Date: trans['Tran Date'],
                        Référence: trans['Reference ID'],
                        type: trans['Tran Type'],
                        'RMG Montant HT': Math.abs(trans['Base Amt']),
                        'RMG Frais MG': Math.abs(trans['Fee Amt']),
                        'RMG Comm IT': Math.abs(trans['Fee Amt'] * 0.1625) * -1,
                        Solde: solde,
                        Cumul: cumul
                    };
                } else {
                    console.log(trans['Reference ID']);
                    solde = Math.abs(trans['Comm Amt'] * 0.65) * -1;
                    cumul = cumul + solde;
                    tr = {
                        'N°': i,
                        Date: trans['Tran Date'],
                        Référence: trans['Reference ID'],
                        type: trans['Tran Type'],
                        'RMG Montant HT': Math.abs(trans['Base Amt']),
                        'RMG Frais MG': trans['Comm Amt'],
                        'RMG Comm IT': Math.abs(trans['Comm Amt']) * 0.65 * -1,
                        Solde: solde,
                        Cumul: cumul
                    };
                }
            } else if (trans['Tran Type'] === 'RSN') {
                solde = Math.abs(trans['Base Amt']) + Math.abs(trans['Fee Amt']) + -1 * Math.abs(trans['Fee Amt'] * 0.1625);
                cumul = (cumul + solde);
                tr = {
                    'N°': i,
                    Date: trans['Tran Date'],
                    Référence: trans['Reference ID'],
                    type: trans['Tran Type'],
                    'RMG Montant HT': Math.abs(trans['Base Amt']),
                    'RMG Frais MG': Math.abs(trans['Fee Amt']),
                    'RMG Comm IT': -1 * Math.abs(trans['Fee Amt'] * 0.1625),
                    Solde: solde,
                    Cumul: cumul
                };
            } else if (trans['Tran Type'] === 'RRC') {
                solde = -1 * Math.abs(trans['Base Amt']);
                cumul = (cumul + solde);
                tr = {
                    'N°': i,
                    Date: trans['Tran Date'],
                    Référence: trans['Reference ID'],
                    type: trans['Tran Type'],
                    'RMG Montant HT': -1 * Math.abs(trans['Base Amt']),
                    'RMG Frais MG': 0,
                    'RMG Comm IT': 0,
                    Solde: solde,
                    Cumul: cumul
                };
            } else if (trans['Tran Type'] === 'SEN') {
                if (switching === false) {
                    i = 1;
                    switching = true;
                }

                // to know when to restart counting
                solde = -1 * Math.abs((trans['Base Amt'] + trans['Fee Amt'] - Math.abs(trans['Comm Amt'] * 0.65)))
                cumul = (cumul + solde);
                tr = {
                    'N°': i,
                    Date: trans['Tran Date'],
                    Référence: trans['Reference ID'],
                    type: trans['Tran Type'],
                    'EMG Montant HT': Math.abs(trans['Base Amt']),
                    'EMG Frais MG': trans['Fee Amt'],
                    'EMG Frais AFB': Math.abs(trans['Comm Amt']),
                    'EMG Com MG': -1 * Math.abs(trans['Comm Amt'] * 0.65),
                    'EMG Total': (trans['Base Amt'] + trans['Fee Amt'] - Math.abs(trans['Comm Amt'] * 0.65)),
                    Solde: solde,
                    Cumul: cumul
                };
            }

            i++;

            return tr;
        })

    return result.filter(tr => tr != undefined);
}


export function loadCompensFiles(result: any[], source: any[], workbook: Excel.Workbook) {

    const headers = ['N°', 'Date', 'Référence', 'type', 'RMG Montant HT', 'RMG Frais MG', 'RMG Comm IT',
        'EMG Montant HT', 'EMG Frais MG', 'EMG Frais AFB', 'EMG Com MG', 'EMG Total', 'Solde', 'Cumul'].map((uniq) => {
            return { header: uniq, key: uniq, width: 14, style: { font: { name: 'Times New Roman', size: 11 } } };
        });

    const worksheet1 = workbook.addWorksheet('Compensation MG');
    worksheet1.columns = headers;
    worksheet1.getColumn(2).numFmt = 'dd/mm/yyyy';

    worksheet1.getRow(1).font = { name: 'Times New Roman', bold: true };
    // worksheet1.getColumn(18).numFmt = 'dd/mm/yyyy HH:mm';

    worksheet1.addRows(result);

    for (let i = 5; i <= 14; i++) {
        worksheet1.getColumn(i).numFmt = '#,###';
    }

    for (let i = 1; i <= result.length + 1; i++) {

        for (let j = 1; j <= 14; j++) {
            worksheet1.getCell(i, j).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    const letters = ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

    let n = result.length + 1;

    worksheet1.mergeCells('A' + (n + 2) + ':D' + (n + 2));

    for (let i = 5; i <= 14; i++) {
        worksheet1.getCell(result.length + 3, i).value = { formula: `SUM(${letters[i - 5]}2:${letters[i - 5] + n})`, date1904: true };
        worksheet1.getCell(n + 2, i).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    }

    n = n + 2;

    worksheet1.getCell(result.length + 3, 1).value = 'TOTAL';
    worksheet1.getCell(result.length + 3, 14).value = { formula: `G${n}-K${n}`, date1904: true };

    n = n + 3;

    worksheet1.mergeCells('K' + n + ':M' + (n + 1));
    worksheet1.mergeCells('N' + n + ':N' + (n + 1));

    worksheet1.getCell('K' + n).value = 'COMPENSATION';
    worksheet1.getCell('N' + n).value = { formula: `M${n - 3}`, date1904: true };

    worksheet1.getCell('K' + n).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
    worksheet1.getCell('N' + n).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    const srcheaders = Object.keys(source[0])
        .map((uniq) => {
            return { header: uniq, key: uniq, width: 14 };
        });

    console.log(source);

    const worksheet2 = workbook.addWorksheet('Source');
    worksheet2.columns = srcheaders;
    // worksheet1.getColumn(2).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(18).numFmt = 'dd/mm/yyyy HH:mm';

    worksheet2.addRows(source);




    return workbook;
};

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
                    return (element['Base Amt'] !== undefined
                        && element['Base Amt'] !== null
                        && +element['Base Amt'] !== 0
                        && element['Base Amt'] !== 'Base Amt');
                });



            todo.forEach((element: any) => {

                const date = new Date(element['Tran Date']);
                date.setHours(11, 0, 0, 0);

                const els = {
                    type: 'MONEYGRAM',
                    ...element,
                    timestamp: new Date(),
                    loadby: id,
                    loadbyName: fullname,
                    filename
                };

                els['Tran Date'] = date;
                // els['TVA'] = els['Fee Amt'] * 0.1925;

                els['Date'] = new Date(els['Tran Date']);

                let nb = els['Base Amt'].length;
                els['Base Amt'] = (+els['Base Amt']) ? +els['Base Amt'] : +(els['Base Amt'].substring(1, nb - 1));

                nb = els['Fee Amt'].length;
                els['Fee Amt'] = (+els['Fee Amt']) ? +els['Fee Amt'] : +(els['Fee Amt'].substring(1, nb - 1));

                nb = els['Comm Amt'].length;
                els['Comm Amt'] = (+els['Comm Amt']) ? +els['Comm Amt'] : +(els['Comm Amt'].substring(1, nb - 1));

                els['Fx Rev Share Amt'] = +els['Fx Rev Share Amt'];

                // console.log(els);

                result.push(els);

            });

            // -----------------------

            const autres: any[] = result.filter((el) => (el['Tran Type'] !== 'REC' && el['Tran Type'] !== 'SEN'));
            const ids = autres.map((ats) => ats['Reference ID']);

            result = result.map((el) => {
                if (el['Tran Type'] === 'SEN' && ids.indexOf(el['Reference ID']) !== -1) {
                    el['Tran Type'] = 'SEN';
                    el['code'] = 'AEMG';
                }
                return el;
            });

            const recrefsnulls = json.filter(el => {

                if (el['Base Amt'] !== undefined
                    && el['Base Amt'] !== null
                    && +el['Base Amt'] === 0
                    && el['Base Amt'] !== 'Base Amt') {

                    if (el['Tran Type'] !== 'SEN') {
                        if (el['Tran Type'] !== 'REF') {
                            return false;
                        } else {
                            if (el['Comm Amt'] > 0) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }
                    return false;

                }
                return false;
            });

            const nonnullsIDs = todo.filter(el => el['Tran Type'] !== 'SEN').map(el => el['Reference ID']);

            const extras = recrefsnulls.filter((el) => {
                return (
                    nonnullsIDs.indexOf(el['Reference ID']) === -1
                );
            }).map((element: any) => {

                const els = {
                    type: 'MONEYGRAM',
                    ...element,
                    timestamp: new Date(),
                    loadby: id,
                    loadbyName: fullname,
                    filename
                };
                els['transformed'] = true;

                const date = new Date(element['Tran Date']);
                date.setHours(11, 0, 0, 0);

                els['Tran Date'] = date;
                // els['TVA'] = els['Fee Amt'] * 0.1925;

                els['Date'] = new Date(els['Tran Date']);

                els['Base Amt'] = +els['Base Amt'];
                els['Fee Amt'] = +els['Fee Amt'];
                els['Comm Amt'] = +els['Comm Amt'];

                els['Fx Rev Share Amt'] = +els['Fx Rev Share Amt'];
                return els;
            })

            result = [...result, ...extras];

            console.log(extras);


            resolve(result);

            // loadMGFiles(mgjson, id, fullname, mgfees);

        };

        fileReader.readAsArrayBuffer(file);
    });

}