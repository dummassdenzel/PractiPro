import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, NavbarComponent, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  studentRequirements: any[] = [];

  constructor(private service: AuthService) {}

  ngOnInit(): void {
    const userId = this.service.getCurrentUserId();
    if (userId) {
      this.service.getStudentRequirements(userId).subscribe(
        (data: any[]) => {
          this.studentRequirements = data;
        },
        (error: any) => {
          console.error('Error fetching student requirements:', error);
        }
      );
    }
  }
}
