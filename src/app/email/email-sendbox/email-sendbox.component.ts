import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-email-sendbox',
  templateUrl: './email-sendbox.component.html',
  styleUrls: ['./email-sendbox.component.scss']
})
export class EmailSendboxComponent implements OnInit {

  mails: any[] = [];

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.auth.fadeOut = false;
    this.auth.getSentMails(this.auth.user.email).subscribe((changes) => {
      this.mails = changes.docs.map((e) => e.data());
      this.auth.fadeOut = true;
    });
  }

  selectEmail(mail: any) {
    this.router.navigate(['read'], { relativeTo: this.route.parent, queryParams: mail });
  }

}
