import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';

export function rapprocherSW(t1, t2, id1, id2, nml1, nml2, fttc1, fttc2, tolnml, tolfttc) {

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

      let mgfees = Math.abs(+map1[prop][fttc1]);
      if (map1[prop]['code'] === 'RSW') { mgfees = 0; }

      if (Math.abs(+map1[prop][nml1]) === Math.abs(map2[prop][nml2])) {
        // console.log('Frais: ' + Math.abs(+map1[prop][fttc1]) + ' = ' + Math.abs(map2[prop][fttc2]));

        if (mgfees === Math.abs(map2[prop][fttc2])) {

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
        } else if ((mgfees - Math.abs(map2[prop][fttc2])) < tolfttc) {
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
          map1[prop]['suspens'] = true;
          map1[prop]['difference'] = (mgfees - Math.abs(map2[prop][fttc2]));
          map1[prop]['comment'] = 'Erreur sur les frais';

          map2[prop]['suspens'] = true;
          map2[prop]['difference'] = (mgfees - Math.abs(map2[prop][fttc2]));
          map2[prop]['comment'] = 'Erreur sur les frais';

          errored_match.push({
            'partenaire': map1[prop],
            'cashit': map2[prop]
          });

          delete map1[prop];
          delete map2[prop];
        }
      } else if (Math.abs(Math.abs(+map1[prop][nml1]) - Math.abs(map2[prop][nml2])) < tolnml) {

        map1[prop]['comment'] = 'Différence négligeable Nominal';
        map2[prop]['comment'] = 'Différence négligeable Nominal';

        map1[prop]['difference'] = Math.abs(Math.abs(+map1[prop][nml1]) - Math.abs(map2[prop][nml2]));
        map2[prop]['difference'] = Math.abs(Math.abs(+map1[prop][nml1]) - Math.abs(map2[prop][nml2]));

        if (mgfees === Math.abs(map2[prop][fttc2])) {
          map1[prop]['suspens'] = false;
          map2[prop]['suspens'] = false;

          exact_match.push({
            'partenaire': map1[prop],
            'cashit': map2[prop]
          });

          delete map1[prop];
          delete map2[prop];
        } else if (Math.abs(mgfees - Math.abs(map2[prop][fttc2])) < tolfttc) {
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
          map1[prop]['suspens'] = true;
          map1[prop]['comment'] = 'Erreur sur les frais';
          map2[prop]['suspens'] = true;
          map2[prop]['comment'] = 'Erreur sur les frais';

          map1[prop]['difference'] = Math.abs(mgfees - Math.abs(map2[prop][fttc2]));
          map2[prop]['difference'] = Math.abs(mgfees - Math.abs(map2[prop][fttc2]));

          errored_match.push({
            'partenaire': map1[prop],
            'cashit': map2[prop]
          })

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

export function swXLS(result: any, workbook: Excel.Workbook, partnerheaders: string[], cashitheaders: string[],
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

    const worksheet1 = workbook.addWorksheet('Bons enregistrements MoneyGram ');
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

    const worksheet1 = workbook.addWorksheet('Suspends MG Montant');
    worksheet1.columns = headers;
    worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
    worksheet1.addRows(inexactmatch);
  }

  if (result.suspens1.length > 0 || result.suspens2.length > 0) {

    const worksheet1 = workbook.addWorksheet('Suspens MG Référence');
    worksheet1.columns = headers;
    worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
    worksheet1.addRows(result.suspens1);
    worksheet1.addRows(result.suspens2);
  }

  console.log(partnerdata);

  if (partnerdata.length > 0) {
    const worksheet1 = workbook.addWorksheet('Données MG Partenaires');
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
    const worksheet1 = workbook.addWorksheet('Données MG Cash-IT');
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
