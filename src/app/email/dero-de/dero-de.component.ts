import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-dero-de',
  templateUrl: './dero-de.component.html',
  styleUrls: ['./dero-de.component.scss']
})
export class DeroDEComponent implements OnInit {

  des = [];

  constructor(private auth: AuthService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.auth.fadeOut = false;
    this.auth.getDEs().subscribe((changes) => {
      this.des = changes.map((e) => {
        const x = e.payload.doc.data();
        x['id'] = e.payload.doc.id;
        return x;
      });
      this.auth.fadeOut = true;
      console.log(this.des);
    });
  }

  async forgive(de: any, forgiven) {
    try {
      await this.auth.updateDE(de, forgiven);
      this.toastr.success('Opération réussie', 'Succès', {
        timeOut: 4000
      });
    } catch (e) {
      console.log(e);
      this.toastr.error('Erreur', e, {
        timeOut: 10000
      });
    }
  }

}
