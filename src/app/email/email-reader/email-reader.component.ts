import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-email-reader',
  templateUrl: './email-reader.component.html',
  styleUrls: ['./email-reader.component.scss']
})
export class EmailReaderComponent implements OnInit {

  mail: any;

  config: AngularEditorConfig = {
    editable: false,
    spellcheck: true,
    height: '30rem',
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
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ]
  };

  constructor(private activatedroute: ActivatedRoute) {
    this.activatedroute.queryParams.subscribe(mail => {
      console.log(mail);
      this.mail = mail;
    });
  }

  ngOnInit(): void {
  }

}
