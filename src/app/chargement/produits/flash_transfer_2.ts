import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';

export const uploadFT2 = (file, id, fullname, filename) => {

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
                ['N', 'TYPE', 'DATE', 'HEURE', 'N0 ENVOI', 'NO REF', 'MONTANT', 'FRAIS', 'DEVISE', 'DEST', 'DESTINATION']
            ], { origin: 0 });

            const ftjson = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            const result = [];

            console.log(ftjson);

            const todo = ftjson.filter((el => el['TYPE'] === 'ENVOI' || el['TYPE'] === 'RECEPTION'));

            todo.forEach((element: any) => {

                const els = {
                    type: 'FLASH TRANSFER',
                    ...element,
                    HTComm: 0,
                    TVA: 0,
                    timestamp: new Date(),
                    loadby: id,
                    loadbyName: fullname,
                    filename
                };

                const dt = els['DATE'].split('-');
                const dte = new Date(dt[2], dt[1] - 1, dt[0]);
                dte.setHours(11, 0, 0, 0);
                els['DATE'] = dte;

                els['Date'] = dte;

                if (!els['FRAIS']) {
                    els['FRAIS'] = '0';
                }

                els['FRAIS '] = +els['FRAIS'];

                if (!els['FRAIS ']) {
                    els['FRAIS '] = +((els['FRAIS'] as String).substring(0, els['FRAIS'].length - 4));
                }
                els['MONTANT'] = +els['MONTANT'];

                if (els['TYPE'] === 'ENVOI') {
                    els['TYPE'] = 'SENT';
                    els['HTComm'] = ((els['FRAIS ']) / 1.1925) * 0.35;
                    els['code'] = 'EFT';
                } else if (els['TYPE'] === 'RECEPTION') {
                    els['TYPE'] = 'RECEIVED';
                    els['HTComm'] = ((els['FRAIS ']) / 1.1925);
                    els['code'] = 'RFT';
                }

                els['TVA'] = (els['FRAIS '] - (els['FRAIS '] / 1.1925));

                console.log(els);

                result.push(els);
            });

            resolve(result);

            // loadOMFiles(json);
        };

        fileReader.readAsArrayBuffer(file);

    });
};
