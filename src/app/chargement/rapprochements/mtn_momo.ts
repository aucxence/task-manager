import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';

export function rapprocherMOMO(t1: any[], t2) {



  const map1 = {};
  const map2 = {};

  const dpct1 = {};
  const dpct2 = {};

  t1.filter((e) => ['Encaisser', 'DÃ©caissÃ©', 'Transfert Ã  partir de code de retrait'].indexOf(e['TYPE']) > -1).forEach((el) => {

    const ref = el['TYPE'] === 'Encaisser' ?
      el['TYPE']
      + el['De'].split(':')[1].split('/')[0].substring(3)
      + el['Ã '].split(':')[1].split('/')[0].substring(3)
      + el['Montant'].toString()
      :
      el['TYPE'] === 'Transfert Ã  partir de code de retrait' ? 
        'DÃ©caissÃ©'
      + el['Ã '].split(':')[1].split('/')[0].substring(3)
      + el['De'].split(':')[1].split('/')[0].substring(3)
      + el['Montant'].toString()
      : el['TYPE']
      + el['Ã '].split(':')[1].split('/')[0].substring(3)
      + el['De'].split(':')[1].split('/')[0].substring(3)
      + el['Montant'].toString();

    if (map1[ref] === undefined) {
      map1[ref] = el;
    } else {
      if (dpct1[ref] === undefined) {
        dpct1[ref] = [];
      }
      dpct1[ref].push(el);
    }
  });

  t2.forEach((el) => {
    const ref = (el['TFST'] === 'RECH_MOMO' ? 'Encaisser' : 'DÃ©caissÃ©') + el['simphoneFils'] + el['tel'].replace(/\s/g, '') + el['SDAMINSDCU'];
    if (map2[ref] === undefined) {
      map2[ref] = el;
    } else {
      if (dpct2[ref] === undefined) {
        dpct2[ref] = [];
      }
      dpct2[ref].push(el);
    }
  });

  // console.log(map1);
  // console.log(map2);

  const exact_match = [];
  const errored_match = [];

  for (const prop in map1) {
    if (map2[prop] !== undefined) {

      map1[prop]['suspens'] = false;
      map1[prop]['comment'] = 'R.A.S';
      map2[prop]['suspens'] = false;
      map2[prop]['comment'] = 'R.A.S';

      exact_match.push({
        'partenaire': map1[prop],
        'cashit': map2[prop]
      });

      delete map1[prop];
      delete map2[prop];
    } else if (dpct2[prop] !== undefined) {
      map1[prop]['suspens'] = false;
      map1[prop]['comment'] = 'R.A.S';
      dpct2[prop][0]['suspens'] = false;
      dpct2[prop][0]['comment'] = 'R.A.S';

      exact_match.push({
        'partenaire': map1[prop],
        'cashit': dpct2[prop][0]
      });

      delete map1[prop];
      dpct2[prop].splice(0, 1);

      if (dpct2[prop].length === 0) {
        delete dpct2[prop];
      }
    } else {
      map1[prop]['suspens'] = true;
      map1[prop]['comment'] = 'Equivalent Cash-IT non trouvé - Problème de référence';
    }
  }



  // tslint:disable-next-line: forin
  for (const prop in dpct1) {

    const replacement = dpct1[prop].length;
    for (let j = 0; j < replacement; j++) {
      if (map2[prop] !== undefined) {

        dpct1[prop][0]['suspens'] = false;
        dpct1[prop][0]['comment'] = 'R.A.S';
        map2[prop]['suspens'] = false;
        map2[prop]['comment'] = 'R.A.S';

        exact_match.push({
          'partenaire': dpct1[prop][0],
          'cashit': map2[prop]
        });

        dpct1[prop].splice(0, 1);
        delete map2[prop];

        if (dpct1[prop].length === 0) {
          delete dpct1[prop];
        }
      } else if (dpct2[prop] !== undefined) {
        dpct1[prop][0]['suspens'] = false;
        dpct1[prop][0]['comment'] = 'R.A.S';
        dpct2[prop][0]['suspens'] = false;
        dpct2[prop][0]['comment'] = 'R.A.S';

        exact_match.push({
          'partenaire': dpct1[prop][0],
          'cashit': dpct2[prop][0]
        });

        dpct1[prop].splice(0, 1);
        if (dpct1[prop].length === 0) {
          delete dpct1[prop];
        }

        dpct2[prop].splice(0, 1);
        if (dpct2[prop].length === 0) {
          delete dpct2[prop];
        }
      } else {
        dpct1[prop][j]['suspens'] = true;
        dpct1[prop][j]['comment'] = 'Equivalent Cash-IT non trouvé - Problème de référence';
      }
    }
  }

  const suspens1 = { ...map1 };
  const suspens2 = { ...map2 };

  for (const prop in suspens2) {
    suspens2[prop]['suspens'] = true;
    suspens2[prop]['comment'] = 'Equivalent partenaire non trouvé - Problème de référence';
  }

  const sdp1 = { ...dpct1 };
  const sdp2 = { ...dpct2 };

  for (const prop in sdp2) {
    for (let k = 0; k < sdp2[prop].length; k++) {
      sdp2[prop][k]['suspens'] = true;
      sdp2[prop][k]['comment'] = 'Equivalent partenaire non trouvé - Problème de référence';
    }
  }

  const s11 = Object.keys(suspens1).map((e) => suspens1[e]);
  let s12 = [];
  Object.keys(sdp1).map((e) => sdp1[e]).forEach((e) => {
    if (e.length > 0) {
      s12 = [...s12, ...e];
    }
  });



  const s21 = Object.keys(suspens2).map((e) => suspens2[e]);
  let s22 = [];
  Object.keys(sdp2).map((e) => sdp2[e]).forEach((e) => {
    if (e.length > 0) {
      s22 = [...s22, ...e];
    }
  });

  const ss1 = [...s11, ...s12].sort((x, y) => {
    if (x['Montant'] < y['Montant']) {
      return 1;
    } else {
      return -1;
    }
  });

  const ss2 = [...s21, ...s22].sort((x, y) => {
    if (x['SDAMINSDCU'] < y['SDAMINSDCU']) {
      return 1;
    } else {
      return -1;
    }
  });

  const result = {
    match: exact_match,
    inexactmatch: errored_match,
    suspens1: ss1,
    suspens2: ss2
  };

  console.log(exact_match.length);
  console.log(result.suspens1.length);
  console.log(result.suspens2.length);

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

    const worksheet1 = workbook.addWorksheet('Bons enregistrements MOMO');
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

    const worksheet1 = workbook.addWorksheet('Suspends MOMO Montant');
    worksheet1.columns = headers;
    worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
    worksheet1.addRows(inexactmatch);
  }

  if (result.suspens1.length > 0 || result.suspens2.length > 0) {

    const worksheet1 = workbook.addWorksheet('Suspens MOMO');
    worksheet1.columns = headers;
    worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
    worksheet1.addRows(result.suspens1);
    worksheet1.addRows(result.suspens2);
  }

  // console.log(partnerdata);

  if (partnerdata.length > 0) {
    const worksheet1 = workbook.addWorksheet('Données MOMO Partenaires');
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
    const worksheet1 = workbook.addWorksheet('Données MOMO Cash-IT');
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
