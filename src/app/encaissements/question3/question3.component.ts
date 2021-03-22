import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CashinService } from 'src/app/shared/cashin.service';

@Component({
  selector: 'app-question3',
  templateUrl: './question3.component.html',
  styleUrls: ['./question3.component.scss']
})
export class Question3Component implements OnInit {

  plafondAgence = "0";

  constructor(private cashin: CashinService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  toString() {
    try {
      const num = +this.plafondAgence.split(',').join('');
    this.plafondAgence = (this.commafy(num) !== 'NaN' ? this.commafy(num) : '');
    } catch (e) {
      this.plafondAgence = '';
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
    const num = +this.plafondAgence.split(',').join('');
    console.log(num);
    this.cashin.setPlafondAgence(num);
    const date = new Date();
    date.setHours(16, 0, 0, 0);
    this.router.navigate(
      (this.cashin.plafondAgence > this.cashin.niveauAgence && new Date().getTime() < date.getTime()) 
        ? ['Q4'] : ['results'], {
          relativeTo: this.route.parent
        });
  }

}
