import { Component, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { CompleterData, CompleterItem, CompleterService } from 'ng2-completer';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-email-sender',
  templateUrl: './email-sender.component.html',
  styleUrls: ['./email-sender.component.scss']
})
export class EmailSenderComponent implements OnInit {

  template = 'Salutation<hr>Quel est le probl&#232;me? Que lui est-il reproch&#233;?<hr>Que faut-il faire? Attendez-vous une r&#233;ponse?<p><br></p>';
  copie = 'aucxence@yahoo.fr, instant.transfer@yahoo.fr, sandra.edjongo@instant-transfer.com, gaetan.nkema@instant-transfer.com, boris.pouna@instant-transfer.com, martin.pempem@instant-transfer.com';

  emailcontent: string = this.template;
  sendTo: any = {};
  sendToName: string = '';
  topic: string = '';
  motif = '';

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
    ],
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  };

  dataService: CompleterData;

  localallusers: any[] = []

  constructor(private completerService: CompleterService, private auth: AuthService, private _toastr: ToastrService) { }

  ngOnInit(): void {
    this.auth.GetAllUsers().then((changes) => {
      changes.pipe((take(1))).subscribe(userlist => {
        this.localallusers = userlist.map(user => {
          // console.log(user.payload.doc.data());
          const usr = user.payload.doc.data() as User;
          return usr;
        });

        this.localallusers = this.localallusers.map(user => {
          return {
            ...user,
            fullname: user.firstname + ' ' + user.lastname
          };
        });

        // console.log('~~~~' + newlist.length);
        // console.log(this.localallusers);

        this.dataService = this.completerService.local(this.localallusers, 'firstname,lastname,email', 'fullname');

        // this.localallusers = this.localallusers.map((user) => {
        //   return user.id;
        // });

        // console.log(this.localallusers);

      });
    });
  }

  public updateSendTo(selectedItem: CompleterItem) {
    if (selectedItem) {
      this.sendTo = selectedItem.originalObject;
    }
  }

  reunion() {
    if (this.motif === 'Absence à la réunion') {
      this.emailcontent = "<p><span>Par ce mail, la direction d'Instant Transfer vous informe que vous &#234;tes sanctionn&#233;(e) pour avoir manqu&#233; &#224; la r&#233;union mensuelle du mois dernier.&#160;</span><br></p><p>Si vous pensez &#234;tre victime d'une erreur ou alors pensez avoir pr&#233;venu et obtenu permission &#224; l'avance, pri&#232;re de r&#233;pondre &#224; ce mail dans les plus bref d&#233;lais.&#160;</p><p>Cordialement.&#160;</p>";
      this.topic = 'Absence à la réunion mensuelle';
    } else {
      this.topic = '';
      this.emailcontent = '';
    }
  }

  async validate() {

    this.auth.fadeOut = false;

    const penalite = {
      'Absence au travail': 5,
      'Demande d\'explication': 3,
      'Absence à la réunion': 10,
      'Avertissement': 5,
      'Blame': 10,
      'Mise à pied 1 jour': 15,
      'Mise à pied 2 jours': 15,
      'Mise à pied 3 jours': 15,
      'Mise à pied 4 jours': 15,
      'Mise à pied 5 jours': 15,
      'Mise à pied 6 jours': 15,
      'Mise à pied 7 jours': 15,
      'Mise à pied 8 jours': 15,
      'Mise à pied 9 jours et plus': 15,
    };

    const date = new Date();
    date.setHours(18, 0, 0, 0);

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);
    deadline.setHours(18, 0, 0, 0);

    const mail = {
      type: 'mail',
      to: this.sendTo.id,
      toName: this.sendTo.fullname,
      toEmail: this.sendTo.email,
      toFunction: this.sendTo.fonction,

      by: this.auth.user.id,
      byName: this.auth.user.firstname + ' ' + this.auth.user.lastname,
      byEmail: this.auth.user.email,

      topic: this.topic,

      motif: this.motif,

      needsdero: (['Demande d\'explication', 'Absence à la réunion', 'Absence au travail'].indexOf(this.motif) > -1) ? true : false,
      date: date.toString(),
      deadline: deadline.toString(),

      judged: (['Demande d\'explication', 'Absence à la réunion', 'Absence au travail'].indexOf(this.motif) > -1) ? false : true,
      pardoned: false,

      cc: this.copie,

      body: this.emailcontent,

      penalty: penalite[this.motif],
      toshowto: [...this.copie.split(','), this.sendTo.email, this.auth.user.email],
      wasread: false,
      wasreadDate: new Date(),
      discipline: this.sendTo.discipline ?? []
    };

    console.log(mail);

    try {
      await this.auth.mailProcess(mail);
      this._toastr.success('Rapprochement réussie', 'Succès', {
        timeOut: 4000
      });
    } catch (e) {
      this._toastr.error('Erreur', e, {
        timeOut: 10000
      });
    } finally {
      this.auth.fadeOut = true;
      this.reset();
    }

  }



  reset() {
    this.emailcontent = this.template;
    this.sendTo = {};
    this.sendToName = '';
    this.topic = '';
    this.motif = '';
  }

}
