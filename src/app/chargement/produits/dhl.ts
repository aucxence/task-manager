import * as XLSX from 'xlsx';
import * as Excel from 'exceljs';

export const uploadDHL = (file, ide: string, fullnameauth: string, filename: string) => {

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

            const todo = json;

            const result = [];

            todo.forEach((element: any) => {

                const values =
                    element['Identifiant temporaire0International/National0Numéro d\'expédition0Date d’expédition01Référence d’expédition 1110Référence d’expédition (Détails de l’expédition)0Référence d’expédition 30Référence d’expédition 40Lieu de l’enlèvement0Société (Expédier à partir de)0Contact (Expédier à partir de)01Adresse 11 (Expédier à partir de)10Adresse 2 (Expédier à partir de)0Adresse 3 (Expédier à partir de)0Ville (Expédier à partir de)0Code ZIP/postal (Expédier à partir de)0Quartier (Expédier à partir de)0État/Province (Expédier à partir de)0Indicatif du pays (Expédier à partir de)0Expédier à destination de Indicatif du pays0Pays (Expédier à partir de)0Numéro de téléphone (Expédier à partir de)0Adresse e-mail (Expédier à partir de)0Numéro fiscal/de TVA (Expédier à partir de)0Type0Relatif à0Paires Expédition/Retour0Société (Expédier à destination de)0Contact (Expédier à destination de)01Adresse 11 (Expédier à destination de)10Adresse 2 (Expédier à destination de)0Adresse 3 (Expédier à destination de)0Ville (Expédier à destination de)0Quartier (Expédier à destination de)0État/Province (Expédier à destination de)0Code ZIP/postal (Expédier à destination de)0Indicatif du pays (Expédier à destination de)0Pays (Expédier à destination de)0Numéro de téléphone (Expédier à destination de)0Adresse e-mail (Expédier à destination de)0Numéro fiscal/de TVA (Expédier à destination de)0Notes (Expédier à destination de)0Total des colis0Poids total0Poids volumétrique total0Statut des droits de douane applicables0Charges estimées0Compte de l’expéditeur0Compte de l’entité facturable0Option de livraison Type0Option de livraison Code0Description du contenu0Valeur déclarée0Déclaré Devise0Valeur assurée0Assurance expédition Devise0Statut0Droit/Taxes Compte0Scinder les droits et taxes0Droit0Taxes Numéro de compte0Type de paiement0Mode de paiement0Montant du paiement à la livraison0Type de paiement par contre-remboursement0Devise de paiement à la livraison0Shipment Type0Purpose of Shipment0India Tax ID Type0India Tax id Number0GST Invoice Number0GST Invoice Date0Invoice Number0Invoice Date0Whether Supply for Export is on Payment of IGST0Against Bond or Undertaking0Total IGST Paid if Any0Whether Using Ecommerce0IEC Number0Bank AD Code0Terms of Trade0Total Invoice Value0Declared Currency0Total FOB Value0Total FOB Value in INR0Total Discount0Reverse Charges0Total Amount after Tax']
                    ??
                    element['Identifiant temporaire,International/National,Numéro d\'expédition,Date d’expédition,Référence d’expédition 1,Référence d’expédition (Détails de l’expédition),Référence d’expédition 3,Référence d’expédition 4,Lieu de l’enlèvement,Société (Expédier à partir de),Contact (Expédier à partir de),Adresse 1 (Expédier à partir de),Adresse 2 (Expédier à partir de),Adresse 3 (Expédier à partir de),Ville (Expédier à partir de),Code ZIP/postal (Expédier à partir de),Quartier (Expédier à partir de),État/Province (Expédier à partir de),Indicatif du pays (Expédier à partir de),Expédier à destination de Indicatif du pays,Pays (Expédier à partir de),Numéro de téléphone (Expédier à partir de),Adresse e-mail (Expédier à partir de),Numéro fiscal/de TVA (Expédier à partir de),Type,Relatif à,Paires Expédition/Retour,Société (Expédier à destination de),Contact (Expédier à destination de),Adresse 1 (Expédier à destination de),Adresse 2 (Expédier à destination de),Adresse 3 (Expédier à destination de),Ville (Expédier à destination de),Quartier (Expédier à destination de),État/Province (Expédier à destination de),Code ZIP/postal (Expédier à destination de),Indicatif du pays (Expédier à destination de),Pays (Expédier à destination de),Numéro de téléphone (Expédier à destination de),Adresse e-mail (Expédier à destination de),Numéro fiscal/de TVA (Expédier à destination de),Notes (Expédier à destination de),Total des colis,Poids total,Poids volumétrique total,Statut des droits de douane applicables,Charges estimées,Compte de l’expéditeur,Compte de l’entité facturable,Option de livraison Type,Option de livraison Code,Description du contenu,Valeur déclarée,Déclaré Devise,Valeur assurée,Assurance expédition Devise,Statut,Droit/Taxes Compte,Scinder les droits et taxes,Droit,Taxes Numéro de compte,Type de paiement,Mode de paiement'];

                const map = {};

                function isAlphaOrParen(str) {
                    return /^[a-zA-Z()]+$/.test(str);
                }

                const id: string = (values.indexOf('International') > -1) ?
                    values.split('International')[0] :
                    values.split('National')[0]; // 1 et 3

                map['identifiant'] = id.substr(1, 10);

                console.log(id);

                console.log('++<> ', values);

                let reste = (values.indexOf('International') > -1) ?
                    values.split('International')[1] :
                    values.split('National')[1];
                console.log('--> ', reste);
                reste = reste.indexOf(id) > - 1 ? reste.split(id)[1] : reste;

                console.log(reste);

                let rep = 0;

                for (let m = 0; m < reste.length; m++) {
                    console.log('-> ', m);
                    console.log(reste.substring(m, 1));
                    if (isAlphaOrParen(reste[m])) {
                        rep = m;
                        break;
                    }
                }

                const dat = reste.substring(0, rep); // 4

                console.log(dat);

                reste = reste.split(dat)[1];

                const dt = dat.split('/');
                const day = (dt[0].length > 2) ? +(dt[0].substring(dt[0].length - 2, dt[0].length)) : +dt[0];
                const month = +(dt[1].substr(0, 2));
                const year = +('20' + dt[2].substr(0, 2));

                console.log(dt, ' - ', day, ' - ', month, ' - ', year);

                const date = new Date(year, month - 1, day, 8, 0, 0);

                map['Date'] = date;

                // ------------------------------------

                const nom = reste.split('0')[0];
                const prenom = reste.split('0')[1];

                // console.log(nom + ' ' + prenom);

                map['sender'] = nom + ' ' + prenom;

                let rt = reste.split('0');

                rt.splice(0, 3);

                reste = rt.join('0');

                // ------------------------------------

                const quartier = reste.split('000')[0];

                map['quartier'] = quartier;

                rt = reste.split('000');

                rt.splice(0, 1);

                reste = rt.join('000');

                // ------------------------------------

                const ville = reste.split('0000')[0];

                map['ville'] = ville;

                rt = reste.split('0000');

                rt.splice(0, 1);

                reste = rt.join('000');

                // ------------------------------------

                const iso2 = reste.substr(0, 2);

                map['iso2'] = iso2;

                reste = reste.substr(7);

                const pays = 'Cameroon';

                map['pays'] = pays;

                reste = reste.substr(8);

                reste = reste.substr(2);

                const phonenumber = reste.substr(0, 12);

                map['phonenumber'] = phonenumber;

                reste = reste.substr(12);

                rep = 0;

                for (let m = 0; m < reste.length; m++) {
                    console.log('-> ', m);
                    console.log(reste.substring(m, 1));
                    if (isAlphaOrParen(reste[m])) {
                        rep = m;
                        break;
                    }
                }

                const zip = reste.substr(0, rep);

                map['zip'] = zip;

                reste = reste.substr(rep);

                // console.log(reste);

                // ------------------------------------

                const email = reste.split('@instant-transfer.com')[0] + '@instant-transfer.com';

                map['email'] = email;

                rt = reste.split('@instant-transfer.com');

                rt.splice(0, 1);

                reste = rt.join('@instant-transfer.com');

                // --------------------------------------------

                reste = reste.substr(2);

                const expo = 'Exportation';

                map['expo'] = expo;

                reste = reste.substr(11);

                // ------------------------------------

                let fullname = reste.split('0');

                fullname = fullname.filter((e) => e.length > 0);

                // console.log(map);

                const destinataire = fullname[0];
                const adresse1 = fullname[2];
                const adresse2 = fullname[3];
                const adresse3 = fullname[5];

                const iso2desti = fullname.filter(e => e.length === 2 && isAlphaOrParen(e))[0];

                map['receiver'] = destinataire;
                map['adresse1'] = adresse1;
                map['adresse2'] = adresse2;
                map['adresse3'] = adresse3;
                map['iso2desti'] = iso2desti;

                const repere = fullname.indexOf(iso2desti);

                const paysdesti = fullname[repere + 1];

                map['paysdesti'] = paysdesti;

                const teldesti = fullname[repere + 2];

                map['teldesti'] = teldesti;

                console.log(fullname);

                const inter = fullname.filter(e => e.indexOf('KG1')).length;

                const kgrepere = inter > 0 ?
                    fullname.indexOf(fullname.filter(e => e.indexOf('KG1') > -1)[0]) :
                    fullname.indexOf(fullname.filter(e => e.indexOf('KG') > -1)[0]);

                console.log(kgrepere);

                const nbcolis = fullname[kgrepere - 1];
                const poids1 = fullname[kgrepere + 0];
                const poidsvolum = fullname[kgrepere + 1];
                const poids2 = fullname[kgrepere + 2];

                const droit = fullname[kgrepere + 3];

                map['nbcolis'] = nbcolis;
                map['poids1'] = poids1;
                map['poidsvolum'] = poidsvolum;
                map['poids2'] = poids2;
                map['douane'] = droit;

                // console.log(map);

                fullname.splice(0, kgrepere + 4);

                console.log('***** ', fullname);

                let charges = fullname[0];

                // console.log('---');

                const index = charges.indexOf(',');

                function round3(x) {
                    return Math.ceil(x / 3) * 3;
                }

                const comple = round3(charges.length) - charges.length;

                // console.log(comple + ' , ' + index + ' , ' + charges.length);

                for (let i = 0; i < comple; i++) {
                    charges = charges + '0';
                }


                charges = (charges + '0').substr(1);

                map['charges'] = +charges.replace(/,/g, '');

                const motif = fullname[6];

                map['motif'] = motif;

                const typeenvoi = fullname[4];

                map['typeenvoi'] = typeenvoi;

                // ------------------------------------

                const commTTC = +charges.replace(/,/g, '') / 10;

                map['CommTTC'] = commTTC;

                map['HTComm'] = commTTC / 1.1925;
                map['TVA'] = map['HTComm'] * 0.1925;

                map['code'] = 'DHL';
                map['type'] = 'DHL';

                map['timestamp'] = new Date();
                map['loadby'] = ide;
                map['loadbyName'] = fullnameauth;
                map['filename'] = filename;

                result.push(map);

            });

            resolve(result);

            //   loadFTFiles(json, id, fullname);

        };

        fileReader.readAsArrayBuffer(file);

    });
};

export const loadDHLFiles = (result: any[], workbook: Excel.Workbook, filename: string) => {

    // console.log('-------------------------');



    const headers = Object.keys(result[0])
        .map((uniq) => {
            return { header: uniq, key: uniq, width: 14 };
        });

    const eft = result;

    if (eft.length > 0) {
        const worksheet1 = workbook.addWorksheet('DHL de ' + filename);
        worksheet1.columns = headers;
        worksheet1.getColumn(3).numFmt = 'dd/mm/yyyy';
        worksheet1.getColumn(19).numFmt = 'dd/mm/yyyy HH:mm';
        worksheet1.addRows(eft);
    }

    return workbook;

};
