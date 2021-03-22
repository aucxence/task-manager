import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CashinService } from 'src/app/shared/cashin.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  constructor(private cashin: CashinService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.cashin.reset();
  }

  restart() {
    this.router.navigate(['intro'], {
      relativeTo: this.route.parent
    })
  }

}
