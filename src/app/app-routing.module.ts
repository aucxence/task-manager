import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { AuthGuard } from './shared/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TasksDashboardComponent } from './tasks-dashboard/tasks-dashboard.component';
import { TasksDashboardHomeComponent } from './tasks-dashboard/tasks-dashboard-home/tasks-dashboard-home.component';
import { TasksDashboardScheduledComponent } from './tasks-dashboard/tasks-dashboard-scheduled/tasks-dashboard-scheduled.component';
import { TasksDashboardSpontaneousComponent } from './tasks-dashboard/tasks-dashboard-spontaneous/tasks-dashboard-spontaneous.component';
import { TasksDashboardUndoneComponent } from './tasks-dashboard/tasks-dashboard-undone/tasks-dashboard-undone.component';
import { TasksDashboardDoneComponent } from './tasks-dashboard/tasks-dashboard-done/tasks-dashboard-done.component';
import { TasksDashboardMonthComponent } from './tasks-dashboard/tasks-dashboard-month/tasks-dashboard-month.component';
import { TasksDashboardAllComponent } from './tasks-dashboard/tasks-dashboard-all/tasks-dashboard-all.component';
import { TasksDashboardRecentComponent } from './tasks-dashboard/tasks-dashboard-recent/tasks-dashboard-recent.component';
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


const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegistrationComponent
  },
  {
    path: 'global-dashboard',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: DashboardComponent,
    children: [
      { path: 'tasksdashboard', component: TasksDashboardComponent },
    ]
  },
  {
    path: 'tasksdashboard',
    component: TasksDashboardComponent,
    canActivateChild: [AuthGuard],
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: TasksDashboardHomeComponent },
      { path: 'scheduled', component: TasksDashboardScheduledComponent },
      { path: 'spontaneous', component: TasksDashboardSpontaneousComponent },
      { path: 'undone', component: TasksDashboardUndoneComponent },
      { path: 'done', component: TasksDashboardDoneComponent },
      { path: 'monthly', component: TasksDashboardMonthComponent },
      { path: 'all', component: TasksDashboardAllComponent },
      { path: 'recent', component: TasksDashboardRecentComponent },
      { path: 'habilitations', component: HabilitationsComponent },
      { path: 'report', component: TasksReportComponent },
      { path: 'overview', component: EmployeesOverviewComponent },
      { path: 'conges', component: CongehandlerComponent },
      { path: 'controle', component: ControleQualitatifComponent },
      { path: 'rapportControle', component: ControleReportComponent },
      { path: 'chargement', component: ChargementComponent },
      { path: 'tresor', component: TresorerieComponent },
      {
        path: 'email',
        component: EmailComponent,
        children: [
          { path: '', redirectTo: 'mailbox', pathMatch: 'full' },
          { path: 'mailbox', component: EmailMailboxComponent },
          { path: 'sendbox', component: EmailSendboxComponent },
          { path: 'send', component: EmailSenderComponent },
          { path: 'read', component: EmailReaderComponent },
          { path: 'derogation', component: DeroDEComponent },
        ]
      },
      { path: 'discipline', component: DisciplineComponent },
      {
        path: 'encaissement',
        component: EncaissementsComponent,
        children: [
          { path: '', redirectTo: 'intro', pathMatch: 'full' },
          { path: 'intro', component: IntroductionComponent, pathMatch: 'full' },
          // { path: 'question', component: QuestionComponent, pathMatch: 'full' },
          { path: 'Q1', component: Question1Component, pathMatch: 'full' },
          { path: 'Q2', component: Question2Component, pathMatch: 'full' },
          { path: 'Q3', component: Question3Component, pathMatch: 'full' },
          { path: 'Q4', component: Question4Component, pathMatch: 'full' },
          { path: 'Q5', component: Question5Component, pathMatch: 'full' },
          { path: 'results', component: ResultsComponent, pathMatch: 'full' },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
