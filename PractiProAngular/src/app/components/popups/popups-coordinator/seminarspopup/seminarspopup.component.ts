import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../../pipes/filter.pipe';
import { Observable, Subscription, map } from 'rxjs';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { AddseminarpopupComponent } from '../../../popups/popups-student/addseminarpopup/addseminarpopup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PdfviewerComponent } from '../../shared/pdfviewer/pdfviewer.component';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../shared/commentspopup/commentspopup.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-seminarspopup',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, FilterPipe, MatButtonModule, MatMenuModule, MatTooltipModule],
  templateUrl: './seminarspopup.component.html',
  styleUrl: './seminarspopup.component.css'
})
export class SeminarspopupComponent {
  datalist: any[] = [];
  searchtext: any;
  private subscriptions = new Subscription();

  constructor(@Inject(MAT_DIALOG_DATA) public data:any, private dialogRef: MatDialogRef<SeminarspopupComponent>, private service: AuthService, private dialog: MatDialog, private sanitizer: DomSanitizer, private changeDetection: ChangeDetectionService) {
    
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
    this.subscriptions.add(
      this.service.getSeminarRecords(this.data.student.id).subscribe((res: any) => {
        console.log(res);
        this.datalist = res.payload
      })
    );
  }

  viewCertificate(seminar_id: number) {
    this.subscriptions.add(
    this.service.getSubmissionFile('student_seminar_certificates', seminar_id).subscribe(
      (data: any) => {
        const popup = this.dialog.open(PdfviewerComponent, {
          enterAnimationDuration: "0ms",
          exitAnimationDuration: "500ms",
          width: "90%",
          data: {
            selectedPDF: data
          }
        })
      },
      (error: any) => {
        console.error('Error viewing submission:', error);
      }
    ));
  }

  onStatusChange(record: any) {
    const updateData = { advisor_approval: record.advisor_approval };
    this.service.updateAdvisorApproval('student_seminar_records', record.id, updateData).subscribe(
      res => {
        this.changeDetection.notifyChange(true);
        console.log('Status updated successfully:', res);
      },
      error => {
        console.error('Error updating status:', error);
      }
    );
  }

  deleteRecord(id: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.service.deletSeminarRecord(id).subscribe((res: any) => {
            Swal.fire({
              title: "Successfully deleted record!",
              icon: "success"
          });
            this.loadData();
            
          }))
      }
    });
  }

  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog.open(CommentspopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_seminar_records'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }
  
}