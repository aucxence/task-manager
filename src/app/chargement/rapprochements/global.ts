import * as Excel from 'exceljs';
import { rapprocherMG, mgXLS } from '../rapprochements/moneygram';
import { rapprocherWU, wuXLS } from '../rapprochements/western union';
import { rapprocherRIA, riaXLS } from '../rapprochements/ria';
import { rapprocherFT, ftXLS } from '../rapprochements/flash transfer';
import { rapprocherRT, rtXLS } from '../rapprochements/rapid transfer';
import { rapprocherOM, omXLS } from '../rapprochements/orange money';
import { rapprocherMOMO, momoXLS } from '../rapprochements/mtn_momo';
import { rapprocherSMOBPAY, smobpayXLS } from '../rapprochements/smobil_pay';
import { rapprocherDHL } from './dhl';
import { rapprocherSW } from './small world';

export function rapprocherGlobal(source: any[], types: Set<any>, workbook: Excel.Workbook, cashitdata: any[]) {

    const result = {
        ft: {},
        mg: {},
        mtn: {},
        om: {},
        rt: {},
        ria: {},
        spy: {},
        ewu: {},
        rwu: {},
        dhl: {},
        esw: {},
        rsw: {}
    };

    if (types.has('FLASH TRANSFER')) {

        const ft = cashitdata.filter((e) => ['SENT_FT', 'RECEIVED_FT'].indexOf(e['TFST']) > -1);

        const tmft = source.filter((e) => e['type'] === 'FLASH TRANSFER');

        console.log(ft);
        console.log(tmft);

        const ftrapproch = rapprocherFT(tmft, ft, 'NO REF', 'RFNB', 'MONTANT', 'SDAMINSDCU',
            'FRAIS ', 'SDFETTCINSDCU', 10, 25);

        ftrapproch['source'] = tmft;
        ftrapproch['cashit'] = ft;

        result.ft = ftrapproch;

        // workbook = ftXLS(ftrapproch, workbook,
        //     ['DATE', 'TYPE', 'NO REF', 'MONTANT', 'FRAIS '],
        //     ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], tmft, ft);
    }
    if (types.has('MONEYGRAM')) {

        const mg = cashitdata.filter((e) => ['SENT_MG', 'RECEIVED_MG'].indexOf(e['TFST']) > -1);

        const tmmg = source.filter((e) => e['type'] === 'MONEYGRAM');

        const mgrapproch = rapprocherMG(tmmg, mg, 'Reference ID', 'RFNB', 'Base Amt', 'SDAMINSDCU', 'Fee Amt', 'SDFETTCINSDCU', 5, 25);

        mgrapproch['source'] = tmmg;
        mgrapproch['cashit'] = mg;

        result.mg = mgrapproch;

        console.log(mgrapproch);
        // workbook = mgXLS(mgrapproch, workbook,
        //     ['Tran Date', 'Tran Type', 'Reference ID', 'Base Amt', 'Fee Amt'],
        //     ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], tmmg, mg);
    }
    if (types.has('MTN MOBILE MONEY')) {

        const mtn = cashitdata.filter((e) => ['RECH_MOMO', 'RECEIVE_MOMO'].indexOf(e['TFST']) > -1);

        const tmmtn = source.filter((e) => e['type'] === 'MTN MOBILE MONEY');

        const mtnrapproch = rapprocherMOMO(tmmtn, mtn);

        mtnrapproch['source'] = tmmtn;
        mtnrapproch['cashit'] = mtn;

        result.mtn = mtnrapproch;

        console.log(mtnrapproch);
        // workbook = momoXLS(mtnrapproch, workbook,
        //     ['Date', 'TYPE', 'De', 'Ã ', 'Montant'],
        //     ['RFNB', 'TFST', 'simphoneFils', 'tel', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'], tmmtn, mtn);
    }
    if (types.has('ORANGE MONEY')) {

        const om = cashitdata.filter((e) => ['RECH_OGMO', 'RECEIVE_OGMO'].indexOf(e['TFST']) > -1);

        const tmom = source.filter((e) => e['type'] === 'ORANGE MONEY');

        const omrapproch = rapprocherOM(tmom, om);

        omrapproch['source'] = tmom;
        omrapproch['cashit'] = om;

        result.om = omrapproch;

        // console.log(omrapproch);
        // workbook = omXLS(omrapproch, workbook,
        //     ['Date', 'Service', 'Compte1', 'Compte2', 'Credit', 'Debit'],
        //     ['RFNB', 'TFST', 'simphoneFils', 'tel', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'], tmom, om);
    }
    if (types.has('RAPID TRANSFER')) {

        const rt = cashitdata.filter((e) => ['SENT_RT', 'RECEIVED_RT'].indexOf(e['TFST']) > -1);

        const tmrt = source.filter((e) => e['type'] === 'RAPID TRANSFER');

        const rtrapproch = rapprocherRT(tmrt, rt, 'RT Number', 'RFNB', 'Send Amount', 'SDAMINSDCU', 'Receiving Amount',
            'Total Fee', 'SDFETTCINSDCU', 10, 25);

        rtrapproch['source'] = tmrt;
        rtrapproch['cashit'] = rt;

        result.rt = rtrapproch;

        // workbook = rtXLS(rtrapproch, workbook,
        //     ['Payment Date', 'Transaction Status', 'RT Number', 'Send Amount', 'Receiving Amount', 'Total Fee'],
        //     ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], tmrt, rt);
    }
    if (types.has('RIA')) {

        const ria = cashitdata.filter((e) => ['SENT_RIA', 'RECEIVED_RIA'].indexOf(e['TFST']) > -1);

        const tmria = source.filter((e) => e['type'] === 'RIA');

        const riarapproch = rapprocherRIA(tmria, ria, 'PIN', 'RFNB', 'Sent Amount', 'SDAMINSDCU', 'Payment Amount',
            'CTE',
            'Customer Fee', 'SDFETTCINSDCU', 10, 25);

        riarapproch['source'] = tmria;
        riarapproch['cashit'] = ria;

        result.ria = riarapproch;

        // workbook = riaXLS(riarapproch, workbook,
        //     ['Date', 'Action', 'PIN', 'Sent Amount', 'Payment Amount', 'Customer Fee', 'CTE', 'TVA1'],
        //     ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], tmria, ria);
    }
    if (types.has('SMOBILPAY')) {

        const spy = cashitdata.filter((e) => ['CDE', 'CANAL', 'ENEO', 'RECHARGE'].indexOf(e['TFST']) > -1);

        const tmspy = source.filter((e) => e['type'] === 'SMOBILPAY');

        const spyrapproch = rapprocherSMOBPAY(tmspy, spy);

        spyrapproch['source'] = tmspy;
        spyrapproch['cashit'] = spy;

        result.spy = spyrapproch;

        // workbook = smobpayXLS(spyrapproch, workbook,
        //     ['Paid At', 'Service', 'Branch', 'Amount'],
        //     ['numtransaction', 'TFST', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'], tmspy, spy);
    }
    if (types.has('ENVOIS WESTERN UNION')) {

        const ewu = cashitdata.filter((e) => ['SENT_WU', 'ANNULATED_WU', 'REMBOURS_WU'].indexOf(e['TFST']) > -1);

        const tmewu = source.filter((e) => e['type'] === 'ENVOIS WESTERN UNION');

        const ewurapproch = rapprocherWU(tmewu, ewu, 'MTCN', 'RFNB', 'principal', 'SDAMINSDCU', 'charges', 'SDFETTCINSDCU', 10, 25);

        ewurapproch['source'] = tmewu;
        ewurapproch['cashit'] = ewu;

        result.ewu = ewurapproch;

        // workbook = wuXLS(ewurapproch, workbook,
        //     ['Date', 'TYPE', 'MTCN', 'principal', 'charges'],
        //     ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], tmewu, ewu);
    }
    if (types.has('RETRAITS WESTERN UNION')) {

        const rwu = cashitdata.filter((e) => e['TFST'] === 'RECEIVED_WU');

        const tmrwu = source.filter((e) => e['type'] === 'RETRAITS WESTERN UNION');

        const rwurapproch = rapprocherWU(tmrwu, rwu, 'MTCN', 'RFNB', 'principal', 'SDAMINSDCU', 'charges', 'SDFETTCINSDCU', 10, 25);

        rwurapproch['source'] = tmrwu;
        rwurapproch['cashit'] = rwu;

        result.rwu = rwurapproch;

        // workbook = wuXLS(rwurapproch, workbook,
        //     ['Date', 'TYPE', 'MTCN', 'principal', 'charges'],
        //     ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], tmrwu, rwu);
    }
    if (types.has('DHL')) {
        // this.workbook = loadRWUFiles(this.rwumerge, this.workbook, 'Retrait Western Union');
        const dhl = cashitdata.filter((e) => e['TFST'] === 'DHL');

        const tmdhl = source.filter((e) => e['type'] === 'DHL');

        const dhlrapproch = rapprocherDHL(tmdhl, dhl, 'identifiant', 'RFNB', 'charges', 'SDFETTCINSDCU', 25);

        dhlrapproch['source'] = tmdhl;
        dhlrapproch['cashit'] = dhl;

        result.dhl = dhlrapproch;
    }
    if (types.has('ENVOIS SMALL WORLD')) {

        const esw = cashitdata.filter((e) => ['SENT_SW', 'ANNULATED_SW', 'REMBOURS_SW'].indexOf(e['TFST']) > -1);

        const tmesw = source.filter((e) => e['type'] === 'ENVOIS SMALL WORLD');

        const eswrapproch = rapprocherSW(tmesw, esw, 'MTCN', 'RFNB', 'principal', 'SDAMINSDCU', 'charges', 'SDFETTCINSDCU', 10, 25);

        eswrapproch['source'] = tmesw;
        eswrapproch['cashit'] = esw;

        result.esw = eswrapproch;

        // workbook = wuXLS(ewurapproch, workbook,
        //     ['Date', 'TYPE', 'MTCN', 'principal', 'charges'],
        //     ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], tmewu, ewu);
    }
    if (types.has('RETRAITS SMALL WORLD')) {

        const rsw = cashitdata.filter((e) => e['TFST'] === 'RECEIVED_SW');

        const tmrsw = source.filter((e) => e['type'] === 'RETRAITS SMALL WORLD');

        const rswrapproch = rapprocherSW(tmrsw, rsw, 'MTCN', 'RFNB', 'principal', 'SDAMINSDCU', 'charges', 'SDFETTCINSDCU', 10, 25);

        rswrapproch['source'] = tmrsw;
        rswrapproch['cashit'] = rsw;

        result.rsw = rswrapproch;

        // workbook = wuXLS(rwurapproch, workbook,
        //     ['Date', 'TYPE', 'MTCN', 'principal', 'charges'],
        //     ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], tmrwu, rwu);
    }

    return result;

}
