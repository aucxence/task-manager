import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IconsModule } from './icons/icons.module';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { RouterModule } from '@angular/router';

import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BnNgIdleService } from 'bn-ng-idle';

import { BackButtonDisableModule } from 'angular-disable-browser-back-button';

import { DataTablesModule } from 'angular-datatables';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DashboardCardComponent } from './helpers/dashboard-card/dashboard-card.component';
import { TasksDashboardComponent } from './tasks-dashboard/tasks-dashboard.component';
import * as firebase from 'firebase';
import { TasksDashboardHomeComponent } from './tasks-dashboard/tasks-dashboard-home/tasks-dashboard-home.component';
import { TasksDashboardScheduledComponent } from './tasks-dashboard/tasks-dashboard-scheduled/tasks-dashboard-scheduled.component';
import { TasksDashboardSpontaneousComponent } from './tasks-dashboard/tasks-dashboard-spontaneous/tasks-dashboard-spontaneous.component';
import { TasksDashboardDoneComponent } from './tasks-dashboard/tasks-dashboard-done/tasks-dashboard-done.component';
import { TasksDashboardUndoneComponent } from './tasks-dashboard/tasks-dashboard-undone/tasks-dashboard-undone.component';
import { TasksDashboardRecentComponent } from './tasks-dashboard/tasks-dashboard-recent/tasks-dashboard-recent.component';
import { TasksDashboardMonthComponent } from './tasks-dashboard/tasks-dashboard-month/tasks-dashboard-month.component';
import { TasksDashboardAllComponent } from './tasks-dashboard/tasks-dashboard-all/tasks-dashboard-all.component';
import { DayBoxComponent } from './helpers/day-box/day-box.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { HttpClientModule } from '@angular/common/http';
import { AddTaskDialogComponent } from './dialogs/add-task-dialog/add-task-dialog.component';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { CookieService } from 'ngx-cookie-service';
import { HabilitationsComponent } from './habilitations/habilitations.component';
import { TasksReportComponent } from './tasks-dashboard/tasks-report/tasks-report.component';
import { EmployeesOverviewComponent } from './tasks-dashboard/employees-overview/employees-overview.component';
import { CongehandlerComponent } from './congehandler/congehandler.component';
import { ControleQualitatifComponent } from './tasks-dashboard/controle-qualitatif/controle-qualitatif.component';
import { ControleReportComponent } from './controle-report/controle-report.component';
import { ChargementComponent } from './chargement/chargement.component';
import { TresorerieComponent } from './tresorerie/tresorerie.component';
import { EmailSenderComponent } from './email/email-sender/email-sender.component';
import { EmailMailboxComponent } from './email/email-mailbox/email-mailbox.component';
import { EmailReaderComponent } from './email/email-reader/email-reader.component';
import { EmailComponent } from './email/email.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { EmailSendboxComponent } from './email/email-sendbox/email-sendbox.component';
import { DeroDEComponent } from './email/dero-de/dero-de.component';
import { DisciplineComponent } from './tasks-dashboard/discipline/discipline.component';
import { EncaissementsComponent } from './encaissements/encaissements/encaissements.component';
import { IntroductionComponent } from './encaissements/introduction/introduction.component';
import { QuestionComponent } from './encaissements/question/question.component';
import { ResultsComponent } from './encaissements/results/results.component';
import { Question1Component } from './encaissements/question1/question1.component';
import { Question2Component } from './encaissements/question2/question2.component';
import { Question3Component } from './encaissements/question3/question3.component';
import { Question4Component } from './encaissements/question4/question4.component';
import { Question5Component } from './encaissements/question5/question5.component';

// the second parameter 'fr' is optional
registerLocaleData(localeFr, 'fr');

firebase.initializeApp(environment.firebaseConfig);

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    RegistrationComponent,
    DashboardCardComponent,
    TasksDashboardComponent,
    TasksDashboardHomeComponent,
    TasksDashboardScheduledComponent,
    TasksDashboardSpontaneousComponent,
    TasksDashboardDoneComponent,
    TasksDashboardUndoneComponent,
    TasksDashboardRecentComponent,
    TasksDashboardMonthComponent,
    TasksDashboardAllComponent,
    DayBoxComponent,
    AddTaskDialogComponent,
    HabilitationsComponent,
    TasksReportComponent,
    EmployeesOverviewComponent,
    CongehandlerComponent,
    ControleQualitatifComponent,
    ControleReportComponent,
    ChargementComponent,
    TresorerieComponent,
    EmailSenderComponent,
    EmailMailboxComponent,
    EmailReaderComponent,
    EmailComponent,
    EmailSendboxComponent,
    DeroDEComponent,
    DisciplineComponent,
    EncaissementsComponent,
    IntroductionComponent,
    QuestionComponent,
    ResultsComponent,
    Question1Component,
    Question2Component,
    Question3Component,
    Question4Component,
    Question5Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    RouterModule,
    ToastrModule.forRoot({
      timeOut: 1000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      progressAnimation: "increasing",
      progressBar: true,
      easing: "ease-in-out-quad"
    }),
    BrowserAnimationsModule,
    BackButtonDisableModule.forRoot({
      preserveScrollPosition: true
    }),
    DataTablesModule,
    FontAwesomeModule,
    Ng2CompleterModule,
    HttpClientModule,
    AngularEditorModule
  ],
  providers: [
    BnNgIdleService,
    { provide: LOCALE_ID, useValue: 'fr' },
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
