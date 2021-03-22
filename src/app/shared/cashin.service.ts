import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CashinService {

  amount = 0;
  niveauAgence = 0;
  plafondAgence = 0;

  constructor() { }

  setAmount(amount: number) {
    this.amount = amount;
  }

  setNiveauAgence(niveauAgence: number) {
    this.niveauAgence = niveauAgence;
  }

  getAmount() {
    return this.amount;
  }

  setPlafondAgence(plafondAgence: number) {
    this.plafondAgence = plafondAgence;
  }

  reset() {
    this.amount = 0;
    this.niveauAgence = 0;
    this.plafondAgence = 0;
  }


}
