import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Task } from '../models/task';
import { AuthService } from '../shared/auth.service';
import { ControlePdfPrinter } from '../shared/controle-pdf-printer';

@Component({
  selector: 'app-controle-report',
  templateUrl: './controle-report.component.html',
  styleUrls: ['./controle-report.component.scss']
})
export class ControleReportComponent implements OnInit {

  controles: any[] = [];
  hebdocontroles: any[] = [];

  splitControles: any[][] = [];

  splitHebdoControles: any[][] = [];

  monthyear: string = new Date().toISOString().slice(0, 7);

  constructor(public auth: AuthService, private _toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {

    this.auth.fadeOut = false;

    this.redefineControles();
    this.redefineHebdoControles();

    // console.log(this.splitHebdoControles);

    this.auth.fadeOut = true;

  }

  redefineHebdoControles() {

    const yearmonth = this.monthyear.split('-');

    // console.log(':::::> ' + this.monthyear);

    const curr = new Date(); // get current date
    const first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
    const last = first + 6; // last day is the first day + 6

    const firstday = new Date(curr.setDate(first));
    const lastday = new Date(curr.setDate(last));

    

    // console.log(firstday);
    // console.log(lastday);

    this.auth.getControles({
      beginningDate: firstday,
      endingDate: lastday
    }).subscribe((executs) => {
      // console.log('::> ' + executs.size);
      this.hebdocontroles = [];
      executs.forEach(exec => {
        const execintask = new Task(exec.data());
        // this.executions = [];
        this.hebdocontroles.push(execintask);
      }); 

      // console.log(this.hebdocontroles);

      this.hebdoinit(firstday, lastday);
    });
  }

  hebdoinit(beg, end) {
    let i = 0;

    const basis = end;
    basis.setHours(0, 0, 0, 0);

    const date1 = beg;
    date1.setHours(0, 0, 0, 0);
    const date2 = end;
    date2.setHours(0, 0, 0, 0);

    // tslint:disable-next-line: constiable-name
    const Difference_In_Days = ((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)) + 1;

    // console.log('--> ' + Difference_In_Days);

    let j = 0;

    this.splitHebdoControles = [];

    for (i = 0; i < Difference_In_Days; i++) {
      // console.log('++> ' + i);

      this.splitHebdoControles.push([]);
      // console.log(this.hebdocontroles[j].date.toDate() + ' to be compared with ' + basis);
      while (this.hebdocontroles[j] && this.hebdocontroles[j].date.toDate().getTime() > basis.getTime() && j < this.hebdocontroles.length) {
        // console.log('--> j = ' + j);
        
        this.splitHebdoControles[i].push(this.hebdocontroles[j]);
        j++;
        if (j === this.hebdocontroles.length) { break; }
      }
      if (j === this.hebdocontroles.length) { break; }
      basis.setDate(basis.getDate() - 1);
    }

    this.splitHebdoControles = this.splitHebdoControles.filter((tasklist) => {
      // console.log(tasklist.length > 0 ? tasklist[0].deadline : '');
      return tasklist.length > 0;
    });
  }

  generateHebdoReport() {
    const k = new ControlePdfPrinter();
    k.setControles(this.splitHebdoControles);
    k.setUser(this.auth.user);

    k.setMonthToConsider(+this.monthyear.split('-')[1]);
    // k.setServiceExecutions(this.executions);
    // k.printJson();
    k.generatePdf();
  }

  redefineControles() {

    const yearmonth = this.monthyear.split('-');

    // console.log(':::::> ' + this.monthyear);

    const beg = new Date(+yearmonth[0], +yearmonth[1] - 1, 1);
    const end = new Date(+yearmonth[0], +yearmonth[1] - 1, 1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);

    // console.log(beg);
    // console.log(end);

    this.auth.getControles({
      beginningDate: beg,
      endingDate: end
    }).subscribe((executs) => {
      // console.log('::> ' + executs.size);
      this.controles = [];
      executs.forEach(exec => {
        const execintask = new Task(exec.data());
        // this.executions = [];
        this.controles.push(execintask);
      });

      this.init(beg, end);
    });
  }

  init(beg, end) {
    let i = 0;

    const basis = end;
    // basis.setHours(0, 0, 0, 0);

    const date1 = beg;
    const date2 = end;

    // tslint:disable-next-line: constiable-name
    const Difference_In_Days = ((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)) + 1;

    // console.log('--> ' + this.auth.controles.length);

    let j = 0;

    this.splitControles = [];

    for (i = 0; i < Difference_In_Days; i++) {
      // console.log('++> ' + i);

      this.splitControles.push([]);
      while (this.controles[j] && this.controles[j].date.toDate().getTime() > basis.getTime() && j < this.controles.length) {
        // console.log('--> j = ' + j);
        // console.log(this.controles[j].deadline + ' to be compared with ' + basis);
        this.splitControles[i].push(this.controles[j]);
        j++;
        if (j === this.controles.length) { break; }
      }
      if (j === this.controles.length) { break; }
      basis.setDate(basis.getDate() - 1);
    }

    this.splitControles = this.splitControles.filter((tasklist) => {
      // console.log(tasklist.length > 0 ? tasklist[0].deadline : '');
      return tasklist.length > 0;
    });
  }

  generateReport() {
    const k = new ControlePdfPrinter();
    k.setControles(this.splitControles);
    k.setUser(this.auth.user);

    k.setMonthToConsider(+this.monthyear.split('-')[1]);
    // k.setServiceExecutions(this.executions);
    // k.printJson();
    k.generatePdf();
  }

  generateSpecificReport(i: number) {
    const k = new ControlePdfPrinter();
    const secondsplit: any[][] = [];
    secondsplit.push(this.splitControles[i]);
    k.setControles(secondsplit);
    k.setUser(this.auth.user);

    k.setDateToConsider(secondsplit[0][0].date.toDate());
    // console.log(':::::::>' + secondsplit[0][0].date.toDate());
    k.setMonthToConsider(+this.monthyear.split('-')[1]);
    // k.setServiceExecutions(this.executions);
    // k.printJson();
    k.generatePdf();
  }

}
