import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AuthService } from '../../../services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit, OnDestroy {
  studentId: any;
  student: any;
  company_id: any;
  registrationStatus: any;
  class: any;
  private subscriptions = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private service: AuthService,
    private changeDetection: ChangeDetectionService
  ) {
    this.studentId = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
    this.loadData();


    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadData();
        }
      })
    )
  }

  loadData() {
    this.subscriptions.add(
      this.service.getStudentOjtInfo(this.studentId).subscribe(
        (res: any) => {
          this.student = res.payload[0];
          this.registrationStatus = res.payload[0].registration_status;
          this.company_id = res.payload[0].company_id;
          this.class = res.payload[0].block;
        },
        (error: any) => {
          console.error('Error fetching student requirements:', error);
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
