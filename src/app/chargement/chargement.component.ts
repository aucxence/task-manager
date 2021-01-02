import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { AuthService } from '../shared/auth.service';
import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';
import { uploadFT, loadFTFiles } from './produits/flash_transfer';
import { uploadMG, loadMGFiles } from './produits/moneygram';
import { uploadMOMO, loadMOMOFiles } from './produits/mtn_money';
import { uploadOM, loadOMFiles } from './produits/orange_money';
import { uploadRIA, loadRIAFiles } from './produits/ria';
import { uploadRT, loadRTFiles } from './produits/rapid_transfer';
import { uploadSMOBPAY, loadSMOBPAYFiles } from './produits/smobil_pay';
import { uploadWU, loadWUFiles, uploadEWU, uploadRWU, loadEWUFiles, loadRWUFiles } from './produits/western_union';
import { loadOtherFiles, uploadOther } from './produits/other';

import { rapprocherMG, mgXLS } from './rapprochements/moneygram';
import { rapprocherWU, wuXLS } from './rapprochements/western union';
import { rapprocherRIA, riaXLS } from './rapprochements/ria';
import { rapprocherFT, ftXLS } from './rapprochements/flash transfer';
import { rapprocherRT, rtXLS } from './rapprochements/rapid transfer';
import { rapprocherOM, omXLS } from './rapprochements/orange money';
import { rapprocherMOMO, momoXLS } from './rapprochements/mtn_momo';
import { rapprocherSMOBPAY, smobpayXLS } from './rapprochements/smobil_pay';
import { printStats } from './stats_hebdo/print_stats';
import { rapprocherGlobal } from './rapprochements/global';

import { printRapprochement } from './rapport/rapprochement';

import { Papa } from 'ngx-papaparse';
import { ToastrService } from 'ngx-toastr';
import { loadDHLFiles, uploadDHL } from './produits/dhl';
import { dhlXLS, rapprocherDHL } from './rapprochements/dhl';


export let read = 0;
export let toread = 0;

@Component({
  selector: 'app-chargement',
  templateUrl: './chargement.component.html',
  styleUrls: ['./chargement.component.scss']
})
export class ChargementComponent implements OnInit {

  @ViewChild('fileSelector')
  fileSelector: ElementRef;

  bdclosing = false;
  product = '';

  products = [
    'FLASH TRANSFER',
    'MONEYGRAM',
    'MTN MOBILE MONEY',
    'ORANGE MONEY',
    'RAPID TRANSFER',
    'RIA',
    'SMOBILPAY',
    'ENVOIS WESTERN UNION',
    'RETRAITS WESTERN UNION',
    'DHL'
  ];

  result = [];

  merge = true;
  progressive = false;

  workbook = new Excel.Workbook();

  constructor(private auth: AuthService, private papa: Papa, private _toastr: ToastrService) { }

  // tslint:disable-next-line: member-ordering
  arrayBuffer: any;
  file: File;
  puces: { [key: string]: string }[];
  mgfees: { [key: number]: number } = {};

  momofees: any = {};

  ftmerge = [];
  mgmerge = [];
  mtnmerge = [];
  ommerge = [];
  rtmerge = [];
  riamerge = [];
  spymerge = [];
  wumerge = [];
  dhlmerge = [];

  ewumerge = [];
  rwumerge = [];

  othermerge = [];

  progress = 0;
  total = 1;

  filetypes = [];
  printingOption = 1;

  cashitdate1 = new Date();
  cashitdate2 = new Date();

  maprequest = {
    'MoneyGram': 'TFST like \'%_MG\'',
    'Flash Transfer': 'TFST like \'%_FT\'',
    'MTN MoMo': 'TFST like \'%_MOMO\'',
    'Orange Money': 'TFST like \'%_OGMO\'',
    'Rapid Transfer': 'TFST like \'%_RT\'',
    'RIA': 'TFST like \'%_RIA\'',
    'smobilpay': 'TFST like \'ENEO\' OR TFST like \'CDE\' OR TFST like \'CANAL\' OR TFST like \'RECHARGE\'',
    'EWU': 'TFST like \'SENT_WU\' or TFST like \'ANNULATED_WU\' or TFST like \'REMBOURS_WU\'',
    'RWU': 'TFST like \'RECEIVED_WU\'',
    'DHL': 'TFST like \'DHL\'',
  };

  bdmaprequest = {
    'MONEYGRAM': 'TFST like \'%_MG\'',
    'FLASH TRANSFER': 'TFST like \'%_FT\'',
    'MTN MOBILE MONEY': 'TFST like \'%_MOMO\'',
    'ORANGE MONEY': 'TFST like \'%_OGMO\'',
    'RAPID TRANSFER': 'TFST like \'%_RT\'',
    'RIA': 'TFST like \'%_RIA\'',
    'SMOBILPAY': 'TFST like \'ENEO\' OR TFST like \'CDE\' OR TFST like \'CANAL\' OR TFST like \'RECHARGE\'',
    'WESTERN UNION': 'TFST like \'%_WU\'',
    'ENVOIS WESTERN UNION': 'TFST like \'SENT_WU\' or TFST like \'ANNULATED_WU\' or TFST like \'REMBOURS_WU\'',
    'RETRAITS WESTERN UNION': 'TFST like \'RECEIVED_WU\'',
    'DHL': 'TFST like \'DHL\'',
  };

  setToDate(event) {
    return new Date(event);
  }

  printChange() {
    if (this.printingOption === 2 || this.printingOption === 3) {
      this.progressive = true;
      this.merge = true;
    }
    if (this.printingOption !== 4) {
      this.bdclosing = false;
    }
    this.resetFiles();
  }


  ngOnInit(): void {
    this.auth.fadeOut = true;

    this.auth.getPuces().subscribe((snapshot) => {
      this.puces = snapshot.docs.map((element) => element.data());
    });

    this.auth.getMgCommissions().subscribe((snapshot) => {
      snapshot.docs.forEach((element) => this.mgfees[element.id] = element.data());
    });

    this.auth.getMoMoCommissions().subscribe((snapshot) => {
      snapshot.docs.forEach((element) => this.momofees[element.id] = element.data());
    });
  }

  async incomingfile(event) {

    this.auth.fadeOut = false;

    try {
      if (this.progressive === false) { // chargement progressif
        this.reset();
      }

      const promises = [];

      const files: File[] = event.target.files;
      this.result = [];

      for (let k = 0, file; file = files[k]; k++) {

        promises.push(new Promise((resolve, reject) => {

          const fileReader = new FileReader();

          fileReader.onload = async (e) => {

            const arrayBuffer: any = fileReader.result;
            const data = new Uint8Array(arrayBuffer);
            const arr = new Array();

            for (let i = 0; i !== data.length; ++i) {
              arr[i] = String.fromCharCode(data[i]);
            }

            const bstr = arr.join('');
            const wbk = XLSX.read(bstr, { type: 'binary' });

            const sheetname = wbk.SheetNames[0];
            const worksheet = wbk.Sheets[sheetname];

            const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            console.log(json);

            console.log('-->')

            // console.log('--> ' + json[0]['SC Order Number,PIN,Delivery Method,Payer Teller Name,Payer Branch,Payer Branch Code,Country From,Country to,Payment Amount,Beneficiary Currency,Commission Amount,Commission Currency,SA Commission Amount,SA Commission Currency,Pay Date']);

            if (json.length > 0) {
              if (json[0]['Account'] && json[0]['Legacy ID'] && json[0]['Base Amt'] === undefined) {

                console.log('C\'est un MoneyGram');
                if (this.filetypes.indexOf('MoneyGram') === -1) {
                  this.filetypes.push('MoneyGram');
                }
                const js: any = await uploadMG(file, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname,
                  this.mgfees, file.name);
                if (this.merge === false) {
                  this.workbook = loadMGFiles(
                    js,
                    this.workbook, file.name.substring(8));
                } else {
                  this.mgmerge = [...this.mgmerge, ...js];
                  console.log('=====================================');
                  console.log(this.mgmerge);
                  console.log('=====================================');
                }

              } else if (json[1] && (json[1]['Rapport d\'Activité par Site'] || json[1]['Rapport d\'activité par Site/Nº Opérateur'])) {
                console.log('C\'est un WU');
                if (this.filetypes.indexOf('Western Union') === -1) {
                  this.filetypes.push('Western Union');
                  const js: any = await uploadWU(file, this.auth.currentUser.uid,
                    this.auth.user.firstname + ' ' + this.auth.user.lastname,
                    file.name);
                  if (this.merge === false) {
                    this.workbook = loadWUFiles(
                      js,
                      this.workbook, file.name);
                  } else {
                    this.wumerge = [...this.wumerge, ...js];
                    console.log('=====================================');
                    console.log(this.wumerge);
                    console.log('=====================================');
                  }
                }
              } else if (json[0]['DATE'] && json[0]['DESTINATION'] && json[0]['DEVISE ']
                && json[0]['FRAIS '] && json[0]['HEURE'] && json[0]['MONTANT']
                && json[0]['N0 ENVOI'] && json[0]['NO REF'] && json[0]['TYPE']) {

                console.log('C\'est un Flash Transfer');
                if (this.filetypes.indexOf('Flash Transfer') === -1) {
                  this.filetypes.push('Flash Transfer');
                }
                const js: any = await uploadFT(file, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname, file.name);
                console.log(js);

                if (this.merge === false) {
                  this.workbook = loadFTFiles(
                    js,
                    this.workbook, file.name);
                } else {
                  this.ftmerge = [...this.ftmerge, ...js];
                }

              } else if (json[0]['SC Order Number'] || json[0]['SC Order Number,PIN,Delivery Method,Payer Teller Name,Payer Branch,Payer Branch Code,Country From,Country to,Payment Amount,Beneficiary Currency,Commission Amount,Commission Currency,SA Commission Amount,SA Commission Currency,Pay Date']
                || json[0]['SC Order Number,PIN,Delivery Method,Teller,Branch,Branch Code,Reconciliation Branch,Reconciliation Branch Code,Sent Amount,Sending Currency,Country From,Country to,Payment Amount,Beneficiary Currency,Commission Amount,Commission Currency,SA Commission Amount,SA Commission Currency,Date,Rate,CTE,TVA1,Customer Fee,Action']) {

                console.log('C\'est un RIA');
                if (this.filetypes.indexOf('RIA') === -1) {
                  this.filetypes.push('RIA');
                }
                const js: any = await uploadRIA(file, this.papa, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname, file.name);
                console.log('=====================================');
                console.log(js);
                console.log('=====================================');

                if (this.merge === false) {
                  this.workbook = loadRIAFiles(
                    js,
                    this.workbook, file.name);
                } else {
                  this.riamerge = [...this.riamerge, ...js];
                }

              } else if (json[0]['RT Number']) {

                console.log('C\'est un RT');
                if (this.filetypes.indexOf('Rapid Transfer') === -1) {
                  this.filetypes.push('Rapid Transfer');
                }
                const js: any = await uploadRT(file, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname, file.name);
                console.log(js);

                if (this.merge === false) {
                  this.workbook = loadRTFiles(
                    js,
                    this.workbook, file.name);
                } else {
                  this.rtmerge = [...this.rtmerge, ...js];
                }

              } else if (json[0]['Payment Report'] && json[0]['Report Type']) {

                console.log('C\'est un smobilpay');
                if (this.filetypes.indexOf('smobilpay') === -1) {
                  this.filetypes.push('smobilpay');
                }
                const js: any = await uploadSMOBPAY(file, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname, file.name);
                console.log(js);

                if (this.merge === false) {
                  this.workbook = loadSMOBPAYFiles(
                    js,
                    this.workbook, 'SMobPay' + file.name.substring(12));
                } else {
                  this.spymerge = [...this.spymerge, ...js];
                }

              } else if (json[4] && json[4]['Commission Par pays - Transferts Envoyés']) {

                console.log('C\'est un EWU');
                if (this.filetypes.indexOf('EWU') === -1) {
                  this.filetypes.push('EWU');
                }

                const js: any = await uploadEWU(file, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname, file.name);
                console.log(js);

                if (this.merge === false) {
                  this.workbook = loadEWUFiles(
                    js,
                    this.workbook, file.name);
                } else {
                  this.ewumerge = [...this.ewumerge, ...js];
                }

              } else if (json[0]['__EMPTY_13'] && json[4]['Commission Par pays - Transferts Reçus']) {

                console.log('C\'est un RWU');
                if (this.filetypes.indexOf('RWU') === -1) {
                  this.filetypes.push('RWU');
                }

                const js: any = await uploadRWU(file, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname, file.name);
                console.log(js);

                if (this.merge === false) {
                  this.workbook = loadRWUFiles(
                    js,
                    this.workbook, file.name);
                } else {
                  this.rwumerge = [...this.rwumerge, ...js];
                }

              } else if (json[0]['Relevé de vos opérations'] || (json[0]['__EMPTY'] === 'Relevé de vos opérations')) {

                console.log('C\'est un OM');
                if (this.filetypes.indexOf('Orange Money') === -1) {
                  this.filetypes.push('Orange Money');
                }
                const js: any = await uploadOM(file, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname, this.puces, file.name);
                console.log(js);

                if (this.merge === false) {
                  this.workbook = loadOMFiles(
                    js,
                    this.workbook, file.name.substring(8));
                } else {
                  this.ommerge = [...this.ommerge, ...js];
                }

              } else if (
                ((json[0]['Date']
                  && json[0]['Currency'] && json[0]['Status']
                  && json[0]['Currency_5'] && json[0]['To Handler Name'])
                  ||
                  (json[0]['Date']
                    && json[0]['Devise'] && json[0]['Devise_1']
                    && json[0]['Devise_5'] && json[0]['From Handler Name']))
                &&
                json[0]['Type'] !== 'Mise en Service'
                &&
                json[0]['Type'] !== 'Commissioning'
              ) {

                console.log('C\'est un MOMO');
                if (this.filetypes.indexOf('MTN MoMo') === -1) {
                  this.filetypes.push('MTN MoMo');
                }

                console.log(file.name);

                const js: any = await uploadMOMO(file, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname,
                  this.momofees, file.name);
                console.log(js);

                if (this.merge === false) {
                  this.workbook = loadMOMOFiles(
                    js,
                    this.workbook, file.name);
                } else {
                  this.mtnmerge = [...this.mtnmerge, ...js];
                }

              } else if (json[0]['Type'] === 'Mise en Service' || json[0]['Type'] === 'Commissioning'
                || json[0]['Id,"External Transaction Id","Date","Status","Type","Provider Category","Information","Note/Message","From","From Name","From Handler Name","To","To Name","To Handler Name","Initiated By","On Behalf Of","Amount","Currency","Fee","Currency","Discount","Currency","Promotion","Currency","Coupon","Currency","Balance","Currency"']) {
                this._toastr.warning('Insérez le fichier d\'activité et non le fichier de commission', 'Avertissement', {
                  timeOut: 10000
                });
              } else if (json[0]['Identifiant temporaire0International/National0Numéro d\'expédition0Date d’expédition01Référence d’expédition 1110Référence d’expédition (Détails de l’expédition)0Référence d’expédition 30Référence d’expédition 40Lieu de l’enlèvement0Société (Expédier à partir de)0Contact (Expédier à partir de)01Adresse 11 (Expédier à partir de)10Adresse 2 (Expédier à partir de)0Adresse 3 (Expédier à partir de)0Ville (Expédier à partir de)0Code ZIP/postal (Expédier à partir de)0Quartier (Expédier à partir de)0État/Province (Expédier à partir de)0Indicatif du pays (Expédier à partir de)0Expédier à destination de Indicatif du pays0Pays (Expédier à partir de)0Numéro de téléphone (Expédier à partir de)0Adresse e-mail (Expédier à partir de)0Numéro fiscal/de TVA (Expédier à partir de)0Type0Relatif à0Paires Expédition/Retour0Société (Expédier à destination de)0Contact (Expédier à destination de)01Adresse 11 (Expédier à destination de)10Adresse 2 (Expédier à destination de)0Adresse 3 (Expédier à destination de)0Ville (Expédier à destination de)0Quartier (Expédier à destination de)0État/Province (Expédier à destination de)0Code ZIP/postal (Expédier à destination de)0Indicatif du pays (Expédier à destination de)0Pays (Expédier à destination de)0Numéro de téléphone (Expédier à destination de)0Adresse e-mail (Expédier à destination de)0Numéro fiscal/de TVA (Expédier à destination de)0Notes (Expédier à destination de)0Total des colis0Poids total0Poids volumétrique total0Statut des droits de douane applicables0Charges estimées0Compte de l’expéditeur0Compte de l’entité facturable0Option de livraison Type0Option de livraison Code0Description du contenu0Valeur déclarée0Déclaré Devise0Valeur assurée0Assurance expédition Devise0Statut0Droit/Taxes Compte0Scinder les droits et taxes0Droit0Taxes Numéro de compte0Type de paiement0Mode de paiement0Montant du paiement à la livraison0Type de paiement par contre-remboursement0Devise de paiement à la livraison0Shipment Type0Purpose of Shipment0India Tax ID Type0India Tax id Number0GST Invoice Number0GST Invoice Date0Invoice Number0Invoice Date0Whether Supply for Export is on Payment of IGST0Against Bond or Undertaking0Total IGST Paid if Any0Whether Using Ecommerce0IEC Number0Bank AD Code0Terms of Trade0Total Invoice Value0Declared Currency0Total FOB Value0Total FOB Value in INR0Total Discount0Reverse Charges0Total Amount after Tax']
                || json[0]['Identifiant temporaire,International/National,Numéro d\'expédition,Date d’expédition,Référence d’expédition 1,Référence d’expédition (Détails de l’expédition),Référence d’expédition 3,Référence d’expédition 4,Lieu de l’enlèvement,Société (Expédier à partir de),Contact (Expédier à partir de),Adresse 1 (Expédier à partir de),Adresse 2 (Expédier à partir de),Adresse 3 (Expédier à partir de),Ville (Expédier à partir de),Code ZIP/postal (Expédier à partir de),Quartier (Expédier à partir de),État/Province (Expédier à partir de),Indicatif du pays (Expédier à partir de),Expédier à destination de Indicatif du pays,Pays (Expédier à partir de),Numéro de téléphone (Expédier à partir de),Adresse e-mail (Expédier à partir de),Numéro fiscal/de TVA (Expédier à partir de),Type,Relatif à,Paires Expédition/Retour,Société (Expédier à destination de),Contact (Expédier à destination de),Adresse 1 (Expédier à destination de),Adresse 2 (Expédier à destination de),Adresse 3 (Expédier à destination de),Ville (Expédier à destination de),Quartier (Expédier à destination de),État/Province (Expédier à destination de),Code ZIP/postal (Expédier à destination de),Indicatif du pays (Expédier à destination de),Pays (Expédier à destination de),Numéro de téléphone (Expédier à destination de),Adresse e-mail (Expédier à destination de),Numéro fiscal/de TVA (Expédier à destination de),Notes (Expédier à destination de),Total des colis,Poids total,Poids volumétrique total,Statut des droits de douane applicables,Charges estimées,Compte de l’expéditeur,Compte de l’entité facturable,Option de livraison Type,Option de livraison Code,Description du contenu,Valeur déclarée,Déclaré Devise,Valeur assurée,Assurance expédition Devise,Statut,Droit/Taxes Compte,Scinder les droits et taxes,Droit,Taxes Numéro de compte,Type de paiement,Mode de paiement']) {
                console.log('un DHL');
                if (this.filetypes.indexOf('DHL') === -1) {
                  this.filetypes.push('DHL');
                }

                console.log(file.name);

                const js: any = await uploadDHL(file, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname, file.name);
                console.log(js);

                if (this.merge === false) {
                  this.workbook = loadDHLFiles(
                    js,
                    this.workbook, file.name);
                } else {
                  this.dhlmerge = [...this.dhlmerge, ...js];
                }
              } else {

                const js: any = await uploadOther(file, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname, file.name);

                if (this.merge === false) {
                  this.workbook = loadOtherFiles(
                    js,
                    this.workbook, file.name);
                } else {
                  this.othermerge = [...this.othermerge, ...js];
                }
              }

            }

            resolve(true);

          };

          fileReader.readAsArrayBuffer(file);

        }));

      }

      Promise.all(promises).then(async () => {
        if (this.progressive === false) {
          if (this.printingOption === 1) {
            this.validate();
          } else if (this.printingOption === 2) {
            this.rapprocher();
          }
        } else {
          this.auth.fadeOut = true;
        }
      });
    } catch (e) {
      this.auth.fadeOut = true;
      this.resetFiles();
      this._toastr.error(e, 'Erreur', {
        timeOut: 10000
      });
    }

  }

  async extractBD() {
    this.auth.fadeOut = false;
    this.cashitdate1.setHours(1, 0, 0, 0);
    this.cashitdate2.setHours(23, 59, 0, 0);

    this.auth.getItTrans(this.cashitdate1, this.cashitdate2, this.product)
      .subscribe(async (snapshot) => {
        const source = snapshot.docs.map((el) => {
          const data = el.data();
          data['Date'] = data['Date'].toDate();
          return data;
        });

        console.log(source);

        this.workbook = new Excel.Workbook();

        // les données source

        if (source.length > 0) {

          // la requête de récupération des données

          try {

            if (this.product === 'FLASH TRANSFER') {
              this.workbook = loadFTFiles(
                source,
                this.workbook, this.product);
            }
            if (this.product === 'MONEYGRAM') {
              this.workbook = loadMGFiles(
                source,
                this.workbook, this.product);
            }
            if (this.product === 'MTN MOBILE MONEY') {
              this.workbook = loadMOMOFiles(
                source,
                this.workbook, this.product);
            }
            if (this.product === 'ORANGE MONEY') {
              this.workbook = loadOMFiles(
                source,
                this.workbook, this.product);
            }
            if (this.product === 'RAPID TRANSFER') {
              this.workbook = loadRTFiles(
                source,
                this.workbook, this.product);
            }
            if (this.product === 'RIA') {
              this.workbook = loadRIAFiles(
                source,
                this.workbook, this.product);
            }
            if (this.product === 'SMOBILPAY') {
              this.workbook = loadSMOBPAYFiles(
                source,
                this.workbook, this.product);
            }
            if (this.product === 'ENVOIS WESTERN UNION') {
              this.workbook = loadEWUFiles(
                source,
                this.workbook, this.product);
            }
            if (this.product === 'RETRAITS WESTERN UNION') {
              this.workbook = loadRWUFiles(
                source,
                this.workbook, this.product);
            }

            this.workbook.xlsx.writeBuffer().then(printdata => {
              const blob = new Blob([printdata], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
              FileSaver.saveAs(blob, 'Rapprochement tiré le ' + new Date().toString() + '.xlsx');
              this._toastr.success('Rapprochement réussie', 'Succès', {
                timeOut: 4000
              });
              this.reset();
              // this.resetFiles();
              this.auth.fadeOut = true;
            });

          } catch (err) {
            console.log(err);
            this._toastr.error(err, 'Succès', {
              timeOut: 4000
            });

            if (this.printingOption !== 3) {
              this.reset();
              // this.resetFiles();
            }
            this.auth.fadeOut = true;
          }
        } else {
          this._toastr.warning('Aucune donnée pour cette période', 'Succès', {
            timeOut: 4000
          });
          this.auth.fadeOut = true;
        }
      });
  }

  async rapprocher() {

    this.auth.fadeOut = false;
    this.cashitdate1.setHours(0, 0, 0, 0);
    this.cashitdate2.setHours(23, 59, 0, 0);

    if (this.bdclosing === false) {
      if (this.filetypes.length > 0) {

        let request = `select * from ITTRANS where (INIDA between '${this.cashitdate1.toISOString()}'
          and '${this.cashitdate2.toISOString()}') and (`
          + this.maprequest[this.filetypes[0]];
        this.filetypes.splice(0, 1);

        this.filetypes.forEach((type) => {
          request = request + ' OR ' + this.maprequest[type];
        });
        request = request + ')';

        try {
          console.log(request);
          const cashit: Promise<any> = (await this.auth.getCashITTrans(request)).data;

          const cashitdata = await cashit;

          console.log(cashitdata);

          if (this.ftmerge.length > 0) {
            const ft = cashitdata.filter((e) => ['SENT_FT', 'RECEIVED_FT'].indexOf(e['TFST']) > -1);
            const ftrapproch = rapprocherFT(this.ftmerge, ft, 'NO REF', 'RFNB', 'MONTANT', 'SDAMINSDCU',
              'FRAIS ', 'SDFETTCINSDCU', 5, 25);
            // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
            console.log(ftrapproch);
            this.workbook = ftXLS(ftrapproch, this.workbook,
              ['DATE', 'TYPE', 'NO REF', 'MONTANT', 'FRAIS '],
              ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], this.ftmerge, ft);
          }
          if (this.mgmerge.length > 0) {
            const mg = cashitdata.filter((e) => ['SENT_MG', 'RECEIVED_MG'].indexOf(e['TFST']) > -1);
            const mgrapproch = rapprocherMG(this.mgmerge, mg, 'Reference ID', 'RFNB', 'Base Amt', 'SDAMINSDCU', 'Fee Amt', 'SDFETTCINSDCU', 5, 25);
            // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
            console.log(mgrapproch);
            this.workbook = mgXLS(mgrapproch, this.workbook,
              ['Tran Date', 'Tran Type', 'Reference ID', 'Base Amt', 'Fee Amt'],
              ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], this.mgmerge, cashitdata);
          }
          if (this.mtnmerge.length > 0) {
            const mtn = cashitdata.filter((e) => ['RECH_MOMO', 'RECEIVE_MOMO'].indexOf(e['TFST']) > -1);
            const mtnrapproch = rapprocherMOMO(this.mtnmerge, mtn);
            // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
            console.log(mtnrapproch);
            this.workbook = momoXLS(mtnrapproch, this.workbook,
              ['Date', 'TYPE', 'De', 'Ã ', 'Montant'],
              ['RFNB', 'TFST', 'simphoneFils', 'tel', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'], this.mtnmerge, cashitdata);
          }
          if (this.ommerge.length > 0) {
            const om = cashitdata.filter((e) => ['RECH_OGMO', 'RECEIVE_OGMO'].indexOf(e['TFST']) > -1);
            const omrapproch = rapprocherOM(this.ommerge, om);
            // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
            console.log(omrapproch);
            this.workbook = omXLS(omrapproch, this.workbook,
              ['Date', 'Service', 'Compte1', 'Compte2', 'Credit', 'Debit'],
              ['RFNB', 'TFST', 'simphoneFils', 'tel', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'], this.ommerge, cashitdata);
          }
          if (this.rtmerge.length > 0) {
            const rt = cashitdata.filter((e) => ['SENT_RT', 'RECEIVED_RT'].indexOf(e['TFST']) > -1);
            const rtrapproch = rapprocherRT(this.rtmerge, rt, 'RT Number', 'RFNB', 'Send Amount', 'SDAMINSDCU', 'Receiving Amount',
              'Total Fee', 'SDFETTCINSDCU', 5, 25);
            // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
            console.log(rtrapproch);
            this.workbook = rtXLS(rtrapproch, this.workbook,
              ['Payment Date', 'Transaction Status', 'RT Number', 'Send Amount', 'Receiving Amount', 'Total Fee'],
              ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], this.rtmerge, rt);
          }
          if (this.riamerge.length > 0) {
            const ria = cashitdata.filter((e) => ['SENT_RIA', 'RECEIVED_RIA'].indexOf(e['TFST']) > -1);
            const riarapproch = rapprocherRIA(this.riamerge, ria, 'PIN', 'RFNB', 'Sent Amount', 'SDAMINSDCU', 'Payment Amount',
              'CTE',
              'Customer Fee', 'SDFETTCINSDCU', 5, 25);
            // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
            console.log(riarapproch);
            this.workbook = riaXLS(riarapproch, this.workbook,
              ['Date', 'Action', 'PIN', 'Sent Amount', 'Payment Amount', 'Customer Fee', 'CTE', 'TVA1'],
              ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], this.riamerge, ria);
          }
          if (this.spymerge.length > 0) {
            const spy = cashitdata.filter((e) => ['CDE', 'CANAL', 'ENEO', 'RECHARGE'].indexOf(e['TFST']) > -1);
            const spyrapproch = rapprocherSMOBPAY(this.spymerge, spy);
            // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
            console.log(spyrapproch);
            this.workbook = smobpayXLS(spyrapproch, this.workbook,
              ['Paid At', 'Service', 'Branch', 'Amount'],
              ['numtransaction', 'TFST', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'], this.spymerge, cashitdata);
          }
          if (this.wumerge.length > 0) {
            const wu = cashitdata.filter((e) => ['SENT_WU', 'RECEIVED_WU'].indexOf(e['TFST']) > -1);
            console.log(wu);
            const wurapproch = rapprocherWU(this.wumerge, wu, 'MTCN', 'RFNB', 'principal', 'SDAMINSDCU', 'charges', 'SDFETTCINSDCU', 10, 25);
            // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
            console.log(wurapproch);
            this.workbook = wuXLS(wurapproch, this.workbook,
              ['Date', 'TYPE', 'MTCN', 'principal', 'charges'],
              ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], this.wumerge, wu);
          }
          if (this.ewumerge.length > 0) {
            const ewu = cashitdata.filter((e) => ['SENT_WU', 'ANNULATED_WU', 'REMBOURS_WU'].indexOf(e['TFST']) > -1);
            console.log(ewu);
            const ewurapproch = rapprocherWU(this.ewumerge, ewu, 'MTCN', 'RFNB', 'principal', 'SDAMINSDCU', 'charges', 'SDFETTCINSDCU', 10, 25);
            // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
            console.log(ewurapproch);
            this.workbook = wuXLS(ewurapproch, this.workbook,
              ['Date', 'TYPE', 'MTCN', 'principal', 'charges'],
              ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], this.ewumerge, ewu);
          }
          if (this.rwumerge.length > 0) {
            // this.workbook = loadRWUFiles(this.rwumerge, this.workbook, 'Retrait Western Union');
            const rwu = cashitdata.filter((e) => e['TFST'] === 'RECEIVED_WU');
            const rwurapproch = rapprocherWU(this.rwumerge, rwu, 'MTCN', 'RFNB', 'principal', 'SDAMINSDCU', 'charges', 'SDFETTCINSDCU', 5, 25);
            // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
            console.log(rwurapproch);
            this.workbook = wuXLS(rwurapproch, this.workbook,
              ['Date', 'TYPE', 'MTCN', 'principal', 'charges'],
              ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], this.rwumerge, rwu);
          }
          if (this.dhlmerge.length > 0) {
            // this.workbook = loadRWUFiles(this.rwumerge, this.workbook, 'Retrait Western Union');
            const dhl = cashitdata.filter((e) => e['TFST'] === 'DHL');
            const dhlrapproch = rapprocherDHL(this.dhlmerge, dhl, 'identifiant', 'RFNB', 'charges', 'SDFETTCINSDCU', 25);
            // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
            console.log(dhlrapproch);
            this.workbook = dhlXLS(dhlrapproch, this.workbook,
              ['Date', 'identifiant', 'sender', 'receiver', 'paysdesti', 'teldesti', 'charges'],
              ['RFNB', 'TFST', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], this.dhlmerge, dhl);
          }

          this.workbook.xlsx.writeBuffer().then(printdata => {
            const blob = new Blob([printdata], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            FileSaver.saveAs(blob, 'Rapprochement tiré le ' + new Date().toString() + '.xlsx');
            this._toastr.success('Rapprochement réussie', 'Succès', {
              timeOut: 4000
            });
            this.reset();
            this.resetFiles();
            this.auth.fadeOut = true;
          });

        } catch (err) {
          console.log(err);

          this._toastr.error('Erreur dans le chargement des données Cash-IT', 'Réduisez la période', {
            timeOut: 10000
          });

          if (this.printingOption !== 3) {
            this.reset();
            this.resetFiles();
          }
          this.auth.fadeOut = true;
        }
      }
    } else {
      console.log('------> ', this.product);
      this.auth.getItTrans(this.cashitdate1, this.cashitdate2, this.product)
        .subscribe(async (snapshot) => {
          const source = snapshot.docs.map((el) => el.data());

          console.log(source);

          // les données source

          if (source.length > 0) {

            let request = `select * from ITTRANS where (INIDA between '${this.cashitdate1.toISOString()}'
              and '${this.cashitdate2.toISOString()}') and (`
              + this.bdmaprequest[this.product];
            // this.filetypes.splice(0, 1);

            // this.filetypes.forEach((type) => {
            //   request = request + ' OR ' + this.maprequest[type];
            // });
            request = request + ')';

            // la requête de récupération des données

            try {
              console.log(request);
              const cashit: Promise<any> = (await this.auth.getCashITTrans(request)).data;

              const cashitdata = await cashit;

              console.log(cashitdata);

              if (this.product === 'FLASH TRANSFER') {
                const ft = cashitdata.filter((e) => ['SENT_FT', 'RECEIVED_FT'].indexOf(e['TFST']) > -1);
                const ftrapproch = rapprocherFT(source, ft, 'NO REF', 'RFNB', 'MONTANT', 'SDAMINSDCU',
                  'FRAIS ', 'SDFETTCINSDCU', 5, 25);
                // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
                console.log(ftrapproch);
                this.workbook = ftXLS(ftrapproch, this.workbook,
                  ['DATE', 'TYPE', 'NO REF', 'MONTANT', 'FRAIS '],
                  ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], source, ft);
              }
              if (this.product === 'MONEYGRAM') {
                const mg = cashitdata.filter((e) => ['SENT_MG', 'RECEIVED_MG'].indexOf(e['TFST']) > -1);
                const mgrapproch = rapprocherMG(source, mg, 'Reference ID', 'RFNB', 'Base Amt', 'SDAMINSDCU', 'Fee Amt', 'SDFETTCINSDCU', 5, 25);
                // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
                console.log(mgrapproch);
                this.workbook = mgXLS(mgrapproch, this.workbook,
                  ['Tran Date', 'Tran Type', 'Reference ID', 'Base Amt', 'Fee Amt'],
                  ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], source, cashitdata);
              }
              if (this.product === 'MTN MOBILE MONEY') {
                const mtn = cashitdata.filter((e) => ['RECH_MOMO', 'RECEIVE_MOMO'].indexOf(e['TFST']) > -1);
                const mtnrapproch = rapprocherMOMO(source, mtn);
                // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
                console.log(mtnrapproch);
                this.workbook = momoXLS(mtnrapproch, this.workbook,
                  ['Date', 'TYPE', 'De', 'Ã ', 'Montant'],
                  ['RFNB', 'TFST', 'simphoneFils', 'tel', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'], source, cashitdata);
              }
              if (this.product === 'ORANGE MONEY') {
                const om = cashitdata.filter((e) => ['RECH_OGMO', 'RECEIVE_OGMO'].indexOf(e['TFST']) > -1);
                const omrapproch = rapprocherOM(source, om);
                // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
                console.log(omrapproch);
                this.workbook = omXLS(omrapproch, this.workbook,
                  ['Date', 'Service', 'Compte1', 'Compte2', 'Credit', 'Debit'],
                  ['RFNB', 'TFST', 'simphoneFils', 'tel', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'], source, cashitdata);
              }
              if (this.product === 'RAPID TRANSFER') {
                const rt = cashitdata.filter((e) => ['SENT_RT', 'RECEIVED_RT'].indexOf(e['TFST']) > -1);
                const rtrapproch = rapprocherRT(source, rt, 'RT Number', 'RFNB', 'Send Amount', 'SDAMINSDCU', 'Receiving Amount',
                  'Total Fee', 'SDFETTCINSDCU', 5, 25);
                // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
                console.log(rtrapproch);
                this.workbook = rtXLS(rtrapproch, this.workbook,
                  ['Payment Date', 'Transaction Status', 'RT Number', 'Send Amount', 'Receiving Amount', 'Total Fee'],
                  ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], source, rt);
              }
              if (this.product === 'RIA') {
                const ria = cashitdata.filter((e) => ['SENT_RIA', 'RECEIVED_RIA'].indexOf(e['TFST']) > -1);
                const riarapproch = rapprocherRIA(source, ria, 'PIN', 'RFNB', 'Sent Amount', 'SDAMINSDCU', 'Payment Amount',
                  'CTE',
                  'Customer Fee', 'SDFETTCINSDCU', 5, 25);
                // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
                console.log(riarapproch);
                this.workbook = riaXLS(riarapproch, this.workbook,
                  ['Date', 'Action', 'PIN', 'Sent Amount', 'Payment Amount', 'Customer Fee', 'CTE', 'TVA1'],
                  ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], source, ria);
              }
              if (this.product === 'SMOBILPAY') {
                const spy = cashitdata.filter((e) => ['CDE', 'CANAL', 'ENEO', 'RECHARGE'].indexOf(e['TFST']) > -1);
                const spyrapproch = rapprocherSMOBPAY(source, spy);
                // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
                console.log(spyrapproch);
                this.workbook = smobpayXLS(spyrapproch, this.workbook,
                  ['Paid At', 'Service', 'Branch', 'Amount'],
                  ['numtransaction', 'TFST', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'comment'], source, cashitdata);
              }
              if (this.product === 'ENVOIS WESTERN UNION') {
                const ewu = cashitdata.filter((e) => e['TFST'] === 'SENT_WU');
                console.log(ewu);
                const ewurapproch = rapprocherWU(source, ewu, 'MTCN', 'RFNB', 'principal', 'SDAMINSDCU', 'charges', 'SDFETTCINSDCU', 5, 25);
                // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
                console.log(ewurapproch);
                this.workbook = wuXLS(ewurapproch, this.workbook,
                  ['Date', 'TYPE', 'MTCN', 'principal', 'charges'],
                  ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], source, ewu);
              }
              if (this.product === 'RETRAITS WESTERN UNION') {
                // this.workbook = loadRWUFiles(this.rwumerge, this.workbook, 'Retrait Western Union');
                const rwu = cashitdata.filter((e) => e['TFST'] === 'RECEIVED_WU');
                const rwurapproch = rapprocherWU(source, rwu, 'MTCN', 'RFNB', 'principal', 'SDAMINSDCU', 'charges', 'SDFETTCINSDCU', 5, 25);
                // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
                console.log(rwurapproch);
                this.workbook = wuXLS(rwurapproch, this.workbook,
                  ['Date', 'TYPE', 'MTCN', 'principal', 'charges'],
                  ['RFNB', 'TFST', 'SDAMINSDCU', 'SDFETTCINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], source, rwu);
              }
              if (this.product === 'DHL') {
                // this.workbook = loadRWUFiles(this.rwumerge, this.workbook, 'Retrait Western Union');
                const dhl = cashitdata.filter((e) => e['TFST'] === 'DHL');
                const dhlrapproch = rapprocherDHL(source, dhl, 'identifiant', 'RFNB', 'charges', 'SDAMINSDCU', 25);
                // this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
                console.log(dhlrapproch);
                this.workbook = dhlXLS(dhlrapproch, this.workbook,
                  ['Date', 'identifiant', 'sender', 'receiver', 'paysdesti', 'teldesti', 'charges'],
                  ['RFNB', 'TFST', 'SDAMINSDCU', 'SDIAGN', 'SDIUSFN', 'difference', 'comment'], source, dhl);
              }

              this.workbook.xlsx.writeBuffer().then(printdata => {
                const blob = new Blob([printdata], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                FileSaver.saveAs(blob, 'Rapprochement tiré le ' + new Date().toString() + '.xlsx');
                this._toastr.success('Rapprochement réussie', 'Succès', {
                  timeOut: 4000
                });
                this.reset();
                // this.resetFiles();
                this.auth.fadeOut = true;
              });

            } catch (err) {
              console.log(err);
              this._toastr.error(err, 'Succès', {
                timeOut: 4000
              });

              if (this.printingOption !== 3) {
                this.reset();
                // this.resetFiles();
              }
              this.auth.fadeOut = true;
            }
          } else {
            this._toastr.warning('Aucune donnée pour cette période', 'Succès', {
              timeOut: 4000
            });
            this.auth.fadeOut = true;
          }
        });
    }
  }

  validate() {

    try {
      if (this.progressive === true) { this.auth.fadeOut = false; }

      if (this.merge === true) {
        if (this.ftmerge.length > 0) {
          this.workbook = loadFTFiles(this.ftmerge, this.workbook, 'Flash Transfer');
        }
        if (this.mgmerge.length > 0) {
          this.workbook = loadMGFiles(this.mgmerge, this.workbook, 'Moneygram');
        }
        if (this.mtnmerge.length > 0) {
          this.workbook = loadMOMOFiles(this.mtnmerge, this.workbook, 'MTN Mobile Money');
        }
        if (this.ommerge.length > 0) {
          this.workbook = loadOMFiles(this.ommerge, this.workbook, 'Orange Money');
        }
        if (this.rtmerge.length > 0) {
          this.workbook = loadRTFiles(this.rtmerge, this.workbook, 'Rapid Transfer');
        }
        if (this.riamerge.length > 0) {
          this.workbook = loadRIAFiles(this.riamerge, this.workbook, 'RIA');
        }
        if (this.spymerge.length > 0) {
          this.workbook = loadSMOBPAYFiles(this.spymerge, this.workbook, 'SMOBIL PAY');
        }
        if (this.wumerge.length > 0) {
          this.workbook = loadWUFiles(this.wumerge, this.workbook, 'Envoi Western Union');
        }
        if (this.ewumerge.length > 0) {
          this.workbook = loadEWUFiles(this.ewumerge, this.workbook, 'Envoi Western Union');
        }
        if (this.rwumerge.length > 0) {
          this.workbook = loadRWUFiles(this.rwumerge, this.workbook, 'Retrait Western Union');
        }
        if (this.dhlmerge.length > 0) {
          this.workbook = loadDHLFiles(this.dhlmerge, this.workbook, 'DHL');
        }
        if (this.othermerge.length > 0) {
          this.workbook = loadOtherFiles(this.othermerge, this.workbook, 'Other')
        }
      }
      this.workbook.xlsx.writeBuffer().then(printdata => {
        const blob = new Blob([printdata], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        FileSaver.saveAs(blob, 'Fichier Commissions du ' + new Date().toString() + '.xlsx');
        this._toastr.success('Calcul de commission réussie', 'Succès', {
          timeOut: 4000
        });
        if (this.printingOption !== 3) {
          this.reset();
          this.resetFiles();
        }
        this.auth.fadeOut = true;
      });
    } catch (e) {
      if (this.printingOption < 3) {
        this.reset();
        this.resetFiles();
      }
      this._toastr.error('Error', e, {
        timeOut: 5000
      });
      this.auth.fadeOut = true;
    }

  }

  async chargerBD() {
    this.auth.fadeOut = false;

    const promises = [];

    this.total = this.ftmerge.length + this.mgmerge.length + this.mtnmerge.length + this.ommerge.length
      + this.rtmerge.length + this.riamerge.length + this.spymerge.length
      // + this.wumerge.length;
      + this.ewumerge.length
      + this.rwumerge.length
      + this.dhlmerge.length;
    this.progress = 0;

    if (this.wumerge.length === 0) {
      if (this.printingOption === 3) {
        if (this.ftmerge.length > 0) {
          this.ftmerge.forEach(trans => {
            promises.push(this.auth.addTrans(trans, 'NO REF').then(() => { this.progress = this.progress + 1; })
              .catch((e) => { this.auth.addTrans(trans, 'NO REF').then(() => { this.progress = this.progress + 1; }) }));
          });
        }
        if (this.mgmerge.length > 0) {
          this.mgmerge.forEach(trans => {


            const max = 3;
            let p: Promise<void> = Promise.reject();

            for (let i = 0; i < max; i++) {
              p = p.catch((e) => {
                return this.auth.addTrans(trans, 'Reference ID');
              });
            }
            p = p.then(() => { this.progress = this.progress + 1; }).catch(() => { console.log(trans['Reference ID'], ' est têtu'); });
            promises.push(p);
          });
        }
        if (this.mtnmerge.length > 0) {
          this.mtnmerge.forEach(trans => {
            const max = 3;
            let p: Promise<void> = Promise.reject();

            for (let i = 0; i < max; i++) {
              p = p.catch((e) => {
                return this.auth.addTrans(trans, 'Identifiant');
              });
            }
            p = p.then(() => { this.progress = this.progress + 1; }).catch(() => { console.log(trans['Identifiant'], ' est têtu'); });
            promises.push(p);
          });
        }
        if (this.ommerge.length > 0) {
          this.ommerge.forEach(trans => {
            const max = 3;
            let p: Promise<void> = Promise.reject();

            for (let i = 0; i < max; i++) {
              p = p.catch((e) => {
                return this.auth.addTrans(trans, 'Reference');
              });
            }
            p = p.then(() => { this.progress = this.progress + 1; }).catch(() => { console.log(trans['Reference'], ' est têtu'); });
            promises.push(p);
          });
        }
        if (this.rtmerge.length > 0) {
          this.rtmerge.forEach(trans => {
            const max = 3;
            let p: Promise<void> = Promise.reject();

            for (let i = 0; i < max; i++) {
              p = p.catch((e) => {
                return this.auth.addTrans(trans, 'RT Number');
              });
            }
            p = p.then(() => { this.progress = this.progress + 1; }).catch(() => { console.log(trans['RT Number'], ' est têtu'); });
            promises.push(p);
          });
        }
        if (this.riamerge.length > 0) {
          this.riamerge.forEach(trans => {
            const max = 3;
            let p: Promise<void> = Promise.reject();

            for (let i = 0; i < max; i++) {
              p = p.catch((e) => {
                return this.auth.addTrans(trans, 'PIN');
              });
            }
            p = p.then(() => { this.progress = this.progress + 1; }).catch(() => { console.log(trans['PIN'], ' est têtu'); });
            promises.push(p);
          });
        }
        if (this.spymerge.length > 0) {
          this.spymerge.forEach(trans => {
            const max = 3;
            let p: Promise<void> = Promise.reject();

            for (let i = 0; i < max; i++) {
              p = p.catch((e) => {
                return this.auth.addTrans(trans, 'PTN');
              });
            }
            p = p.then(() => { this.progress = this.progress + 1; }).catch(() => { console.log(trans['PTN'], ' est têtu'); });
            promises.push(p);
          });
        }
        if (this.wumerge.length > 0) {
          this._toastr.warning('Vous devez charger le fichier de commission', 'Succès', {
            timeOut: 10000
          });
        }
        if (this.ewumerge.length > 0) {
          this.ewumerge.forEach(trans => {
            const max = 3;
            let p: Promise<void> = Promise.reject();

            for (let i = 0; i < max; i++) {
              p = p.catch((e) => {
                return this.auth.addTrans(trans, 'wuId');
              });
            }
            p = p.then(() => { this.progress = this.progress + 1; }).catch(() => { console.log(trans['MTCN'], ' est têtu'); });
            promises.push(p);
          });
        }
        if (this.rwumerge.length > 0) {
          this.rwumerge.forEach(trans => {
            const max = 3;
            let p: Promise<void> = Promise.reject();

            for (let i = 0; i < max; i++) {
              p = p.catch((e) => {
                return this.auth.addTrans(trans, 'wuId');
              });
            }
            p = p.then(() => { this.progress = this.progress + 1; }).catch(() => { console.log(trans['MTCN'], ' est têtu'); });
            promises.push(p);
          });
        }
        if (this.dhlmerge.length > 0) {
          this.dhlmerge.forEach(trans => {
            const max = 3;
            let p: Promise<void> = Promise.reject();

            for (let i = 0; i < max; i++) {
              p = p.catch((e) => {
                return this.auth.addTrans(trans, 'identifiant');
              });
            }
            p = p.then(() => { this.progress = this.progress + 1; }).catch(() => { console.log(trans['identifiant'], ' est têtu'); });
            promises.push(p);
          });
        }

        await Promise.all(promises);

        this.workbook = new Excel.Workbook();

        this.validate();

        this._toastr.success('Chargement en BD réussie pour ' + this.progress + ' transactions', 'Succès', {
          timeOut: 6000
        });

        this.resetFiles();

      }
    } else {
      this.auth.fadeOut = true;
      this._toastr.error('Erreur', 'Vous devez charger les fichiers de commission Western Union', {
        timeOut: 10000
      });
      this.resetFiles();
    }



  }

  async genererStats() {

    this.auth.fadeOut = false;

    this.cashitdate1.setHours(1, 0, 0, 0);
    this.cashitdate2.setHours(23, 59, 0, 0);

    try {

      const stats = (await (this.auth.getStats(this.cashitdate1, this.cashitdate2))).data;

      console.log(stats);

      const relevant = await (stats);

      console.log(relevant);

      const wb: Excel.Workbook = printStats(relevant);
      wb.xlsx.writeBuffer().then(printdata => {
        const blob = new Blob([printdata], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        FileSaver.saveAs(blob, 'Statistiques entre ' + this.cashitdate1.toISOString() + ' et ' + this.cashitdate2.toISOString() + '.xlsx');
        this._toastr.success('Succès', 'Extraction réussie', {
          timeOut: 4000
        });
        this.auth.fadeOut = true;
      });

    } catch (e) {
      console.log(e);
      this.auth.fadeOut = true;
      this.reset();
    }

  }

  async getManquants() {
    this.auth.fadeOut = false;

    this.cashitdate1.setHours(1, 0, 0, 0);
    this.cashitdate2.setHours(23, 59, 0, 0);

    const request = `SELECT pointID, libelle, type, datemDiffCaisseKO, diffCaisseKO FROM ITCaisse  where (datemDiffCaisseKO between '${this.cashitdate1.toISOString()}'
            and '${this.cashitdate2.toISOString()}') order by datemDiffCaisseKO DESC`;

    try {
      console.log(request);
      const cashit = (await this.auth.getCashITTrans(request)).data;

      console.log(cashit);

      const relevant = cashit.map((e) => {
        // console.log('--> ', e['datemDiffCaisseKO']);
        // e['datemDiffCaisseKO'] = e['datemDiffCaisseKO'].toString();
        // console.log('++> ', e['datemDiffCaisseKO']);
        const f = e['libelle'].split('_');
        e['agence'] = f[0];
        e['itesse'] = f[1];
        delete e['libelle'];
        return e;
      });

      console.log(relevant);

      const wb: Excel.Workbook = loadOtherFiles(relevant, new Excel.Workbook(), 'Manquants');

      wb.xlsx.writeBuffer().then(printdata => {
        const blob = new Blob([printdata], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        FileSaver.saveAs(blob, 'Rapport de Manquants entre ' + this.cashitdate1.toISOString() + ' et ' + this.cashitdate2.toISOString() + '.xlsx');
        this._toastr.success('Succès', 'Extraction réussie', {
          timeOut: 4000
        });
        this.auth.fadeOut = true;
        this.reset();
      });
    } catch (e) {
      console.log(e);
      this.auth.fadeOut = true;
      this.reset();
    }
    
  }

  reset() {
    this.ftmerge = [];
    this.mgmerge = [];
    this.mtnmerge = [];
    this.ommerge = [];
    this.rtmerge = [];
    this.riamerge = [];
    this.spymerge = [];
    this.wumerge = [];
    this.ewumerge = [];
    this.rwumerge = [];
    this.dhlmerge = [];
    this.othermerge = [];

    this.filetypes = [];

    this.workbook = new Excel.Workbook();

    this.total = 1;
    this.progress = 0;

    this.product = '';
  }

  resetFiles() {
    this.fileSelector.nativeElement.value = '';
    this.reset();
  }

  async extractTMGlobal() {
    this.auth.fadeOut = false;
    this.cashitdate1.setHours(1, 0, 0, 0);
    this.cashitdate2.setHours(23, 59, 0, 0);

    this.auth.getItTrans(this.cashitdate1, this.cashitdate2) // l'ensemble des produits
      .subscribe(async (snapshot) => {

        const types = new Set();

        const source = snapshot.docs.map((el) => {
          const data = el.data();
          data['Date'] = data['Date'].toDate();
          types.add(data['type']);
          return data;
        });

        console.log(source); // so far so good

        this.workbook = new Excel.Workbook();

        // les données source

        if (source.length > 0 && types.size > 0) {

          this.filetypes = new Array(...types);

          console.log(this.filetypes);

          let request = `select * from ITTRANS where (INIDA between '${this.cashitdate1.toISOString()}'
            and '${this.cashitdate2.toISOString()}') and (`
            + this.bdmaprequest[this.filetypes[0]];
          this.filetypes.splice(0, 1);

          this.filetypes.forEach((type) => {
            request = request + ' OR ' + this.bdmaprequest[type];
          });
          request = request + ')';

          try {
            console.log(request);
            const cashit: Promise<any> = (await this.auth.getCashITTrans(request)).data;

            const cashitdata = await cashit;

            console.log(cashitdata);

            const result = rapprocherGlobal(source, types, this.workbook, cashitdata);

            this.workbook = printRapprochement(result);

            this.workbook.xlsx.writeBuffer().then(printdata => {
              const blob = new Blob([printdata], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
              FileSaver.saveAs(blob, 'Synthèse des rapprochements CashIT et PLATEFORMES entre le ' + this.cashitdate1.toISOString()
                + ' et le ' + this.cashitdate2.toISOString() + '.xlsx');
              this._toastr.success('Rapprochement réussie', 'Succès', {
                timeOut: 4000
              });
              this.reset();
              // this.resetFiles();
              this.auth.fadeOut = true;
            });

          } catch (err) {
            console.log(err);

            this._toastr.error('Erreur dans le chargement des données Cash-IT', err, {
              timeOut: 10000
            });

            if (this.printingOption !== 3) {
              this.reset();
            }
            this.auth.fadeOut = true;
          }
        } else {
          this._toastr.warning('Aucune donnée pour cette période', 'Succès', {
            timeOut: 4000
          });
          if (this.printingOption !== 3) {
            this.reset();
          }
          this.auth.fadeOut = true;
        }
      });
  }

}
