import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SelecttraineespopupComponent } from '../../popups/popups-supervisor/selecttraineespopup/selecttraineespopup.component';
import { ViewtraineepopupComponent } from '../../popups/popups-supervisor/viewtraineepopup/viewtraineepopup.component';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { Subscription } from 'rxjs';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, FilterPipe],
  templateUrl: './supervisor-dashboard.component.html',
  styleUrls: ['./supervisor-dashboard.component.css']
})
export class SupervisorDashboardComponent implements OnInit, OnDestroy {
  userId: any;
  user: any;
  traineesList: any[] = [];
  avatarUrl?: SafeUrl;
  searchtext: any;
  private subscriptions = new Subscription();

  constructor(private service: AuthService, private dialog: MatDialog, private sanitizer: DomSanitizer, private changeDetection: ChangeDetectionService) {
    this.userId = this.service.getCurrentUserId();
    this.subscriptions.add(
      this.service.getSupervisors(this.userId).subscribe((res: any) => {
        this.user = res.payload[0];
      })
    );
  }

  ngOnInit(): void {
    this.loadData();

    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadData();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    console.log("Loading Data...");
    this.subscriptions.add(
      this.service.getStudentsBySupervisor(this.userId).subscribe((res: any) => {
        this.traineesList = res.payload.map((user: any) => {
          return { ...user, avatar: '' };
        });
        this.traineesList.forEach((student: any) => {
          this.subscriptions.add(
            this.service.getAvatar(student.id).subscribe((res: any) => {
              if (res.size > 0) {
                const url = URL.createObjectURL(res);
                student.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
              }
            })
          );
        });
      })
    );
  }

  selectTrainees() {
    const popup = this.dialog.open(SelecttraineespopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: '90%',
      data: {
        company_id: this.user.company_id,
        supervisor_id: this.userId
      }
    });
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        const changeDetected = res;
        if (changeDetected) {
          console.log("Change detected!");
          this.loadData();
        }
      })
    );
  }

  viewTrainee(student: any) {
    const popup = this.dialog.open(ViewtraineepopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: '90%',
      data: {
        student: student
      }
    });
  }

  removeStudentFromSelection(id: number, firstName: string) {
    this.service.removeStudentFromSupervisor(id, this.userId).subscribe((res: any) => {
      this.loadData();
      Swal.fire({
        toast: true,
        position: "top-end",
        title: `Removed ${firstName} from your supervision.`,
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        showCloseButton: true,
      });
    })
  }
}
