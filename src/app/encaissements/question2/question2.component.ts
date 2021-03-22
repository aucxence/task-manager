import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CashinService } from 'src/app/shared/cashin.service';

@Component({
  selector: 'app-question2',
  templateUrl: './question2.component.html',
  styleUrls: ['./question2.component.scss']
})
export class Question2Component implements OnInit {

  niveauAgence = "0";

  constructor(private cashin: CashinService, private router: Router,  private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  toString() {
    try {
      const num = +this.niveauAgence.split(',').join('');
    this.niveauAgence = (this.commafy(num) !== 'NaN' ? this.commafy(num) : '');
    } catch (e) {
      this.niveauAgence = '';
    }
  }

  commafy(num: number) {
    var str = num.toString().split('.');
    if (str[0].length >= 5) {
      str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if (str[1] && str[1].length >= 5) {
      str[1] = str[1].replace(/(\d{3})/g, '$1 ');
    }
    return str.join('.');
  }

  evaluer() {
    const num = +this.niveauAgence.split(',').join('');
    console.log(num);
    this.cashin.setNiveauAgence(num);
    this.router.navigate(['Q3'], {
      relativeTo: this.route.parent
    });
  }

}
