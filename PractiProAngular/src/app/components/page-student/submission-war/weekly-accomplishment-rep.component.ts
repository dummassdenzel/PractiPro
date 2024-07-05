import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { Subscription, concatAll, concatMap } from 'rxjs';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-weekly-accomplishment-rep',
  standalone: true,
  imports: [FilterPipe, CommonModule, FormsModule, MatTabsModule, CommonModule, MatButtonModule, MatMenuModule, NgxPaginationModule],
  templateUrl: './weekly-accomplishment-rep.component.html',
  styleUrl: './weekly-accomplishment-rep.component.css'
})
export class WeeklyAccomplishmentRepComponent implements OnInit, OnDestroy {
  searchweek: any;
  userId: any;
  datalist: any[] = [];
  origlist: any;
  searchtext: any;
  tabWeekNumbers: number[] = [1];
  selectedTabWeek: number = 1;
  selectedRecord: any;
  selectedRecordActivities: any[] = [];
  initialRecordActivities: any[] = [];
  private subscriptions = new Subscription();
  p: number = 1;
  selectedIndex: number = 0;
  disableTabChangeEvent: boolean = false;


  constructor(private service: AuthService, private dialog: MatDialog) {
    this.userId = this.service.getCurrentUserId();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit() {
    this.loadWarRecord();
    this.loadMaxWeeks();

  }

  loadWarRecord() {
    this.subscriptions.add(
      this.service.getWarRecords(this.userId, this.selectedTabWeek).subscribe((res: any) => {
        this.selectedRecord = res.payload[0]
        this.loadWarActivities();
      })
    )
  }

  loadWarActivities() {
    if (this.selectedRecord) {
      this.subscriptions.add(
        this.service.getWarActivities(this.selectedRecord.id).subscribe((res: any) => {
          this.selectedRecordActivities = res.payload
          this.initialRecordActivities = JSON.parse(JSON.stringify(res.payload));
          if (this.selectedRecordActivities.length === 0) {
            this.addRow()
          }
        })
      )
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    if (this.disableTabChangeEvent) {
      return;
    }
    const currentIndex = this.tabWeekNumbers.indexOf(this.selectedTabWeek);
    const newIndex = event.index;
    const newTabWeek = parseInt(event.tab.textLabel.replace('Week ', ''), 10);

    if (this.hasUnsavedChanges()) {
      this.selectTabIndex(currentIndex);
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Do you want to leave without saving?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, leave',
        cancelButtonText: 'No, stay'
      }).then((result) => {
        this.disableTabChangeEvent = false;
        if (result.isConfirmed) {
          this.performTabChange(newIndex, newTabWeek);
        } else {
          this.selectTabIndex(currentIndex);
        }
      });
    } else {
      this.performTabChange(newIndex, newTabWeek);
    }
  }

  selectTabIndex(index: number) {
    this.disableTabChangeEvent = true;
    this.selectedIndex = index;
    setTimeout(() => {
      this.disableTabChangeEvent = false;
    }, 1);
  }

  performTabChange(newIndex: number, newTabWeek: number) {
    this.disableTabChangeEvent = true;
    this.selectedIndex = newIndex;
    this.selectedRecordActivities = [];
    this.selectedTabWeek = newTabWeek;
    this.loadWarRecord();
    this.addRow();
    setTimeout(() => {
      this.disableTabChangeEvent = false;
    }, 1);
  }


  addRow() {
    const newActivity = {
      description: '',
      date: '',
      startTime: '09:00',
      endTime: '17:00',
    };
    this.selectedRecordActivities.push(newActivity);
  }

  saveChanges() {
    this.subscriptions.add(
      this.service.checkIfWeekHasWarRecord(this.userId, this.selectedTabWeek).subscribe((res: any) => {
        if (res.payload.length === 0) {
          if (this.selectedRecordActivities.length <= 1 && this.selectedRecordActivities[0].description === '') {
            Swal.fire({
              title: `You haven't entered anything.`,
              text: `Please fill up a row with details first.`,
              icon: `question`
            })
            return
          }
          const newRecord = {
            student_id: this.userId,
            week: this.selectedTabWeek
          }
          this.subscriptions.add(
            this.service.createWarRecord(newRecord).subscribe((res: any) => {
              this.subscriptions.add(
                this.service.getWarRecords(this.userId, this.selectedTabWeek).subscribe((res: any) => {
                  this.selectedRecord = res.payload[0]
                  this.saveIteration();
                })
              )
            }))
        } else {
          this.saveIteration();
        }
      }))
  }

  saveIteration() {
    this.selectedRecordActivities = this.selectedRecordActivities.map(activity => ({
      ...activity,
      war_id: this.selectedRecord?.id
    }));
    this.service.clearWarActivities(this.selectedRecord.id).subscribe(res => {
      this.selectedRecordActivities.forEach(activity => {
        this.service.saveWarActivities(activity).subscribe((res: any) => {
        }
        )
      })
      Swal.fire({
        title: 'Changes Saved Successfully!',
        icon: 'success'
      })
      this.initialRecordActivities = JSON.parse(JSON.stringify(this.selectedRecordActivities));
    })
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.selectedRecordActivities) !== JSON.stringify(this.initialRecordActivities);
  }

  submitWarRecord() {
    if (this.selectedRecordActivities.length <= 1 && this.selectedRecordActivities[0].description === '') {
      Swal.fire({
        title: `You haven't entered anything.`,
        text: `Please fill up a row with details first.`,
        icon: `question`
      })
      return
    }
    Swal.fire({
      title: 'Are you sure you want to submit this report?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const recordSubmitted = {
          isSubmitted: 1,
          id: this.selectedRecord.id
        }
        this.subscriptions.add(
          this.service.submitWarRecord(recordSubmitted).subscribe((res: any) => {
            Swal.fire({
              title: `Successfully submitted report!`,
              text: `This report can now be evaluated by your supervisor.`,
              icon: `success`
            })
          })
        )
      }
    });
  }

  loadMaxWeeks() {
    this.subscriptions.add(
      this.service.getSubmissionMaxWeeks('student_war_records', this.userId).subscribe(
        res => {
          this.tabWeekNumbers = res;
        },
        error => {
          console.error('Error fetching week numbers:', error);
        }
      ));
  }


  addNewTab() {
    const nextWeekNumber = this.tabWeekNumbers[this.tabWeekNumbers.length - 1] + 1;
    this.tabWeekNumbers.push(nextWeekNumber);
  }

  deleteRow(activityId: number) {
    Swal.fire({
      title: "Are you sure you want to delete this row?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectedRecordActivities = this.selectedRecordActivities.filter((activity: any) => activity.id !== activityId);
        Swal.fire({
          toast: true,
          position: "top-end",
          title: `Row successfully deleted.`,
          text: `Please don't forget to save your changes.`,
          icon: "success",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          showCloseButton: true,
        });
        if (this.selectedRecordActivities.length === 0) {
          this.addRow();
        }
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
        table: 'comments_war'
      }
    })
    // this.subscriptions.add(
    //   popup.afterClosed().subscribe(res => {

    //   }));
  }

}


// setFilter(filter: string) {
//   this.datalist = this.origlist;
//   switch (filter) {
//     case 'all':
//       this.datalist = this.origlist;
//       break;
//     case 'a-approved':
//       this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Approved');
//       break;
//     case 'a-unapproved':
//       this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Unapproved');
//       break;
//     case 'a-pending':
//       this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Pending');
//       break;
//     case 's-approved':
//       this.datalist = this.datalist.filter((user: any) => user.supervisor_approval === 'Approved');
//       break;
//     case 's-unapproved':
//       this.datalist = this.datalist.filter((user: any) => user.supervisor_approval === 'Unapproved');
//       break;
//     case 's-pending':
//       this.datalist = this.datalist.filter((user: any) => user.supervisor_approval === 'Pending');
//       break;
//   }
// }

// setFilterWeek(week: any) {
//   this.datalist = this.origlist;
//   this.datalist = this.datalist.filter((user: any) => user.week === week);

// }