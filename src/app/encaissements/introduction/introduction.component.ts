import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss']
})
export class IntroductionComponent implements OnInit {

  

  constructor(private router: Router, private route: ActivatedRoute,) { }

  ngOnInit(): void {
  }

  startQuiz() {
    this.router.navigate(['Q1'], {
      relativeTo: this.route.parent
    });
  }

}
