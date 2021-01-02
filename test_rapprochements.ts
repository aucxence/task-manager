let values = 'MKZF2D,International,,20/11/20,,,,,DLA,INSTANT TRANSFER NDOGBONG,KUIDJEU HERMANN PETRONY,NDOGBONG ZACHMAN,,,DOUALA,,,LITORAL,CM,BWI,Cameroon,237690263614,Ityde.sb@yahoo.com,,Exportation,,,FANYI NGASSA EPHIGENIE EPOUSE EPOPA,FANYI NGASSA EPHIGENIE EPOUSE EPOPA,3841BERLEIGH HILL COURT BURTONSVILLE MD20866,,,BURTONSVILLE,,Maryland,20866,US,United States of America,12408831743,,,,1,0.5 KG,,Droits de douane non applicables,,CASHCM357,CASHCM357,,,2 CERTIFICATS DE NATIONALITE ET L\'ORIGINAL DE L\'ACTE DE NAISSANCE,,XAF,,,Sauvegardée par moi,,Non,,,Compte DHL,';

const val = values.split(',');

console.log(val);

// let values = '1757468470310International017574684703101110/1111/20100000YAO0OSOH OSOH NGUTE ABIA0OSOH OSOH NGUTE ABIA0SIMBOCK000YAOUNDE0000CM0JED0Cameroon0123765870475610florence.kamseu@instant-transfer.com00Exportation000ERNEST NZO MBU0ERNEST NZO MBU0AL SAFA JEDDAH0SAUDI ARABIA00JEDDAH0000SA0Saudi Arabia019665611981154710florence.kamseu@instant-transfer.com0001111010.5 KG1010.385 KG10Droits de douane non applicables0168,830 XAF10CASHCM5540CASHCM5540EXPRESS WORLDWIDE0DOX0PASSPORT ET DOCUMENTS SCOLAIRE00XAF000Envoi aujourd’hui00Non000Compte DHL000000000000000000000XAF00000'

const map = {};

map['identifiant'] = val[0];
map['scope'] = val[1];

const dt = val[3].split('/');
const day = (dt[0].length > 2) ? +(dt[0].substring(dt[0].length - 2, dt[0].length)) : +dt[0];
const month = +(dt[1].substr(0, 2));
const year = +('20' + dt[2].substr(0, 2));

const date = new Date(year, month - 1, day, 8, 0, 0);

map['Date'] = date;

map['town']= val[8];
map['agence'] = val[9];
map['sender'] = val[10];

map['receiver'] = val[11];

map['teldesti'] = val[22];

map['email'] = val[23];

map['expo'] = val[25];

// function isAlphaOrParen(str) {
//   return /^[a-zA-Z()]+$/.test(str);
// }

// const id = (values.indexOf('International') > -1) ?
//   values.split('International')[0] :
//   values.split('National')[0]; // 1 et 3

// map['identifiant'] = id.substr(1, 10);

// console.log(id);

// console.log('++<> ', values);

// let reste = (values.indexOf('International') > -1) ?
//   values.split('International')[1] :
//   values.split('National')[1];
// console.log('--> ', reste);
// reste = reste.indexOf(id) > - 1 ? reste.split(id)[1] : reste;

// console.log(reste);

// let rep = 0;

// for (let m = 0; m < reste.length; m++) {
//   console.log('-> ', m);
//   console.log(reste.substring(m, 1));
//   if (isAlphaOrParen(reste[m])) {
//     rep = m;
//     break;
//   }
// }

// const dat = reste.substring(0, rep); // 4

// console.log(dat);



// reste = reste.split(dat)[1];

// const dt = dat.split('/');
// const day = (dt[0].length > 2) ? +(dt[0].substring(dt[0].length - 2, dt[0].length)) : +dt[0];
// const month = +(dt[1].substr(0, 2));
// const year = +('20' + dt[2].substr(0, 2));

// console.log(dt, ' - ', day, ' - ', month, ' - ', year);

// const date = new Date(year, month - 1, day, 8, 0, 0);

// map['Date'] = date;

// console.log('||||||||||| ', reste);

// // ------------------------------------

// const nom = reste.split('0')[0];
// const prenom = reste.split('0')[1];

// console.log('> ', nom + ' ' + prenom);

// map['sender'] = nom + ' ' + prenom;

// let rt = reste.split('0');

// rt.splice(0, 3);

// reste = rt.join('0');

// console.log('~~~~~~~~ ', reste);

// // ------------------------------------

// const quartier = reste.split('000')[0];

// map['quartier'] = quartier;

// rt = reste.split('000');

// rt.splice(0, 1);

// reste = rt.join('000');

// // ------------------------------------

// const ville = reste.split('0000')[0];

// map['ville'] = ville;

// rt = reste.split('0000');

// rt.splice(0, 1);

// reste = rt.join('000');

// // ------------------------------------

// const iso2 = reste.substr(0, 2);

// map['iso2'] = iso2;

// reste = reste.substr(7);

// const pays = 'Cameroon';

// map['pays'] = pays;

// reste = reste.substr(8);

// reste = reste.substr(2);

// const phonenumber = reste.substr(0, 12);

// map['phonenumber'] = phonenumber;

// reste = reste.substr(12);

// rep = 0;

// for (let m = 0; m < reste.length; m++) {
//   console.log('-> ', m);
//   console.log(reste.substring(m, 1));
//   if (isAlphaOrParen(reste[m])) {
//     rep = m;
//     break;
//   }
// }





// const zip = reste.substr(0, rep);

// map['zip'] = zip;

// reste = reste.substr(rep);



// // ------------------------------------

// const email = reste.split('@instant-transfer.com')[0] + '@instant-transfer.com';

// map['email'] = email;

// rt = reste.split('@instant-transfer.com');

// rt.splice(0, 1);



// reste = rt.join('@instant-transfer.com');



// // --------------------------------------------

// reste = reste.substr(2);

// const expo = 'Exportation';

// map['expo'] = expo;



// reste = reste.substr(11);

// // ------------------------------------



// let fullname = reste.split('0');

// fullname = fullname.filter((e) => e.length > 0);

// // console.log(map);

// // console.log('!!!!-----> ', fullname);

// const destinataire = fullname[0];
// const adresse1 = fullname[2];
// const adresse2 = fullname[3];
// const adresse3 = fullname[5];

// const iso2desti = fullname.filter(e => e.length === 2 && isAlphaOrParen(e))[0];

// map['receiver'] = destinataire;
// map['adresse1'] = adresse1;
// map['adresse2'] = adresse2;
// map['adresse3'] = adresse3;
// map['iso2desti'] = iso2desti;

// const repere = fullname.indexOf(iso2desti);

// const paysdesti = fullname[repere + 1];

// map['paysdesti'] = paysdesti;

// const teldesti = fullname[repere + 2];

// map['teldesti'] = teldesti;



// const inter = fullname.filter(e => e.indexOf('KG1')).length;

// const kgrepere = inter > 0 ?
//   fullname.indexOf(fullname.filter(e => e.indexOf('KG1') > -1)[0]) :
//   fullname.indexOf(fullname.filter(e => e.indexOf('KG') > -1)[0]);

// console.log(kgrepere);

// const nbcolis = fullname[kgrepere - 1];
// const poids1 = fullname[kgrepere + 0];
// const poidsvolum = fullname[kgrepere + 1];
// const poids2 = fullname[kgrepere + 2];

// const droit = fullname[kgrepere + 3];

// map['nbcolis'] = nbcolis;
// map['poids1'] = poids1;
// map['poidsvolum'] = poidsvolum;
// map['poids2'] = poids2;
// map['douane'] = droit;

// // console.log(map);

// fullname.splice(0, kgrepere + 4);

// console.log('***** ', fullname);

// let charges = fullname[0];

// // console.log('---');

// const index = charges.indexOf(',');

// function round3(x) {
//   return Math.ceil(x / 3) * 3;
// }

// const comple = round3(charges.length) - charges.length;

// // console.log(comple + ' , ' + index + ' , ' + charges.length);

// for (let i = 0; i < comple; i++) {
//   charges = charges + '0';
// }


// charges = (charges + '0').substr(1);

// map['charges'] = +charges.replace(/,/g, '');

// const motif = fullname[6];

// map['motif'] = motif;

// const typeenvoi = fullname[4];

// map['typeenvoi'] = typeenvoi;

// // ------------------------------------

// const commTTC = +charges.replace(/,/g, '') / 10;

// map['CommTTC'] = commTTC;

// map['HTComm'] = commTTC / 1.1925;
// map['TVA'] = map['HTComm'] * 0.1925;

// map['code'] = 'DHL';
// map['type'] = 'DHL';

// map['timestamp'] = new Date();
// // map['loadby'] = ide;
// // map['loadbyName'] = fullnameauth;
// // map['filename'] = filename;

// console.log(map);