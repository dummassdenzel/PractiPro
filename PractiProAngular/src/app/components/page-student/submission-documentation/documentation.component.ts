import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, FilterPipe, FormsModule, CommonModule, MatButtonModule, MatMenuModule, MatTooltipModule, NgxPaginationModule],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.css'
})
export class DocumentationComponent implements OnInit, OnDestroy {
  userId: any;
  datalist: any[] = [];
  origlist: any
  searchtext: any;
  pdfPreview?: SafeResourceUrl;
  file: any;
  tabWeekNumbers: number[] = [1];
  p: number = 1;
  private subscriptions = new Subscription();

  constructor(private service: AuthService, private dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.userId = this.service.getCurrentUserId();
  }


  ngOnInit() {
    this.loadData();
    this.subscriptions.add(
      this.service.getSubmissionMaxWeeks('documentations', this.userId).subscribe(
        res => {
          this.tabWeekNumbers = res;
        },
        error => {
          console.error('Error fetching week numbers:', error);
        }
      ));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.service.getSubmissionsByStudent('documentations', this.userId).subscribe(res => {
        this.datalist = res.payload.sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        this.origlist = this.datalist;
      }));
  }

  onFileChange(event: any) {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      this.file = files[0];
      this.previewPDF();
    }
  }

  previewPDF() {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileURL = e.target?.result as string;
      this.pdfPreview = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
    };
    reader.readAsDataURL(this.file);
  }

  //SUBMISSION LOGIC
  addNewTab() {
    const nextWeekNumber = this.tabWeekNumbers[this.tabWeekNumbers.length - 1] + 1;
    this.tabWeekNumbers.push(nextWeekNumber);
  }

  selectedTabLabel: number = 1;
  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabLabel = parseInt(event.tab.textLabel.replace('Week ', ''), 10);
    this.pdfPreview = undefined;
  }

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');

    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      if (file) {
        this.subscriptions.add(
          this.service.uploadSubmission('documentations', this.userId, file, this.selectedTabLabel).subscribe(
            response => {
              console.log('File uploaded successfully:', response);
              Swal.fire({
                title: "Uploaded Successfully!",
                text: "Please wait for your coordinator's approval.",
                icon: "success"
              });
              this.loadData();
              this.pdfPreview = undefined;
              fileInput.value = '';
            },
            error => {
              console.error('Error uploading file:', error);
            }
          ));
      }
      else if (file == null) {
        Swal.fire({
          title: "No File to Upload",
          text: "Please select a file to upload first.",
          icon: "error"
        });
      }
    });
  }

  setFilter(filter: string) {
    this.p = 1;
    this.datalist = this.origlist;
    switch (filter) {
      case 'all':
        this.datalist = this.origlist;
        break;
      case 'approved':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Approved');
        break;
      case 'unapproved':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Unapproved');
        break;
      case 'pending':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Pending');
        break;
    }
  }

  setFilterWeek(week: any) {
    this.datalist = this.origlist;
    this.datalist = this.datalist.filter((user: any) => user.week === week);

  }

  downloadFile(submissionId: number, fileName: string) {
    this.subscriptions.add(
      this.service.getSubmissionFile('documentations', submissionId).subscribe(
        (data: any) => {
          saveAs(data, fileName);
        },
        (error: any) => {
          console.error('Error downloading submission:', error);
        }
      ));
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
        this.subscriptions.add(
          this.service.deleteSubmission(submissionId, 'documentations').subscribe((res: any) => {
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
          }));
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
        table: 'comments_documentation'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

}
