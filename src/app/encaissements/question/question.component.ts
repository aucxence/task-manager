import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CashinService } from 'src/app/shared/cashin.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

  questionID = 0;

  constructor(private cashin: CashinService, private route: ActivatedRoute, private router: Router) {
    this.route.paramMap.subscribe(params => {
      this.setQuestionID(+params.get('questionId'));  // get the question ID and store it
      // this.question = this.getQuestion;
    });
  }

  ngOnInit(): void {
  }

  setQuestionID(id: number) {
    return this.questionID = id;
  }

}
