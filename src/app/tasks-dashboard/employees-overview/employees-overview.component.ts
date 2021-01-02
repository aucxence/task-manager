import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { take } from 'rxjs/internal/operators/take';
import { User } from 'src/app/models/user';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { PdfPrinter } from 'src/app/shared/pdf-printer';
import { Task } from 'src/app/models/task';
import { GlobalPdfPrinter } from 'src/app/shared/global-pdf-printer';

@Component({
  selector: 'app-employees-overview',
  templateUrl: './employees-overview.component.html',
  styleUrls: ['./employees-overview.component.scss']
})
export class EmployeesOverviewComponent implements OnInit {

  allusers: User[] = [];
  faFileDownload = faFileDownload;

  executions: Task[] = [];

  splitexecs: Task[][] = [];

  monthyear: string = new Date().toISOString().slice(0, 7);

  globaldonetasks = 0;
  globaltasks = 0;
  globalperformance = 0;

  alltasks: Task[] = [];
  donetasks: Task[] = [];

  fadeOut = false;

  itesses: User[] = [];
  nonitesses: User[] = [];

  itessesdone = 0;
  itessesall = 0;
  itessesperf = 0;

  nonitessesdone = 0;
  nonitessesall = 0;
  nonitessesperf = 0;

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.fadeOut = false;
    this.auth.GetAllUsers().then((changes) => {
      changes.pipe((take(1))).subscribe(userlist => {
        this.allusers = userlist.map(user => {
          // console.log(user.payload.doc.data());
          const usr = user.payload.doc.data() as User;
          // console.log(usr.firstname);
          return usr;
        });
        this.redefineExecs();
        this.fadeOut = true;
      });
    });
  }

  redefineExecs = () => {
    const yearmonth = this.monthyear.split('-');

    console.log(':::::> ' + this.monthyear);

    const beg = new Date(+yearmonth[0], +yearmonth[1] - 1, 1);
    const end = new Date(+yearmonth[0], +yearmonth[1] - 1, 1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);

    console.log(beg);
    console.log(end);

    end.setHours(23, 59, 0, 0);

    this.auth.getAllExecutions({
      beginningDate: beg,
      endingDate: end
    }).subscribe((executs) => {
      this.globaltasks = executs.size;
      this.alltasks = [];
      executs.forEach(exec => {
        this.alltasks.push(new Task(exec.data()));
      });

      this.donetasks = this.alltasks.filter((task) => {
        return task.status === 'done';
      });

      this.globaldonetasks = this.donetasks.length;

      this.globalperformance = (this.alltasks.length > 0) ? (this.globaldonetasks * 100 / this.globaltasks) : 0;

      this.singleOutItesses();
      this.singleOutNonItesses();

      this.getitessesExecs();
      this.getNonItessesExecs();

      this.fadeOut = true;

    });
  }

  singleOutItesses() {
    this.itesses = this.allusers.filter((user) => {
      console.log(user.fonction);
      return (+user.fonction) < 1000;
    });
  }

  singleOutNonItesses() {
    this.nonitesses = this.allusers.filter((user) => {
      return (+user.fonction) >= 1000;
    });
  }

  getitessesExecs() {
    console.log(':::::::::::::::::> ' + this.itesses.length);
    this.itesses.forEach((itesse) => {
      const myexecs = this.alltasks.filter((task) => {
        return task.assignedTo === itesse.id;
      });
      const mydone = myexecs.filter((task) => {
        return task.status === 'done';
      });
      this.itessesall = this.itessesall + myexecs.length;
      this.itessesdone = mydone.length + this.itessesdone;
    });
    console.log(':::::::::::::::::> ' + this.itessesall);
    console.log(':::::::::::::::::> ' + this.itessesdone);
    this.itessesperf = (this.itessesall > 0) ? (this.itessesdone * 100 / this.itessesall) : 0;
  }

  getNonItessesExecs() {
    console.log(':::::::::::::::::> ' + this.nonitesses.length);
    this.nonitesses.forEach((itesse) => {
      const myexecs = this.alltasks.filter((task) => {
        return task.assignedTo === itesse.id;
      });
      const mydone = myexecs.filter((task) => {
        return task.status === 'done';
      });
      this.nonitessesall = this.nonitessesall + myexecs.length;
      this.nonitessesdone = mydone.length + this.nonitessesdone;
    });
    console.log(':::::::::::::::::> ' + this.nonitessesall);
    console.log(':::::::::::::::::> ' + this.nonitessesdone);
    this.nonitessesperf = (this.nonitessesall > 0) ? (this.nonitessesdone * 100 / this.nonitessesall) : 0;
  }

  generateReport(j: number) {
    const k = new PdfPrinter();
    k.setExecs(this.splitexecs);
    k.setUser(this.allusers[j]);

    k.setMonthToConsider(+this.monthyear.split('-')[1]);
    // k.setServiceExecutions(this.executions);
    // k.printJson();
    k.generatePdf();
  }

  generateOverallReport() {
    const k = new GlobalPdfPrinter();
    k.setUserList(this.allusers);
    k.setAlltasks(this.alltasks.length);
    k.setDonetasks(this.donetasks.length);

    k.generatePdf();
  }

  generateItessesOverallReport() {
    const k = new GlobalPdfPrinter();
    k.setUserList(this.itesses);
    k.setAlltasks(this.itessesall);
    k.setDonetasks(this.itessesdone);

    k.generatePdf();
  }

  generateNonItessesOverallReport() {
    const k = new GlobalPdfPrinter();
    k.setUserList(this.nonitesses);
    k.setAlltasks(this.nonitessesall);
    k.setDonetasks(this.nonitessesdone);

    k.generatePdf();
  }

  getEmployeeExecutions(j: number) {

    this.fadeOut = false;

    const yearmonth = this.monthyear.split('-');

    console.log(':::::> ' + this.monthyear);

    const beg = new Date(+yearmonth[0], +yearmonth[1] - 1, 1);
    const end = new Date(+yearmonth[0], +yearmonth[1] - 1, 1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);

    console.log(beg);
    console.log(end);

    this.auth.getEmployeesExecutions({
      beginningDate: beg,
      endingDate: end,
      employeeID: this.allusers[j].id
    }).subscribe((executs) => {
      console.log('::> ' + executs.size);
      this.executions = [];
      executs.forEach(exec => {
        const execintask = new Task(exec.data());
        // this.executions = [];
        this.executions.push(execintask);
      });

      this.init(beg, end); // generate the split tasks

      console.log(this.splitexecs);

      this.generateReport(j);

      this.fadeOut = true;
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

}
