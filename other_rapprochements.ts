const source = [
  {
    "type": "ORANGE MONEY",
    "N": "654",
    "Date": "2020-10-16T01:00:00.000Z",
    "Heure": "15:22:26",
    "Reference": "CI201016.1522.A65237",
    "Service": "Cash in",
    "Agence": "KYE OSSI MUFFA",
    "Statut": "Succès",
    "Mode": "USSD",
    "Compte1": "695591891",
    "Wallet1": "Normal",
    "Compte2": "696164291",
    "Wallet2": "Normal",
    "Debit": 40000,
    "Sous-distributeur": 0,
    "Super-distributeur": 120,
    "HTComm": 100.62893081761007,
    "TVA": 19.371069182389938,
    "timestamp": "2020-10-21T12:40:18.749Z",
    "loadby": "OStjXWtc6BgSHB3f2VyzFthudv63",
    "loadbyName": "Aucxence MBIA",
    "filename": "RAPPORT OM IT DU 16 OCTOBRE 2020.xls",
    "Credit": 0,
    "code": "DOM",
    "suspens": true,
    "comment": "Equivalent Cash-IT non trouvé - Problème de référence"
  },
  {
    "type": "ORANGE MONEY",
    "N": "657",
    "Date": "2020-10-16T01:00:00.000Z",
    "Heure": "17:05:49",
    "Reference": "CI201016.1705.A81209",
    "Service": "Cash in",
    "Agence": "KYE OSSI MUFFA",
    "Statut": "Succès",
    "Mode": "USSD",
    "Compte1": "695591891",
    "Wallet1": "Normal",
    "Compte2": "696164291",
    "Wallet2": "Normal",
    "Debit": 40000,
    "Sous-distributeur": 0,
    "Super-distributeur": 120,
    "HTComm": 100.62893081761007,
    "TVA": 19.371069182389938,
    "timestamp": "2020-10-21T12:40:18.756Z",
    "loadby": "OStjXWtc6BgSHB3f2VyzFthudv63",
    "loadbyName": "Aucxence MBIA",
    "filename": "RAPPORT OM IT DU 16 OCTOBRE 2020.xls",
    "Credit": 0,
    "code": "DOM",
    "suspens": true,
    "comment": "Equivalent Cash-IT non trouvé - Problème de référence"
  }
];

const cashit = [
  {
    "id": "095b1efc-4e30-4a0c-a810-13b045fe129d",
    "COMM": 0,
    "COMHTBANK": 0,
    "COMHTMASTER": 0,
    "COMHTTRF": 0,
    "COMTTCBANK": 0,
    "COMTTCMASTER": 0,
    "COMTTCTRF": 0,
    "SDAMINSDCU": 40000,
    "SDAMREIMBOU": 0,
    "SDFEHTINSDCU": 0,
    "SDFETTCINSDCU": 0,
    "TAUXCHANG": 0,
    "TAUXCOM": 0,
    "TTAMPAINSDCU": 40000,
    "ACCSTS": "OPEN",
    "TFST": "RECH_OGMO",
    "TVA": null,
    "TVACOMM": 0,
    "TVACOMBANK": 0,
    "TVACOMMASTER": 0,
    "TVACOMTRF": 0,
    "B10Mil": 4,
    "B1Mil": 0,
    "B2Mil": 0,
    "B500": 0,
    "B5Mil": 0,
    "caisseID": "AGENT_20200115161258_NDEMROME_OPERATION",
    "BILINIDA": {},
    "P100franc": 0,
    "P10franc": 0,
    "p1franc": 0,
    "p25franc": 0,
    "p2franc": 0,
    "P500Cent": 0,
    "p50franc": 0,
    "p5franc": 0,
    "pointID": "AGENT_20200115161258",
    "Bstatut": "NEW",
    "totalAmount": 40000,
    "RB10Mil": 0,
    "RB1Mil": 0,
    "RB2Mil": 0,
    "RB500": 0,
    "RB5Mil": 0,
    "RP100franc": 0,
    "RP10franc": 0,
    "Rp1franc": 0,
    "Rp25franc": 0,
    "Rp2franc": 0,
    "RP500Cent": 0,
    "Rp50franc": 0,
    "Rp5franc": 0,
    "rtotalAmount": 0,
    "accounting": 0,
    "ANNULAgent": null,
    "ANNULAgentName": null,
    "annulAmount": 0,
    "ANNULDA": null,
    "ANNULUserFullName": null,
    "ANNULUserLogin": null,
    "annulationReason": null,
    "approType": "AUTRE",
    "caisseStatut": "NEW",
    "cityOfResidence": null,
    "coinspwd": null,
    "COMMCEMAC": null,
    "countryOfResidence": null,
    "fees": 0,
    "FINAL_TFST": "OPEN",
    "firstName": null,
    "forcage": 0,
    "idDeliveryDate": null,
    "idDeliveryLocation": null,
    "idExpiryDate": null,
    "idNumber": null,
    "idType": "NIC",
    "INITAG": "AGENT_20200115161258",
    "INITAGN": "MC2 MUFFA KYE-OSSI",
    "INITUSFN": "ROMELI WILFRIDE NDEMI KUMABANG",
    "INITUSLO": "NDEMROME",
    "INIDA": {},
    "isAutorisation": 0,
    "isnotpiece": 1,
    "ispiece": 0,
    "lastName": null,
    "localization": null,
    "modereprint": null,
    "modifyAgent": null,
    "modifyAgentName": null,
    "modifyAmount": 0,
    "modifyDate": null,
    "modifyUserFullName": null,
    "modifyUserLogin": null,
    "montantLettre": null,
    "motif": null,
    "motifAgent": null,
    "motifAuto": null,
    "motifForcage": null,
    "SENTDA": {},
    "SDIPTE": 0,
    "operation": "DEPOT",
    "passationServ": 0,
    "poidskg": null,
    "product": "ORANGE_MOMO",
    "RCCT": "CMR",
    "RCCTN": "CMR",
    "receiverfirstName": null,
    "receiveridNumber": null,
    "receiverlastName": null,
    "receivertel": null,
    "RFNB": "483914509109",
    "RFNBMATCH": null,
    "refpiece": "",
    "rembourAgent": null,
    "rembourAgentName": null,
    "rembourAmount": 0,
    "rembourDate": null,
    "rembourUserFullName": null,
    "rembourUserLogin": null,
    "SDCT": "CMR",
    "SDIAG": "AGENT_20200115161258",
    "SDIAGN": "MC2 MUFFA KYE-OSSI",
    "SDICT": "CMR",
    "SDICTN": "Cameroun",
    "SDICU": "XAF",
    "sendingPrinted": 1,
    "SDIUSFN": "ROMELI WILFRIDE NDEMI KUMABANG",
    "SDIUSLO": "NDEMROME",
    "servicesId": null,
    "servicesName": null,
    "simphone": "695591892",
    "takeFees": 0,
    "tel": "696164291",
    "validate": 0,
    "version": 1,
    "caisseType": "OPERATION",
    "mathcAcc": 0,
    "mathcCaisse": 0,
    "maxAmountTransfer": 0,
    "pointageAcc": 0,
    "pointageCaisse": 0,
    "transferBlackliste": 0,
    "banque": null,
    "operateur": null,
    "origine": null,
    "rib": null,
    "simphoneFils": "695591892",
    "simphoneMere": null,
    "referenceNumberWU": "",
    "sensType": null,
    "soldecaisse": 652900,
    "soldecaissetarget": 652900,
    "numtransaction": "483914509109",
    "receivingAmount": null,
    "receivingCurrency": null,
    "soldepiece": null,
    "soldecaisseFils": 598300,
    "soldecaisseMere": 0,
    "sourceId": null,
    "keynumtransaction": "RECH_OGMO6961642914000016-10-2020 18:12",
    "INITTFST": "RECH_OGMO",
    "caisseEntre": "AGENT",
    "caisseSortie": "AGENT",
    "coffreoperation": null,
    "reference": null,
    "referencecotionempl": null,
    "suspens": true,
    "comment": "Equivalent partenaire non trouvé - Problème de référence"
  },
  {
    "id": "9708a885-5ad3-42d3-a712-60a986170d82",
    "COMM": 0,
    "COMHTBANK": 0,
    "COMHTMASTER": 0,
    "COMHTTRF": 0,
    "COMTTCBANK": 0,
    "COMTTCMASTER": 0,
    "COMTTCTRF": 0,
    "SDAMINSDCU": 40000,
    "SDAMREIMBOU": 0,
    "SDFEHTINSDCU": 0,
    "SDFETTCINSDCU": 0,
    "TAUXCHANG": 0,
    "TAUXCOM": 0,
    "TTAMPAINSDCU": 40000,
    "ACCSTS": "OPEN",
    "TFST": "RECH_OGMO",
    "TVA": null,
    "TVACOMM": 0,
    "TVACOMBANK": 0,
    "TVACOMMASTER": 0,
    "TVACOMTRF": 0,
    "B10Mil": 4,
    "B1Mil": 0,
    "B2Mil": 0,
    "B500": 0,
    "B5Mil": 0,
    "caisseID": "AGENT_20200115161258_NDEMROME_OPERATION",
    "BILINIDA": {},
    "P100franc": 0,
    "P10franc": 0,
    "p1franc": 0,
    "p25franc": 0,
    "p2franc": 0,
    "P500Cent": 0,
    "p50franc": 0,
    "p5franc": 0,
    "pointID": "AGENT_20200115161258",
    "Bstatut": "NEW",
    "totalAmount": 40000,
    "RB10Mil": 0,
    "RB1Mil": 0,
    "RB2Mil": 0,
    "RB500": 0,
    "RB5Mil": 0,
    "RP100franc": 0,
    "RP10franc": 0,
    "Rp1franc": 0,
    "Rp25franc": 0,
    "Rp2franc": 0,
    "RP500Cent": 0,
    "Rp50franc": 0,
    "Rp5franc": 0,
    "rtotalAmount": 0,
    "accounting": 0,
    "ANNULAgent": null,
    "ANNULAgentName": null,
    "annulAmount": 0,
    "ANNULDA": null,
    "ANNULUserFullName": null,
    "ANNULUserLogin": null,
    "annulationReason": null,
    "approType": "AUTRE",
    "caisseStatut": "NEW",
    "cityOfResidence": null,
    "coinspwd": null,
    "COMMCEMAC": null,
    "countryOfResidence": null,
    "fees": 0,
    "FINAL_TFST": "OPEN",
    "firstName": null,
    "forcage": 0,
    "idDeliveryDate": null,
    "idDeliveryLocation": null,
    "idExpiryDate": null,
    "idNumber": null,
    "idType": "NIC",
    "INITAG": "AGENT_20200115161258",
    "INITAGN": "MC2 MUFFA KYE-OSSI",
    "INITUSFN": "ROMELI WILFRIDE NDEMI KUMABANG",
    "INITUSLO": "NDEMROME",
    "INIDA": {},
    "isAutorisation": 0,
    "isnotpiece": 1,
    "ispiece": 0,
    "lastName": null,
    "localization": null,
    "modereprint": null,
    "modifyAgent": null,
    "modifyAgentName": null,
    "modifyAmount": 0,
    "modifyDate": null,
    "modifyUserFullName": null,
    "modifyUserLogin": null,
    "montantLettre": null,
    "motif": null,
    "motifAgent": null,
    "motifAuto": null,
    "motifForcage": null,
    "SENTDA": {},
    "SDIPTE": 0,
    "operation": "DEPOT",
    "passationServ": 0,
    "poidskg": null,
    "product": "ORANGE_MOMO",
    "RCCT": "CMR",
    "RCCTN": "CMR",
    "receiverfirstName": null,
    "receiveridNumber": null,
    "receiverlastName": null,
    "receivertel": null,
    "RFNB": "833833819147",
    "RFNBMATCH": null,
    "refpiece": "",
    "rembourAgent": null,
    "rembourAgentName": null,
    "rembourAmount": 0,
    "rembourDate": null,
    "rembourUserFullName": null,
    "rembourUserLogin": null,
    "SDCT": "CMR",
    "SDIAG": "AGENT_20200115161258",
    "SDIAGN": "MC2 MUFFA KYE-OSSI",
    "SDICT": "CMR",
    "SDICTN": "Cameroun",
    "SDICU": "XAF",
    "sendingPrinted": 1,
    "SDIUSFN": "ROMELI WILFRIDE NDEMI KUMABANG",
    "SDIUSLO": "NDEMROME",
    "servicesId": null,
    "servicesName": null,
    "simphone": "695591892",
    "takeFees": 0,
    "tel": "696164291",
    "validate": 0,
    "version": 1,
    "caisseType": "OPERATION",
    "mathcAcc": 0,
    "mathcCaisse": 0,
    "maxAmountTransfer": 0,
    "pointageAcc": 0,
    "pointageCaisse": 0,
    "transferBlackliste": 0,
    "banque": null,
    "operateur": null,
    "origine": null,
    "rib": null,
    "simphoneFils": "695591892",
    "simphoneMere": null,
    "referenceNumberWU": "",
    "sensType": null,
    "soldecaisse": 5108275,
    "soldecaissetarget": 5108275,
    "numtransaction": "833833819147",
    "receivingAmount": null,
    "receivingCurrency": null,
    "soldepiece": null,
    "soldecaisseFils": 627300,
    "soldecaisseMere": 0,
    "sourceId": null,
    "keynumtransaction": "RECH_OGMO6961642914000016-10-2020 16:22",
    "INITTFST": "RECH_OGMO",
    "caisseEntre": "AGENT",
    "caisseSortie": "AGENT",
    "coffreoperation": null,
    "reference": null,
    "referencecotionempl": null,
    "suspens": true,
    "comment": "Equivalent partenaire non trouvé - Problème de référence"
  }
];

function rapprocheroM(t1, t2) {

  const map1 = {};
  const map2 = {};

  const dpct1 = {};
  const dpct2 = {};

  t1.filter((e) => (
    (['Cash in', 'Cash Out', 'Cash Out For Non Register'].indexOf(e['Service']) > -1)
    &&
    (e['Compte1'] !== '691230586'))).forEach((el) => {
      let x = el['Service'];
      if (x === 'Cash Out For Non Register') {
        x = 'Cash Out';
      }
      const ref = x + el['Compte1'] + el['Compte2'] + ((el['Service'] === 'Cash in') ? el['Debit'].toString() : el['Credit'].toString());
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
    const ref = (el['TFST'] === 'RECH_OGMO' ? 'Cash in' : 'Cash Out') + el['simphoneFils'] + el['tel'].replace(/\s/g, '') + el['SDAMINSDCU'];
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
  // console.log(dpct1['Cash in656622450698811640500000'].length);

  // console.log(map2);
  // console.log(dpct2['Cash in656622450698811640500000'].length);

  const exact_match = [];
  const errored_match = [];

  for (const prop in map1) {
    if (map2[prop] !== undefined) {

      console.log('---');

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
      console.log('///');
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
      console.log('coche suspens 1');
      map1[prop]['suspens'] = true;
      map1[prop]['comment'] = 'Equivalent Cash-IT non trouvé - Problème de référence';
    }
  }

  // console.log(map1);
  // console.log(dpct1['Cash in69559189169616429140000'].length);

  // console.log(map2);
  // console.log(dpct2['Cash in656622450698811640500000'].length);

  

  // tslint:disable-next-line: forin
  for (const prop in dpct1) {

    const replacement = dpct1[prop].length;
    for (let j = 0; j < replacement; j++) {
      console.log('---------->', ' ', j);

      if (map2[prop] !== undefined) {

        // console.log('t1');

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

        console.log('***');
        dpct1[prop][0]['suspens'] = false;
        dpct1[prop][0]['comment'] = 'R.A.S';
        dpct2[prop][0]['suspens'] = false;
        dpct2[prop][0]['comment'] = 'R.A.S';

        exact_match.push({
          'partenaire': dpct1[prop][0],
          'cashit': dpct2[prop][0]
        });

        dpct1[prop].splice(0, 1);
        console.log(dpct1[prop].length);

        if (dpct1[prop].length === 0) {
          delete dpct1[prop];
        }

        dpct2[prop].splice(0, 1);
        console.log(dpct2[prop].length);

        if (dpct2[prop].length === 0) {
          delete dpct2[prop];
        }
      } else {
        console.log('suspens coche 2');
        for (let m = 0; m < dpct1[prop].length; m++) {
          dpct1[prop][m]['suspens'] = true;
          dpct1[prop][m]['comment'] = 'Equivalent Cash-IT non trouvé - Problème de référence';
        }
      }
    }
  }

  const suspens1 = { ...map1 };
  const suspens2 = { ...map2 };

  // console.log(suspens2);

  // console.log(suspens1);
  // console.log(suspens2);

  for (const prop in suspens2) {
    suspens2[prop]['suspens'] = true;
    suspens2[prop]['comment'] = 'Equivalent partenaire non trouvé - Problème de référence';
  }

  const sdp1 = { ...dpct1 };
  const sdp2 = { ...dpct2 };

  // console.log(sdp2);

  for (const prop in sdp2) {
    for (let k = 0; k < sdp2[prop].length; k++) {
      sdp2[prop][k]['suspens'] = true;
      sdp2[prop][k]['comment'] = 'Equivalent partenaire non trouvé - Problème de référence';
    }
  }

  const s11 = Object.keys(suspens1).map((e) => suspens1[e]);
  let s12 = [];

  // console.log(s11);
  Object.keys(sdp1).map((e) => sdp1[e]).forEach((e) => {
    if (e.length > 0) {
      s12 = [...s12, ...e];
    }
  });

  // console.log(s12);

  const s21 = Object.keys(suspens2).map((e) => suspens2[e]);
  let s22 = [];
  Object.keys(sdp2).map((e) => sdp2[e]).forEach((e) => {
    if (e.length > 0) {
      s22 = [...s22, ...e];
    }
  });

  const ss1 = [...s11, ...s12].sort((x, y) => {
    if (x['Compte2'] < y['Compte2']) {
      return 1;
    } else {
      return -1;
    }
  });

  console.log(s21.length);
  console.log(s22.length);

  const ss2 = [...s21, ...s22].sort((x, y) => {
    if (x['tel'] < y['tel']) {
      return 1;
    } else {
      return -1;
    }
  });

  // console.log(ss2);

  const result = {
    match: exact_match,
    inexactmatch: errored_match,
    suspens1: ss1,
    suspens2: ss2
  };

  // console.log(exact_match);
  // console.log(result.suspens1.length);
  // console.log(result.suspens2.length);

  return result;

}

const Excel = require('./node_modules/exceljs/');



function oMXLS(result, workbook, partnerheaders, cashitheaders,
  partnerdata, cashitdata) {

  const headers = [...partnerheaders, ...cashitheaders].map((uniq) => {
    return { header: uniq, key: uniq, width: 14 };
  });

  if (result.match.length > 0) {
    const match = [];
    result.match.forEach((element) => {
      match.push({
        ...element['partenaire'],
        ...element['cashit']
      });
    });

    const worksheet1 = workbook.addWorksheet('Bons enregistrements OM');
    worksheet1.columns = headers;
    worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
    worksheet1.addRows(match);
  }

  if (result.inexactmatch.length > 0) {
    const inexactmatch = [];
    result.inexactmatch.forEach((element) => {
      inexactmatch.push({
        ...element['partenaire'],
        ...element['cashit']
      });
    });

    const worksheet1 = workbook.addWorksheet('Suspends OM Montant');
    worksheet1.columns = headers;
    worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
    worksheet1.addRows(inexactmatch);
  }

  if (result.suspens1.length > 0 || result.suspens2.length > 0) {

    const worksheet1 = workbook.addWorksheet('Suspens OM');
    worksheet1.columns = headers;
    worksheet1.getColumn(1).numFmt = 'dd/mm/yyyy';
    // worksheet1.getColumn(6).numFmt = 'dd/mm/yyyy';
    worksheet1.addRows(result.suspens1);
    worksheet1.addRows(result.suspens2);
  }

  // console.log(partnerdata);

  if (partnerdata.length > 0) {
    const worksheet1 = workbook.addWorksheet('Données OM Partenaires');
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
    const worksheet1 = workbook.addWorksheet('Données OM Cash-IT');
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
};

const workboo = oMXLS(rapprocheroM(source, cashit), new Excel.Workbook(),
  ['Date', 'Service', 'Compte1', 'Compte2', 'Credit', 'Debit'],
  ['RFNB', 'TFST', 'simphoneFils', 'tel', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'], source, cashit);

workboo.xlsx.writeFile(new Date().getTime().toString() + '.xlsx').then(() => {
  // console.log('-------------------------------------------');
});