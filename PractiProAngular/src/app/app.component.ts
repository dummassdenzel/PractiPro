import { Component, DoCheck } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { AboutusComponent } from './components/aboutus/aboutus.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { Router } from '@angular/router';
import { authGuard } from './guard/auth.guard';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { AdminSubmissionComponent } from './components/admin-submission/admin-submission.component';
import { AdminStudentsubmittedreqComponent } from './components/admin-studentsubmittedreq/admin-studentsubmittedreq.component';
import { AdminWeeklyaccomplismentComponent } from './components/admin-weeklyaccomplisment/admin-weeklyaccomplisment.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent, DashboardComponent, SidebarComponent, FeedbackComponent, AboutusComponent, NavbarComponent, ProfileComponent, HttpClientModule,AdminWeeklyaccomplismentComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, DoCheck {
  title = 'PractiProAngular';
  ismenurequired = false;
  isadminuser = false;
  constructor(private router: Router, private service: AuthService) {

  }

  ngOnInit(): void {
    initFlowbite();
  }

  ngDoCheck(): void {
    let currenturl = this.router.url;
    if (currenturl == '/login' || currenturl == '/registration') {
      this.ismenurequired = false;
    } else {
      this.ismenurequired = true;
    }
    if (this.service.GetUserRole() === 'admin') {
      this.isadminuser = true;
    } else {
      this.isadminuser = false;
    }
  }
}
