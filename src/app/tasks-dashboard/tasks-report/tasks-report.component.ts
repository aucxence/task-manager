import { Component, OnInit } from '@angular/core';
import { Task } from 'src/app/models/task';
import { AuthService } from 'src/app/shared/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import cronstrue from 'cronstrue';
import { PdfPrinter } from 'src/app/shared/pdf-printer';

@Component({
  selector: 'app-tasks-report',
  templateUrl: './tasks-report.component.html',
  styleUrls: ['./tasks-report.component.scss']
})
export class TasksReportComponent implements OnInit {

  executions: Task[] = [];

  splitexecs: Task[][] = [];

  monthyear: string = new Date().toISOString().slice(0, 7);

  constructor(public auth: AuthService, private _toastr: ToastrService, private router: Router) { }

  redefineExecutions() {

    const yearmonth = this.monthyear.split('-');

    console.log(':::::> ' + this.monthyear);

    const beg = new Date(+yearmonth[0],  +yearmonth[1] - 1, 1);
    const end = new Date(+yearmonth[0],  +yearmonth[1] - 1, 1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);

    console.log(beg);
    console.log(end);

    this.auth.getExecutions({
      beginningDate: beg,
      endingDate: end
    }).subscribe((executs) => {
      console.log('::> ' + executs.size);
      this.executions = [];
      executs.forEach(exec => {
        const execintask = new Task(exec.data());
        // this.executions = [];
        this.executions.push(execintask);
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

    const Difference_In_Days = ((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));

    let temptable: Task[] = [];

    // console.log('--> ' + this.auth.executions.length);

    let j = 0;

    this.splitexecs = [];

    for (i = 0; i < Difference_In_Days; i++) {
      // console.log('++> ' + i);

      this.splitexecs.push([]);
      while (this.executions[j] && this.executions[j].deadline.getTime() > basis.getTime() && j < this.executions.length) {
        // console.log('--> j = ' + j);
        // console.log(this.executions[j].deadline + ' to be compared with ' + basis);
        this.executions[j].cronjob = this.cronjobprocessing(this.executions[j]);
        this.splitexecs[i].push(this.executions[j]);
        j++;
        if (j === this.executions.length) { break; }
      }
      if (j === this.executions.length) { break; }
      basis.setDate(basis.getDate() - 1);
    }

    this.splitexecs = this.splitexecs.filter((tasklist) => {
      console.log(tasklist.length > 0 ? tasklist[0].deadline : '');
      return tasklist.length > 0;
    });
  }

  ngOnInit(): void {

    // this.auth.fadeOut = false;

    this.executions = this.auth.executions;

    const yearmonth = this.monthyear.split('-');

    const beg = new Date(+yearmonth[0],  +yearmonth[1] - 1, 1);
    const end = new Date(+yearmonth[0],  +yearmonth[1] - 1, 1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);

    console.log('----------------> ' + beg);
    console.log('----------------> ' + end);

    this.init(beg, end);

    // this.auth.fadeOut = true;


  }

  cronjobprocessing(task: Task): string {
    let cronjob = '0 0 0 ';
    if (task.repeat === true) {
      if (task.period === 'DAY') {
        cronjob += '* * *';
      }
      else if (task.period === 'MONTH' && task.monthlyOption === 'STRAIGHTDATE') {
        cronjob += task.monthday.toString() + ' */' + task.every + ' *';
      }
      else if (task.period === 'MONTH' && task.monthlyOption === 'WEEKDAY') {
        const crondayorder = ['1-7', '8-14', '15-21', '22-28', '29-31'];
        cronjob += crondayorder[task.dayOrder - 1] + ' */' + task.every + ' ' + task.dayofweek;
      }
      else if (task.period === 'WEEK') {
        if (task.weekdays.length !== 6) {
          const wdays = task.weekdays.toString().substring(0, task.weekdays.toString().length).replace(/\s/g, '')
          cronjob += '* * ' + wdays;
        } else {
          cronjob += '* * *';
        }
      }
      else if (task.period === 'YEAR') {
        cronjob += '* * *';
      }
      // console.log(cronjob);
      if (cronjob !== '0 0 0 * * *') {
        cronjob = cronstrue.toString(cronjob).substr(13);
        // console.log(cronjob);
      }
      else {
        if (task.period === 'DAY') {
          cronjob = 'every ' + task.every + ' day(s) (including sunday)';
        } else if (task.period === 'YEAR') {
          cronjob = 'every ' + task.every + ' year(s)';
        } else if (task.period === 'WEEK' && task.weekdays.length === 6) {
          cronjob = 'every working day';
        }
        // console.log(cronjob);
      }
    }

    return cronjob;
  }

  generateReport() {
    const k = new PdfPrinter();
    k.setExecs(this.splitexecs);
    k.setUser(this.auth.user);

    k.setMonthToConsider(+this.monthyear.split('-')[1]);
    // k.setServiceExecutions(this.executions);
    // k.printJson();
    k.generatePdf();
  }

  generateSpecificReport(i: number) {
    const k = new PdfPrinter();
    const secondsplit: Task[][] = [];
    secondsplit.push(this.splitexecs[i]);
    k.setExecs(secondsplit);
    k.setUser(this.auth.user);

    k.setDateToConsider(secondsplit[0][0].deadline);
    console.log(':::::::>' + secondsplit[0][0].deadline);
    k.setMonthToConsider(+this.monthyear.split('-')[1]);
    // k.setServiceExecutions(this.executions);
    // k.printJson();
    k.generatePdf();
  }

}
