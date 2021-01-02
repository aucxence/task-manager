import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';

export const uploadOther = (file, id: string, fullname: string, filename: string) => {

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

            json.forEach((element: any) => {

                const els = {
                    type: 'OTHER',
                    ...element,
                    timestamp: new Date(),
                    loadby: id,
                    loadbyName: fullname,
                    filename
                };

                result.push(els);

            });

            resolve(result);

            //   loadFTFiles(json, id, fullname);

        };

        fileReader.readAsArrayBuffer(file);

    });
};

export const loadOtherFiles = (result: any[], workbook: Excel.Workbook, filename: string) => {

    // console.log('-------------------------');

    const headers = Object.keys(result[0])
        .map((uniq) => {
            return { header: uniq, key: uniq, width: 14 };
        });

    const worksheet1 = workbook.addWorksheet('Report de fichier de ' + filename);
    worksheet1.columns = headers;
    worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
    worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
    worksheet1.addRows(result);

    return workbook;

};