import * as Excel from 'exceljs';
import { mgXLS } from '../rapprochements/moneygram';
import { wuXLS } from '../rapprochements/western union';
import { riaXLS } from '../rapprochements/ria';
import { ftXLS } from '../rapprochements/flash transfer';
import { rtXLS } from '../rapprochements/rapid transfer';
import { omXLS } from '../rapprochements/orange money';
import { momoXLS } from '../rapprochements/mtn_momo';
import { smobpayXLS } from '../rapprochements/smobil_pay';
import { dhlXLS } from '../rapprochements/dhl';

export function printRapprochement(relevant: {
    ft: {};
    mg: {};
    mtn: {};
    om: {};
    rt: {};
    ria: {};
    spy: {};
    ewu: {};
    rwu: {};
    dhl: {};
    esw: {};
    rsw: {};
}) {
    let workbook: Excel.Workbook = getSynthese(relevant);
    workbook = getOtherSheets(relevant, workbook);

    return workbook;
}

function getSynthese(relevant: {
    ft: {};
    mg: {};
    mtn: {};
    om: {};
    rt: {};
    ria: {};
    spy: {};
    ewu: {};
    rwu: {};
}) {
    const workbook = new Excel.Workbook();

    const worksheet = workbook.addWorksheet('Stats hebdo', { properties: { tabColor: { argb: 'FFC0000' } } });

    worksheet.mergeCells('A1:I1');

    const labels = [
        { header: 'POS', width: 6.09 },
        { header: 'PRODUIT', width: 25.89 },
        { header: 'NBR PARTNER', width: 19.64 },
        { header: 'NBR CASHIT', width: 25.89 },
        { header: 'SUSPENS MONTANT', width: 25.89 },
        { header: 'SUSPENS PARTNER', width: 25.89 },
        { header: 'SUSPENS CASHIT.', width: 25.89 },
        { header: 'DIFFERENCE', width: 10.09 },
        { header: 'ERREUR', width: 10.09 },
    ];

    worksheet.columns = labels;

    const titles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

    const greylines = [
        { line: 4, partner: 'MONEYGRAM', abbrev: 'mg' },
        { line: 6, partner: 'FLASH TRANSFER', abbrev: 'ft' },
        { line: 8, partner: 'ENVOIS WESTERN UNION', abbrev: 'ewu' },
        { line: 10, partner: 'RETRAITS WESTERN UNION', abbrev: 'rwu' },
        { line: 12, partner: 'RAPID TRANSFER', abbrev: 'rt' },
        { line: 14, partner: 'RIA', abbrev: 'ria' },
        { line: 16, partner: 'ORANGE MONEY', abbrev: 'om' },
        { line: 18, partner: 'MTN MOMO', abbrev: 'mtn' },
        { line: 20, partner: 'SMOBILPAY', abbrev: 'spy' },
        { line: 22, partner: 'DHL', abbrev: 'dhl' }];

    labels.forEach((label, index) => {
        worksheet.getCell(titles[index] + '2').value = label.header;
    });

    worksheet.getCell('A1').value = 'SYNTHESE DES RAPPROCHEMENTS';
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    for (let j = 1; j <= 10; j++) {
        worksheet.getColumn(j).numFmt = '#,##0;[Red]-(#,##0);"0";_(@_)';
    }

    titles.forEach((title) => {
        for (let k = 1; k <= 22; k++) {
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

        console.log(relevant[lineset.abbrev]);

        worksheet.getCell('C' + lineset.line.toString()).value = (relevant[lineset.abbrev]['source'] !== undefined) ?
            relevant[lineset.abbrev]['inexactmatch'].length
            + relevant[lineset.abbrev]['match'].length
            + relevant[lineset.abbrev]['suspens1'].length : '';

        worksheet.getCell('D' + lineset.line.toString()).value = (relevant[lineset.abbrev]['source'] !== undefined) ?
            relevant[lineset.abbrev]['inexactmatch'].length
            + relevant[lineset.abbrev]['match'].length
            + relevant[lineset.abbrev]['suspens2'].length : '';

        worksheet.getCell('E' + lineset.line.toString()).value = (relevant[lineset.abbrev]['source'] !== undefined) ?
            relevant[lineset.abbrev]['inexactmatch'].length : '';

        worksheet.getCell('F' + lineset.line.toString()).value = (relevant[lineset.abbrev]['source'] !== undefined) ?
            relevant[lineset.abbrev]['suspens1'].length : '';

        worksheet.getCell('G' + lineset.line.toString()).value = (relevant[lineset.abbrev]['source'] !== undefined) ?
            relevant[lineset.abbrev]['suspens2'].length : '';

        worksheet.getCell('H' + lineset.line.toString()).value = (relevant[lineset.abbrev]['source'] !== undefined) ?
            relevant[lineset.abbrev]['suspens1'].length
            - relevant[lineset.abbrev]['suspens2'].length : '';

        worksheet.getCell('I' + lineset.line.toString()).value = (relevant[lineset.abbrev]['source'] !== undefined) ?
            ((relevant[lineset.abbrev]['suspens1'].length
                - relevant[lineset.abbrev]['suspens2'].length) * 100
                / ((relevant[lineset.abbrev]['inexactmatch'].length
                    + relevant[lineset.abbrev]['match'].length
                    + relevant[lineset.abbrev]['suspens2'].length !== 0) ?
                    relevant[lineset.abbrev]['inexactmatch'].length
                    + relevant[lineset.abbrev]['match'].length
                    + relevant[lineset.abbrev]['suspens2'].length : 1)).toString().slice(0, 3) + '%' : '';

        worksheet.getRow(lineset.line + 1).height = 5;

        titles.forEach((column) => {
            worksheet.getCell(column + (lineset.line - 1).toString()).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'A9A9A9' },
                bgColor: { argb: 'A9A9A9' }
            };
        });
    });

    titles.forEach((title, k) => {
        if (k === 1) {
            worksheet.getCell(title + '24').value = 'GLOBAL';
        } else if (k > 1 && k < 7) {
            worksheet.getCell(title + '24').value = {
                formula: `SUBTOTAL(109, ${title + '4'}:${title + '22'})`,
                date1904: false
            };
        } else if (k === 7) {
            worksheet.getCell(title + '24').value = {
                formula: `C24-D24`,
                date1904: false
            };
        } else if (k === 8) {
            worksheet.getCell(title + '24').value = {
                formula: `(C24-D24)/C24`,
                date1904: false
            };
            worksheet.getCell(title + '24').numFmt = '0.00%';
        }
        worksheet.getCell(title + '24').border = {
            top: { style: 'double' },
            left: { style: 'double' },
            bottom: { style: 'double' },
            right: { style: 'double' }
        };
        worksheet.getCell(title + '24').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFA500' },
            bgColor: { argb: 'FFA500' }
        };
    });

    worksheet.getRow(3).height = 5;

    return workbook;
}

function getOtherSheets(relevant: {
    ft: {};
    mg: {};
    mtn: {};
    om: {};
    rt: {};
    ria: {};
    spy: {};
    ewu: {};
    rwu: {};
    dhl: {};
    esw: {};
    rsw: {};
}, wbk) {
    let workbook = wbk;

    if (relevant.ft['source'] !== undefined) {

        workbook = ftXLS(relevant.ft, workbook,
            ['Date', 'TYPE', 'NO REF', 'MONTANT', 'FRAIS ', 'HTComm'],
              ['INIDA', 'RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'],
            relevant.ft['source'], relevant.ft['cashit']);
    }
    if (relevant.mg['source'] !== undefined) {

        workbook = mgXLS(relevant.mg, workbook,
            ['Date', 'Tran Type', 'Reference ID', 'Base Amt', 'Fee Amt', 'HTComm'],
              ['INIDA', 'RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'],
            relevant.mg['source'], relevant.mg['cashit']);
    }
    if (relevant.mtn['source'] !== undefined) {

        workbook = momoXLS(relevant.mtn, workbook,
            ['Date', 'TYPE', 'De', 'Ã ', 'Montant', 'HTComm'],
              ['INIDA', 'RFNB', 'TFST', 'simphoneFils', 'tel', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'],
            relevant.mtn['source'], relevant.mtn['cashit']);
    }
    if (relevant.om['source'] !== undefined) {

        workbook = omXLS(relevant.om, workbook,
            ['Date', 'Service', 'Compte1', 'Compte2', 'Credit', 'Debit', 'HTComm'],
              ['INIDA', 'RFNB', 'TFST', 'simphoneFils', 'tel', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'],
            relevant.om['source'], relevant.om['cashit']);
    }
    if (relevant.rt['source'] !== undefined) {

        workbook = rtXLS(relevant.rt, workbook,
            ['Date', 'Transaction Status', 'RT Number', 'Send Amount', 'Receiving Amount', 'Total Fee', 'HTComm'],
              ['INIDA', 'RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'],
            relevant.rt['source'], relevant.rt['cashit']);
    }
    if (relevant.ria['source'] !== undefined) {

        workbook = riaXLS(relevant.ria, workbook,
            ['Date', 'Action', 'PIN', 'Sent Amount', 'Payment Amount', 'Customer Fee', 'CTE', 'TVA1', 'HTComm'],
              ['INIDA', 'RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'],
            relevant.ria['source'], relevant.ria['cashit']);
    }
    if (relevant.spy['source'] !== undefined) {

        workbook = smobpayXLS(relevant.spy, workbook,
            ['Date', 'Service', 'Branch', 'Amount', 'HTComm'],
              ['INIDA', 'numtransaction', 'TFST', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'],
            relevant.spy['source'], relevant.spy['cashit']);
    }
    if (relevant.ewu['source'] !== undefined) {

        workbook = wuXLS(relevant.ewu, workbook,
            ['Date', 'TYPE', 'MTCN', 'principal', 'charges', 'HTComm'],
              ['INIDA', 'RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'],
            relevant.ewu['source'], relevant.ewu['cashit']);
    }
    if (relevant.rwu['source'] !== undefined) {

        workbook = wuXLS(relevant.rwu, workbook,
            ['Date', 'TYPE', 'MTCN', 'principal', 'charges', 'HTComm'],
              ['INIDA', 'RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'],
            relevant.rwu['source'], relevant.rwu['cashit']);
    }
    if (relevant.dhl['source'] !== undefined) {

        workbook = dhlXLS(relevant.dhl, workbook,
            ['Date', 'identifiant', 'sender', 'receiver', 'paysdesti', 'teldesti', 'charges', 'HTComm'],
              ['INIDA', 'RFNB', 'TFST', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'],
            relevant.dhl['source'], relevant.dhl['cashit']);
    }
    if (relevant.esw['source'] !== undefined) {

        workbook = dhlXLS(relevant.esw, workbook,
            ['Date', 'code', 'MTN', 'Montant principal d\'Envoi', 'Fee', 'HTComm'],
              ['INIDA', 'RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'],
            relevant.esw['source'], relevant.esw['cashit']);
    }
    if (relevant.rsw['source'] !== undefined) {

        workbook = dhlXLS(relevant.rsw, workbook,
            ['Date', 'code', 'MTN', 'Montant de paiement', 'Opérateur', 'HTComm'],
              ['INIDA', 'RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'],
            relevant.rsw['source'], relevant.rsw['cashit']);
    }

    return workbook;
}
