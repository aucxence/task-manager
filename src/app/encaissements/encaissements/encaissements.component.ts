import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr'

@Component({
  selector: 'app-encaissements',
  templateUrl: './encaissements.component.html',
  styleUrls: ['./encaissements.component.scss']
})
export class EncaissementsComponent implements OnInit {

  form: FormGroup;

  amount = null;

  result = null;

  constructor(private formBuilder: FormBuilder, private _toastr: ToastrService) { }

  ngOnInit(): void {

    // this.form = this.formBuilder.group({
    //   q1: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(9)]],
    //   q2: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(9)]],
    //   q3: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(9)]]
    // });
  }

}
