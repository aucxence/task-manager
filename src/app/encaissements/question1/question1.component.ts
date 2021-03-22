import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CashinService } from 'src/app/shared/cashin.service';

@Component({
  selector: 'app-question1',
  templateUrl: './question1.component.html',
  styleUrls: ['./question1.component.scss']
})
export class Question1Component implements OnInit {

  encaissAmount = "0";

  form: FormGroup;

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

  constructor(private cashin: CashinService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  toString() {
    try {
      const num = +this.encaissAmount.split(',').join('');
    this.encaissAmount = (this.commafy(num) !== 'NaN' ? this.commafy(num) : '');
    } catch (e) {
      this.encaissAmount = '';
    }
  }

  evaluer() {
    const num = +this.encaissAmount.split(',').join('');
    console.log(num);
    this.cashin.setAmount(num);
    (num >= 500000 && num <= 2000000) ? 
    this.router.navigate(['Q2'], {
      relativeTo: this.route.parent
    }): 
    this.router.navigate(['results'], {
      relativeTo: this.route.parent
    });
  }

}
