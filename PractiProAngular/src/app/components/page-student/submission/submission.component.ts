import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import saveAs from 'file-saver';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-submission',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, CommonModule],
  templateUrl: './submission.component.html',
  styleUrl: './submission.component.css'
})
export class SubmissionComponent {
  constructor(private authService: AuthService) {
    this.loadData();
  }
  successtoast = false;

  selectedTabLabel: string = 'Resume';
  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabLabel = event.tab.textLabel.split(" ").join("");
  }

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      console.error('User ID not found.');
      return;
    }

    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      if (file) {
        this.authService.uploadRequirement(userId, file, this.selectedTabLabel).subscribe(
          response => {
            console.log('File uploaded successfully:', response);
            Swal.fire({
              title: "Uploaded Successfully!",
              text: "You can view your submissions and their approval status on the table below.",
              icon: "success"
            });
            this.loadData();
          },
          error => {
            console.error('Error uploading file:', error);
            // Handle error, e.g., show an error message to the user
          }
        );
      }
    });
  }



  user: any;
  students: any;
  datalist: any[] = [];
  dataSource: any;

  loadData() {
    this.user = this.authService.getCurrentUserId();
    this.authService.getRequirementSubmissionsByUser(this.user).subscribe(res => {
      if(res){
        this.datalist = res;
        this.dataSource = new MatTableDataSource(this.datalist);
        console.log(this.datalist);
      }else{
        console.log("No submissions yet.")
      }
    }, error => {
      console.log(error);
    });
  }

  downloadRequirement(submissionId: number, fileName: string) {
    this.authService.downloadRequirement(submissionId).subscribe(
      (data: any) => {
        saveAs(data, fileName);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    );
  }


}