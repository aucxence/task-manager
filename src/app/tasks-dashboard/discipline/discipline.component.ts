import { Component, OnInit } from '@angular/core';
import { CompleterData, CompleterService, CompleterItem } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { ControleNote } from 'src/app/models/controle-note';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-discipline',
  templateUrl: './discipline.component.html',
  styleUrls: ['./discipline.component.scss']
})
export class DisciplineComponent implements OnInit {

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
  constructor(private auth: AuthService, private _toastr: ToastrService) { }

  ngOnInit(): void {

    this.fadeOut = false;
    this.auth.snapshotAllUsers().subscribe(userlist => {
      this.allusers = userlist.map(user => {
        // console.log(user.payload.doc.data());
        const usr = user.payload.doc.data() as User;
        // console.log(usr.firstname);
        return usr;
      });
      this.singleOutItesses();
      this.singleOutNonItesses();
      this.auth.fadeOut = true;

    });
  }

  // deleteUserControle = (user: User, j: number) => {
  //   user.notes.splice(j, 1);
  //   this.auth.updateEvaluation(user)
  //     .then((response) => {
  //       console.log(response.message);
  //       this.auth.fadeOut = true;
  //       this._toastr.success('Suppression réussie', 'Succès', {
  //         timeOut: 1000
  //       });
  //     })
  //     .catch((err) => {
  //       this.auth.fadeOut = true;
  //       this._toastr.error(err.message, err.code, {
  //         timeOut: 2000
  //       });
  //     });
  // }

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

  // deleteControle(controledPerson, index) {

  //   console.log('at least');

  //   this.auth.fadeOut = false;
  //   this.fadeOut = false;

  //   const nt = controledPerson.notes.splice(index, 1)[0];

  //   this.controle = new ControleNote();
  //   this.controledPerson = new User();
  //   this.controller = new User();

  //   console.log(nt);

  //   this.auth.batchDeleteControle(controledPerson, nt).then(() => {
  //     this._toastr.success('Suppression faite', 'Succès', {
  //       timeOut: 1000
  //     });
  //   }).catch((e) => {
  //     this.controle = new ControleNote();
  //     this.controledPerson = new User();
  //     this.controller = new User();

  //     this.auth.fadeOut = true;
  //     this.fadeOut = true;

  //     this._toastr.error(e.message, e.code, {
  //       timeOut: 2000
  //     });
  //   });
  // }

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
