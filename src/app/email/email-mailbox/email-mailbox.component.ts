import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-email-mailbox',
  templateUrl: './email-mailbox.component.html',
  styleUrls: ['./email-mailbox.component.scss']
})
export class EmailMailboxComponent implements OnInit {

  mails: any[] = [];

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.auth.fadeOut = false;
    this.auth.getMails(this.auth.user.email).subscribe((changes) => {
      this.mails = changes.map((e) => e.payload.doc.data());
      this.auth.fadeOut = true;
    });
  }

  selectEmail(mail: any) {
    this.router.navigate(['read'], { relativeTo: this.route.parent, queryParams: mail });
  }

}
