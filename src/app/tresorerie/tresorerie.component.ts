import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import * as XLSX from 'xlsx';
import { uploadEWU } from '../chargement/produits/western_union';
import { rapprocherWU, uploadActiviteWU, uploadRWU, wuXLS } from './rapprochements/western union';
import * as Excel from 'exceljs';
import * as FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { momoXLS, rapprocherMOMO, uploadCxMOMO } from './rapprochements/mtn_money';
import { uploadMOMO } from '../chargement/produits/mtn_money';
import { Papa } from 'ngx-papaparse';

@Component({
  selector: 'app-tresorerie',
  templateUrl: './tresorerie.component.html',
  styleUrls: ['./tresorerie.component.scss']
})
export class TresorerieComponent implements OnInit {

  @ViewChild('firstSelector')
  firstSelector: ElementRef;

  @ViewChild('secondSelector')
  secondSelector: ElementRef;

  @ViewChild('firstSelectorm')
  firstSelectorm: ElementRef;

  @ViewChild('secondSelectorm')
  secondSelectorm: ElementRef;

  progressive = false;
  filetypes = [];

  first = [];
  second = [];

  momofees: any = {};

  workbook: Excel.Workbook;

  constructor(public auth: AuthService, private papa: Papa, private _toastr: ToastrService) { }

  ngOnInit(): void {
    this.workbook = new Excel.Workbook();
    this.auth.fadeOut = true;
    this.auth.getMoMoCommissions().subscribe((snapshot) => {
      snapshot.docs.forEach((element) => this.momofees[element.id] = element.data());
    });
  }

  async incomingfile(event) {

    this.auth.fadeOut = false;

    const promises = [];

    const files: File[] = event.target.files;

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

          if (json.length > 0) {
            if (json[0]['Account'] && json[0]['Legacy ID'] && json[0]['Base Amt'] === undefined) {

            } else if (json[1] && json[1]['Rapport d\'Activité par Site']) {
              console.log('C\'est un WU');
              if (this.filetypes.indexOf('Western Union Activité') === -1) {
                this.filetypes.push('Western Union Activité');
                const js: any = await uploadActiviteWU(file, this.auth.currentUser.uid,
                  this.auth.user.firstname + ' ' + this.auth.user.lastname,
                  file.name);
                this.first = [...this.first, ...js];
                console.log('=====================================');
                console.log(this.first);
                console.log('=====================================');
              }
            } else if (json[0]['DATE'] && json[0]['DESTINATION'] && json[0]['DEVISE ']
              && json[0]['FRAIS '] && json[0]['HEURE'] && json[0]['MONTANT']
              && json[0]['N0 ENVOI'] && json[0]['NO REF'] && json[0]['TYPE']) {

            } else if (json[0]['SC Order Number']
              || json[0]['SC Order Number,PIN,Delivery Method,Teller,Branch,Branch Code,Reconciliation Branch,Reconciliation Branch Code,Sent Amount,Sending Currency,Country From,Country to,Payment Amount,Beneficiary Currency,Commission Amount,Commission Currency,SA Commission Amount,SA Commission Currency,Date,Rate,CTE,TVA1,Customer Fee,Action']) {

            } else if (json[0]['RT Number']) {

            } else if (json[0]['Payment Report'] && json[0]['Report Type']) {

            } else if (json[4] && json[4]['Commission Par pays - Transferts Envoyés']) {

              console.log('C\'est un EWU');
              if (this.filetypes.indexOf('CX EWU') === -1) {
                this.filetypes.push('CX EWU');
              }

              const js: any = await uploadEWU(file, this.auth.currentUser.uid,
                this.auth.user.firstname + ' ' + this.auth.user.lastname, file.name);
              console.log(js);

              this.second = [...this.second, ...js];

            } else if (json[0]['__EMPTY_13'] && json[4]['Commission Par pays - Transferts Reçus']) {

              console.log('C\'est un RWU');
              if (this.filetypes.indexOf('CX RWU') === -1) {
                this.filetypes.push('CX RWU');
              }

              const js: any = await uploadRWU(file, this.auth.currentUser.uid,
                this.auth.user.firstname + ' ' + this.auth.user.lastname, file.name);
              console.log(js);

              this.second = [...this.second, ...js];

            } else if (json[0]['Relevé de vos opérations'] || (json[0]['__EMPTY'] === 'Relevé de vos opérations')) {

            } else if ((json[0]['Date']
              && json[0]['Currency'] && json[0]['Status']
              && json[0]['Currency_5'] && json[0]['To Handler Name']
              && json[0]['Type'] !== 'Commissioning')
              ||
              (json[0]
              &&  json[0]['Date']
              && json[0]['Devise']
              && json[0]['Statut']
              && json[0]['Type'] !== 'Mise en Service')) {

              console.log('C\'est un MOMO');
              if (this.filetypes.indexOf('MTN MoMo') === -1) {
                this.filetypes.push('Activite MoMo');
              }

              console.log(file.name);

              const js: any = await uploadMOMO(file, this.auth.currentUser.uid,
                this.auth.user.firstname + ' ' + this.auth.user.lastname,
                this.momofees, file.name);
              console.log(js);

              this.first = [...this.first, ...js];

              console.log('--> ', this.first.length);
            } else if (json[0]['Type'] === 'Mise en Service' || json[0]['Type'] === 'Commissioning'
              || json[0]['Id,"External Transaction Id","Date","Status","Type","Provider Category","Information","Note/Message","From","From Name","From Handler Name","To","To Name","To Handler Name","Initiated By","On Behalf Of","Amount","Currency","Fee","Currency","Discount","Currency","Promotion","Currency","Coupon","Currency","Balance","Currency"']) {
              console.log('C\'est un Cx MOMO');
              if (this.filetypes.indexOf('MTN MoMo') === -1) {
                this.filetypes.push('CX MoMo');
              }

              console.log(file.name);

              const js: any = await uploadCxMOMO(file, this.papa, this.auth.currentUser.uid,
                this.auth.user.firstname + ' ' + this.auth.user.lastname,
                file.name);
              console.log(js);

              this.second = [...this.second, ...js];
              
              console.log('--> ', this.second.length);
            } else {
              console.log('fichier non reconnu');
            }

          }

          this.auth.fadeOut = true;

          resolve(true);

        };

        fileReader.readAsArrayBuffer(file);

      }));

    }



  }

  rapprochWU() {

    this.auth.fadeOut = false;

    this.workbook = new Excel.Workbook();

    try {
      console.log(this.first);
      console.log('---------');
      console.log(this.second);
      console.log('---------');
      const result = rapprocherWU(this.first, this.second, 'wuId Activité', 'wuId',
        'principal Activité', 'principal', 'charges Activité', 'charges', 25, 25);
      console.log(result);

      console.log(result);
      this.workbook = wuXLS(result, this.workbook,
        ['wuId Activité', 'Date Activité', 'TYPE Activité', 'MTCN Activité', 'principal Activité', 'charges Activité'],
        ['wuId', 'Date', 'TYPE', 'MTCN', 'principal', 'charges', 'HTComm', 'difference', 'comment'], this.first, this.second);

      this.workbook.xlsx.writeBuffer().then(printdata => {
        const blob = new Blob([printdata], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        FileSaver.saveAs(blob, 'Rapprochement Activité Commissions Western tiré le ' + new Date().toString() + '.xlsx');
        this._toastr.success('Rapprochement réussie', 'Succès', {
          timeOut: 4000
        });
        this.resetWUFiles();
        this.auth.fadeOut = true;
      });
    } catch (e) {
      this._toastr.success(e, 'Error', {
        timeOut: 4000
      });
      this.resetWUFiles();
      this.auth.fadeOut = true;
    }
  }

  rapprochMOMO() {

    this.auth.fadeOut = false;

    this.workbook = new Excel.Workbook();

    try {
      console.log(this.first);
      console.log('---------');
      console.log(this.second);
      console.log('---------');
      const result = rapprocherMOMO(this.first, this.second, 'Identifiant', 'Identifiant Cx',
        'CommTTC', 'CommTTC Cx', 1);
      console.log(result);

      this.workbook = momoXLS(result, this.workbook,
        ['Identifiant', 'Date', 'TYPE', 'De', 'Ã ', 'Montant', 'CommTTC'],
        ['Identifiant Cx', 'CommTTC Cx', 'difference', 'comment'], this.first, this.second);

      this.workbook.xlsx.writeBuffer().then(printdata => {
        const blob = new Blob([printdata], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        FileSaver.saveAs(blob, 'Rapprochement Activité Commissions MOMO tiré le ' + new Date().toString() + '.xlsx');
        this._toastr.success('Rapprochement réussie', 'Succès', {
          timeOut: 4000
        });
        this.resetMMFiles();
        this.auth.fadeOut = true;
      });
    } catch (e) {
      this._toastr.success(e, 'Error', {
        timeOut: 4000
      });
      this.resetMMFiles();
      this.auth.fadeOut = true;
    }
  }

  resetWUFiles() {
    this.firstSelector.nativeElement.value = '';
    this.secondSelector.nativeElement.value = '';
    this.first = [];
    this.second = [];
  }

  resetMMFiles() {
    this.firstSelectorm.nativeElement.value = '';
    this.secondSelectorm.nativeElement.value = '';
    this.first = [];
    this.second = [];
  }

  resetMMFile1() {
    this.firstSelectorm.nativeElement.value = '';
    this.first = [];
  }

  resetMMFile2() {
    this.secondSelectorm.nativeElement.value = '';
    this.second = [];
  }

  resetWUFile1() {
    this.firstSelector.nativeElement.value = '';
    this.first = [];
  }

  resetWUFile2() {
    this.secondSelector.nativeElement.value = '';
    this.second = [];
  }

}
