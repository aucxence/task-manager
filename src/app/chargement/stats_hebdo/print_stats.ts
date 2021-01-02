import * as Excel from 'exceljs';

export function printStats(relevant: any) {
    const workbook = new Excel.Workbook();

    const worksheet = workbook.addWorksheet('Stats hebdo', { properties: { tabColor: { argb: 'FFC0000' } } });

    worksheet.mergeCells('A1:L1');



    const labels = [
        { header: 'POS', width: 6.09 },
        { header: 'PRODUIT', width: 19.64 },
        { header: 'NOMBRE', width: 12.82 },
        { header: 'VOLUME', width: 25.89 },
        { header: 'FRAIS', width: 15.55 },
        { header: 'TVA', width: 15.09 },
        { header: 'COM. PRINC.', width: 20.09 },
        { header: 'AUTRE COM.', width: 20.09 },
        { header: 'TOT. COM TTC', width: 20.09 },
        { header: 'TOT. COM HT', width: 20.09 },
        { header: 'REV./TR', width: 10.09 },
        { header: 'TX/RENT.', width: 10.09 }
    ];

    worksheet.columns = labels;

    const titles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

    const greylines = [
        { line: 4, partner: 'MONEYGRAM' },
        { line: 10, partner: 'FLASH TRANSFER' },
        { line: 16, partner: 'SMALL WORLD' },
        { line: 22, partner: 'WESTERN UNION' },
        { line: 28, partner: 'RAPID TRANSFER ' },
        { line: 34, partner: 'RIA' },
        { line: 40, partner: 'ORANGE MONEY' },
        { line: 45, partner: 'MTN MOMO' },
        { line: 50, partner: 'SMOBILPAY' },
        { line: 60, partner: 'DHL' }];

    const products = [
        [{ produit: 'EMG', taux: 65, code: 'SENT_MG' }, { produit: 'RMG', taux: 65, code: 'RECEIVED_MG' }, { produit: 'AMG', taux: 65, code: 'ANNULATED_MG' }],
        [{ produit: 'EFT', taux: 35, code: 'SENT_FT' }, { produit: 'RFT', taux: 35, code: 'RECEIVED_FT' }, { produit: 'AFT', taux: 65, code: 'ANNULATED_FT' }],
        [{ produit: 'ESW', taux: 65, code: 'SENT_SW' }, { produit: 'RSW', taux: 65, code: 'RECEIVED_SW' }, { produit: 'ASW', taux: 65, code: 'ANNULATED_SW' }],
        [{ produit: 'EWU', taux: 60, code: 'SENT_WU' }, { produit: 'RWU', taux: 60, code: 'RECEIVED_WU' }, { produit: 'AWU', taux: 65, code: 'ANNULATED_WU' }],
        [{ produit: 'ERT', taux: 60, code: 'SENT_RT' }, { produit: 'RRT', taux: 40, code: 'RECEIVED_RT' }, { produit: 'ART', taux: 65, code: 'ANNULATED_RT' }],
        [{ produit: 'ERIA', taux: 70, code: 'SENT_RIA' }, { produit: 'RRIA', taux: 70, code: 'RECEIVED_RIA' }, { produit: 'ARIA', taux: 65, code: 'ANNULATED_RIA' }],
        [{ produit: 'DOM', taux: 'variable', code: 'RECH_OGMO' }, { produit: 'ROM', taux: 'variable', code: 'RECEIVE_OGMO' }],
        [{ produit: 'DMM', taux: 'variable', code: 'RECH_MOMO' }, { produit: 'RMM', taux: 'variable', code: 'RECEIVE_MOMO' }],
        [
            { produit: 'ENEO', taux: 45, code: 'ENEO' },
            { produit: 'CDE', taux: 30, code: 'CDE' },
            { produit: 'CANALPLUS', taux: 3, code: 'CANAL' },
            { produit: 'MTN', taux: 5, code: 'RECHARGE' },
            { produit: 'ORANGE', taux: 5, code: 'RECHARGE' },
            { produit: 'NEXTTEL', taux: 5, code: 'RECHARGE' },
            { produit: 'CAMTEL', taux: 10, code: 'RECHARGE' }
        ],
        [{ produit: 'DHL', taux: 10, code: 'DHL' }]
    ];

    labels.forEach((label, index) => {
        worksheet.getCell(titles[index] + '2').value = label.header;
    });

    worksheet.getCell('A1').value = 'TABLEAU DES STATISTIQUES';
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    for (let j = 1; j <= 10; j++) {
        worksheet.getColumn(j).numFmt = '#,##0;[Red]-(#,##0);"0";_(@_)';
    }

    titles.forEach((title) => {
        for (let k = 1; k <= 63; k++) {
            worksheet.getCell(title + k.toString()).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            worksheet.getCell(title + k.toString()).alignment = { vertical: 'middle', horizontal: 'center' };
        }
    });

    greylines.forEach((lineset, index) => {
        worksheet.getCell('A' + lineset.line.toString()).value = index + 1;
        worksheet.getCell('B' + lineset.line.toString()).value = lineset.partner;

        products[index].forEach((product, j) => {
            worksheet.getCell('B' + (lineset.line + j + 1).toString()).value = product.produit;

            if (relevant[product.produit]) {
                worksheet.getCell('C' + (lineset.line + j + 1).toString()).value = relevant[product.produit]['NOMBRE'];
                worksheet.getCell('D' + (lineset.line + j + 1).toString()).value = relevant[product.produit]['VOLUME'];

                worksheet.getCell('E' + (lineset.line + j + 1).toString()).value = relevant[product.produit]['FRAIS'];

                worksheet.getCell('F' + (lineset.line + j + 1).toString()).value = relevant[product.produit]['TVA'];

                worksheet.getCell('G' + (lineset.line + j + 1).toString()).value = relevant[product.produit]['COM. PRINC.'];

                worksheet.getCell('H' + (lineset.line + j + 1).toString()).value = relevant[product.produit]['AUTRE COM.'];

                worksheet.getCell('I' + (lineset.line + j + 1).toString()).value = relevant[product.produit]['TOT. COM TTC'];
                worksheet.getCell('J' + (lineset.line + j + 1).toString()).value = relevant[product.produit]['TOT. COM HT'];

                worksheet.getCell('K' + (lineset.line + j + 1).toString()).value = relevant[product.produit]['REV./TR'];
                worksheet.getCell('L' + (lineset.line + j + 1).toString()).value = relevant[product.produit]['TX/RENT.'];
            } else {
                titles.forEach((title, m) => {
                    if (m > 1) {
                        worksheet.getCell(title + (lineset.line + j + 1).toString()).value = 0;
                    }
                });
            }

        });

        titles.forEach((title, k) => {
            if (k === 1) {
                worksheet.getCell(title + (lineset.line + products[index].length + 1).toString()).value = {
                    'richText': [
                        { 'font': { 'bold': true, 'size': 12, 'color': { 'theme': 1 }, 'name': 'Calibri', 'family': 2, 'scheme': 'minor' }, 'text': 'TOTAL ' + greylines[index].partner }
                    ]
                };
            } else if (k > 1) {
                if (k === 9) {
                    worksheet.getCell(title + (lineset.line + products[index].length + 1).toString()).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: '98FB98' },
                        bgColor: { argb: '98FB98' }
                    };
                }
                worksheet.getCell(title + (lineset.line + products[index].length + 1).toString()).value = {
                    formula: `SUBTOTAL(109, ${title + (lineset.line + 1).toString()}:${title + (lineset.line + products[index].length).toString()})`,
                    date1904: false
                };
                worksheet.getCell(title + (lineset.line + products[index].length + 1).toString()).alignment = { vertical: 'middle', horizontal: 'center' };
            }
        });

        worksheet.getRow(lineset.line + products[index].length + 2).height = 10;

        titles.forEach((column) => {
            worksheet.getCell(column + lineset.line).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFA500' },
                bgColor: { argb: 'FFA500' }
            };
            worksheet.getCell(column + (lineset.line - 1).toString()).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'A9A9A9' },
                bgColor: { argb: 'A9A9A9' }
            };
        });
    });


    // ------------------

    titles.forEach((title, k) => {
        worksheet.getCell(title + '63').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'A9A9A9' },
            bgColor: { argb: 'A9A9A9' }
        };
        worksheet.getCell(title + '64').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFA500' },
            bgColor: { argb: 'FFA500' }
        };
        if (k === 1) {
            worksheet.getCell(title + '64').value = {
                'richText': [
                    { 'font': { 'bold': true, 'size': 12, 'color': { 'theme': 1 }, 'name': 'Calibri', 'family': 2, 'scheme': 'minor' }, 'text': 'GLOBAL ' }
                ]
            };
        } else if (k > 1) {
            if (k === 9) {
                worksheet.getCell(title + '64').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '228B22' },
                    bgColor: { argb: '228B22' }
                };
            }
            worksheet.getCell(title + '64').value = {
                formula: `SUBTOTAL(109, ${title + '5:' + title + '62'})`,
                date1904: false
            };
            worksheet.getCell(title + '64').alignment = { vertical: 'middle', horizontal: 'center' };
        }

        worksheet.getCell(title + '64').border = {
            top: { style: 'double' },
            left: { style: 'double' },
            bottom: { style: 'double' },
            right: { style: 'double' }
        };
        worksheet.getCell(title + '64').alignment = { vertical: 'middle', horizontal: 'center' };
    });

    worksheet.getRow(3).height = 10;

    return workbook;
}
