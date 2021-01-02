import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {

  fonction = 0;

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.fonction = this.auth.user.fonction;
    this.auth.fadeOut = true;

    console.log(this.auth.user);
  }

}
