import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormUtils } from '../shared/form.utils';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Response } from '../models/response';
import { CompleterData, CompleterService, CompleterItem } from 'ng2-completer';
import { take } from 'rxjs/operators';
import { User } from '../models/user';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/internal/Subject';
declare let $;

@Component({
  selector: 'app-congehandler',
  templateUrl: './congehandler.component.html',
  styleUrls: ['./congehandler.component.scss']
})
export class CongehandlerComponent implements OnInit {

  conges: any[] = [];
  localallusers: any[] = [];

  congeid: string;

  update = false;

  raisons = [
    'Permission',
    'Maladie',
    'Repos',
    'Congés',
    'Départ définitif'
  ];

  congetaker: User = new User();

  public form: FormGroup;
  public formUtils: FormUtils;
  public submitted: boolean;
  public formErrors: Array<string>;
  public conge: { [key: string]: any };
  public fadeout = false;
  dataService: CompleterData;

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  @ViewChild('dataTable') table;
  dataTable: any;

  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();

  constructor(public auth: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private _toastr: ToastrService,
    private completerService: CompleterService) {

    this.setupForm();
    this.formUtils = new FormUtils(this.form);
    this.submitted = false;
    this.formErrors = null;

    this.auth.GetAllUsers().then((changes) => {
      changes.pipe((take(1))).subscribe(userlist => {
        this.localallusers = userlist.map(user => {
          // console.log(user.payload.doc.data());
          const usr = user.payload.doc.data() as User;
          return { id: user.payload.doc.id, ...usr };
        });

        const allusers = this.localallusers.map(user => {
          return {
            ...user,
            fullname: user.firstname + ' ' + user.lastname
          };
        });

        this.dataService = this.completerService.local(allusers, 'firstname,lastname,email', 'fullname');



      });
    });


  }

  setSelectedUser = (selectedItem: CompleterItem) => {
    // console.log('at least');
    if (selectedItem) {
      // tslint:disable-next-line: forin
      // for (const prop in this.congetaker) {
      //   this.congetaker[prop] = selectedItem.originalObject[prop];
      //   console.log(this.congetaker[prop]);
      // }  
      this.congetaker.id = selectedItem.originalObject.id;
      console.log(this.congetaker.id);
    } else {
      console.log('ok ok')
      this.congetaker.firstname = '';
    }
  }

  blurring = () => {
    console.log('at least');
    if (this.congetaker.firstname !== undefined) {
      if (this.congetaker.firstname.length <= 3) { this.congetaker.firstname = ''; }
    }
  }

  setToDate(event) {
    return new Date(event);
  }

  private setupForm() {
    this.form = this.formBuilder.group({
      employe: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      startingDate: [null, [Validators.required]],
      returnDate: [null, [Validators.required]],
      raison: [null, [Validators.required]],
    });
  }

  updateForm = (data: any) => {

    console.log(data);

    this.conge.congeid = data.congeid;

    this.form.patchValue({
      employe: data.employe,
      startingDate: (data.startingDate.toDate() as Date).toISOString().slice(0, 10),
      returnDate: (data.returnDate.toDate() as Date).toISOString().slice(0, 10),
      raison: data.raison
    });

    this.congetaker.id = data.employeID;

    this.update = true;

    window.scrollTo(0, 0);
  }

  registerFormSubmit() {

    // this.fadeout = false;

    const startingDate = new Date(this.form.get('startingDate').value);
    startingDate.setHours(5, 0, 0, 0);

    const returnDate = new Date(this.form.get('returnDate').value);
    returnDate.setHours(5, 0, 0, 0);

    this.conge.raison = this.form.get('raison').value;
    this.conge.employe = this.form.get('employe').value;
    this.conge.employeID = this.congetaker.id;
    this.conge.startingDate = startingDate;
    this.conge.returnDate = returnDate;
    this.conge.success = false;

    console.log(this.conge);

    if (this.update === false) {
      this.auth.addConges(this.conge).then((e: Response) => {
        this.fadeout = true;
        this.update = false;
        this._toastr.success(e.code, e.message, {
          timeOut: 5000
        });
      }).catch((err: Response) => {
        this.fadeout = true;
        this.update = false;
        this._toastr.error(err.code, err.message, {
          timeOut: 3000
        });
      });
    } else {
      console.log('----------------------------');

      this.auth.updateConges(this.conge).then((e: Response) => {
        this.fadeout = true;
        this.update = false;
        this._toastr.success(e.code, e.message, {
          timeOut: 5000
        });
      }).catch((err: Response) => {
        this.fadeout = true;
        this.update = false;
        this._toastr.error(err.code, err.message, {
          timeOut: 3000
        });
      });
    }


  }

  ngOnInit(): void {

    console.log('-----> ', this.auth.user.fonction);

    this.auth.getConges().subscribe((changes) => {
      this.conges = changes.map((document) => {
        const id = document.payload.doc.id;
        return {
          ...document.payload.doc.data() as {},
          congeid: id
        };
      });

      console.log(this.conges.length);

      this.dtOptions = {
        // Use this attribute to enable the responsive extension
        responsive: {
          details: {
            renderer: $.fn.dataTable.Responsive.renderer.listHiddenNodes()
          }
        },
        order: [[0, 'desc']],
        retrieve: true,
      };

      this.congetaker.firstname = (this.auth.user.fonction < 1000) ?
        this.auth.user.firstname + ' ' + this.auth.user.lastname :
        '';

      this.congetaker.id = (this.auth.user.fonction < 1000) ?
        this.auth.user.id :
        '';

      this.conge = {
        raison: this.form.get('raison').value,
        employe: this.form.get('employe').value,
        employeID: this.congetaker.id,
        startingDate: '',
        returnDate: '',
        success: false,
        congeid: ''
      };

      this.dtTrigger.next();
    });
  }

  itessesReset() {
    this.congetaker.firstname = (this.auth.user.fonction < 1000) ?
      this.auth.user.firstname + ' ' + this.auth.user.lastname :
      '';

    this.congetaker.id = (this.auth.user.fonction < 1000) ?
      this.auth.user.id :
      '';
  }

}
