import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { saveAs } from 'file-saver';
import { PdfviewerComponent } from '../../shared/pdfviewer/pdfviewer.component';
import { CommentspopupComponent } from '../../shared/commentspopup/commentspopup.component';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-finalreportpopup',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, FormsModule],
  templateUrl: './finalreportpopup.component.html',
  styleUrl: './finalreportpopup.component.css'
})
export class FinalreportpopupComponent implements OnInit, OnDestroy {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<FinalreportpopupComponent>, private dialog2: MatDialog) { }

  studentSubmissions: any[] = [];
  isLoading: boolean = true;
  private subscriptions = new Subscription();


  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {

  }

  loadData() {
    this.service.getSubmissionsByStudent('finalreports', this.data.usercode).subscribe(
      (res: any) => {
        this.studentSubmissions = res.payload;
        this.isLoading = false;
        console.log(this.studentSubmissions);
      },
      (error: any) => {
        console.error('Error fetching student submissions:', error);
      }
    );
  }

  onStatusChange(record: any) {
    const updateData = { advisor_approval: record.advisor_approval };
    this.service.updateAdvisorApproval('finalreports', record.id, updateData).subscribe(
      res => {
        console.log('Status updated successfully:', res);
      },
      error => {
        console.error('Error updating status:', error);
      }
    );
  }

  viewFile(submissionId: number) {
    this.service.getSubmissionFile('finalreports', submissionId).subscribe(
      (data: any) => {
        const popup = this.dialog2.open(PdfviewerComponent, {
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
    );
  }

  downloadFile(submissionId: number, submissionName: string) {
    this.service.getSubmissionFile('finalreports', submissionId).subscribe(
      (data: any) => {
        saveAs(data, submissionName);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    );
  }

  deleteSubmission(submissionId: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteSubmission(submissionId, 'finalreports').subscribe((res: any) => {
          Swal.fire({
            title: "Your submission has been deleted",
            icon: "success"
          });
          this.loadData();
        }, error => {
          Swal.fire({
            title: "Delete failed",
            text: "You may not have permission to delete this file.",
            icon: "error"
          });
        });
      }
    });
  }

  toggleApproval(id: number, currentValue: number) {
    let newValue: number;

    if (currentValue === 0) {
      newValue = 1;
    } else if (currentValue === 1) {
      newValue = -1;
    } else {
      newValue = 0;
    }
    const requestData = {
      submissionId: id,
      newRemark: newValue
    };
    this.service.toggleSubmissionRemark('finalreports', requestData).subscribe(
      (response) => {
        console.log('Submission remark toggled successfully:', response);

        const submissionIndex = this.studentSubmissions.findIndex(submission => submission.id === id);
        if (submissionIndex !== -1) {
          this.studentSubmissions[submissionIndex].remarks = newValue;
        }
      },
      (error) => console.error('Error toggling Submission remark:', error)
    );
  }

  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog2.open(CommentspopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "95%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_finalreports'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

}
