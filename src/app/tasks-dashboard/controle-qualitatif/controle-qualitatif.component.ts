import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CompleterData, CompleterItem, CompleterService } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { ControleNote } from 'src/app/models/controle-note';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-controle-qualitatif',
  templateUrl: './controle-qualitatif.component.html',
  styleUrls: ['./controle-qualitatif.component.scss']
})
export class ControleQualitatifComponent implements OnInit {

  allusers: User[] = [];
  itesses: User[] = [];
  nonitesses: User[] = [];
  fadeOut = false;
  dataService: CompleterData;
  agenceService: CompleterData;

  agencelist: any[] = [];

  controle: ControleNote = new ControleNote();

  controledPerson: User = new User();
  controller: User = new User();

  fonctions = {
    0: 'Itesse Stagiaire',
    250: 'Itesse Confirmée',
    500: 'Itesse Principale',
    750: 'Itesse Avec Fonctions Supplémentaires',
    1000: 'Electronicien',
    1250: 'Controlleur Stagiaire',
    1500: 'Controlleur',
    1750: 'Comptable Stagiaire',
    2000: 'Comptable',
    2250: 'Chef Itesse',
    2500: 'Chef Comptable',
    5000: 'Fonctions plus élevées'
  };

  // tslint:disable-next-line: variable-name
  constructor(private auth: AuthService, private _toastr: ToastrService,
    private completerService: CompleterService) { }

  ngOnInit(): void {

    // this.fadeOut = false;
    this.auth.snapshotAllUsers().subscribe(userlist => {
      this.allusers = userlist.map(user => {
        // console.log(user.payload.doc.data());
        const usr = user.payload.doc.data() as User;
        // console.log(usr.firstname);
        return usr;
      });
      this.singleOutItesses();
      this.singleOutNonItesses();

      const theseusers = this.allusers.map(user => {
        return {
          ...user,
          fullname: user.firstname + ' ' + user.lastname
        };
      });

      this.dataService = this.completerService.local(theseusers, 'firstname,lastname,email', 'fullname');

      this.auth.GetAllAgences().subscribe(agencelist => {
        this.agencelist = agencelist.docs.map((agence) => agence.data());

        this.agenceService = this.completerService.local(this.agencelist, 'SDIAGN', 'SDIAGN');

        this.fadeOut = true;
        this.auth.fadeOut = true;
      });
    });
  }

  blurring = () => {
    console.log('at least' + this.controle.whoname);
    if (this.controle.whoname !== undefined) {
      if (this.controle.whoname.length <= 3) {
        // this.controledPerson.firstname = '';
        this.controle.whoname = '';
        this.controle.who = '';
      }
    }
  }

  blurring3 = () => {
    console.log('at least' + this.controle.agence);
    if (this.controle.agence !== undefined) {
      if (this.controle.agence.length <= 3) {
        // this.controledPerson.firstname = '';
        this.controle.agence = '';
      }
    }
  }

  // annulation et remboursement à enlever

  blurring2 = () => {
    console.log('at least' + this.controle.doneby);
    if (this.controle.doneby !== undefined) {
      if (this.controle.doneby.length <= 3) {
        // this.controller.firstname = '';
        this.controle.doneby = '';
        this.controle.donebyid = '';
      }
    }
  }

  setToDate(event) {
    console.log(event);
    return new Date(event);
  }

  setSelectedControlledPerson = (selectedItem: CompleterItem) => {
    // console.log('at least');
    if (selectedItem) {
      // tslint:disable-next-line: forin
      // for (const prop in this.controledPerson) {
      //   this.controledPerson[prop] = selectedItem.originalObject[prop];
      //   console.log(this.controledPerson[prop]);
      // }
      // this.controledPerson = selectedItem.originalObject;
      this.controle.who = selectedItem.originalObject.id;
      this.controledPerson = selectedItem.originalObject;
      console.log(this.controledPerson.id);
    } else {
      console.log('ok ok');
      this.controledPerson.firstname = '';
      this.controle.who = '';
    }
  }

  setSelectedController = (selectedItem: CompleterItem) => {
    // console.log('at least');
    if (selectedItem) {
      this.controller = selectedItem.originalObject;
      this.controle.donebyid = selectedItem.originalObject.id;
      this.controle.doneby = selectedItem.originalObject.firstname + ' ' + selectedItem.originalObject.lastname;
    } else {
      this.controledPerson.firstname = '';
      this.controle.donebyid = '';
      this.controle.doneby = '';
    }
  }

  setSelectedAgence = (selectedItem: CompleterItem) => {
    // console.log('at least');
    if (selectedItem) {
      this.controle.agence = selectedItem.originalObject.SDIAGN;
    } else {
      this.controle.agence = '';
    }
  }

  deleteUserControle = (user: User, j: number) => {
    user.notes.splice(j, 1);
    this.auth.updateEvaluation(user)
      .then((response) => {
        console.log(response.message);
        this.auth.fadeOut = true;
        this._toastr.success('Suppression réussie', 'Succès', {
          timeOut: 1000
        });
      })
      .catch((err) => {
        this.auth.fadeOut = true;
        this._toastr.error(err.message, err.code, {
          timeOut: 2000
        });
      });
  }

  toggleEvaluationStatus = (user: User) => {

    this.auth.fadeOut = false;

    this.auth.updateEvaluation(user)
      .then((response) => {
        console.log(response.message);
        this.auth.fadeOut = true;
        this._toastr.success('Opération réussie', 'Succès', {
          timeOut: 1000
        });
      })
      .catch((err) => {
        this.auth.fadeOut = true;
        this._toastr.error(err.message, err.code, {
          timeOut: 2000
        });
      });
  }

  singleOutItesses() {
    this.itesses = this.allusers.filter((user) => {
      console.log(user.fonction);
      return (+user.fonction) < 1000;
    });
  }

  singleOutNonItesses() {
    this.nonitesses = this.allusers.filter((user) => {
      return (+user.fonction) >= 1000;
    });
  }

  renewModel() {
    console.log('renewing');
    this.controle = new ControleNote();
    this.controledPerson = new User();
    this.controller = new User();

    this.controle.doneby = this.auth.currentUser.displayName;
    this.controle.donebyid = this.auth.currentUser.uid;
  }

  deleteControle(controledPerson, index) {

    console.log('at least');

    this.auth.fadeOut = false;
    this.fadeOut = false;

    const nt = controledPerson.notes.splice(index, 1)[0];

    this.controle = new ControleNote();
    this.controledPerson = new User();
    this.controller = new User();

    console.log(nt);

    this.auth.batchDeleteControle(controledPerson, nt).then(() => {
      this._toastr.success('Suppression faite', 'Succès', {
        timeOut: 1000
      });
    }).catch((e) => {
      this.controle = new ControleNote();
      this.controledPerson = new User();
      this.controller = new User();

      this.auth.fadeOut = true;
      this.fadeOut = true;

      this._toastr.error(e.message, e.code, {
        timeOut: 2000
      });
    });
  }

  submitControle() {
    this.fadeOut = false;
    const controlling = this.controle.toJSON();
    console.log(controlling);
    if (controlling.total > 0 && this.controle.whoname.length > 0 && this.controle.doneby.length > 0 && this.controle.agence.length > 0) {
      this.auth.batchRegisterControles(this.controledPerson, controlling).then(() => {

        this.controle = new ControleNote();
        this.controledPerson = new User();
        this.controller = new User();

        this.fadeOut = true;

        this.auth.fadeOut = true;
        this._toastr.success('Contrôle ajouté', 'Succès', {
          timeOut: 1000
        });
      }).catch((err) => {

        this.controle = new ControleNote();
        this.controledPerson = new User();
        this.controller = new User();

        this.fadeOut = true;

        this._toastr.error(err.message, err.code, {
          timeOut: 2000
        });
      });
    } else {
      this._toastr.error('Finissez de remplir le formulaire', 'Erreur', {
        timeOut: 1000
      });
    }
  }

}
