import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-updatepopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatDialogActions, MatDialogClose],
  templateUrl: './updatepopup.component.html',
  styleUrl: './updatepopup.component.css'
})
export class UpdatepopupComponent implements OnInit {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<UpdatepopupComponent>) { }

  rolelist: any;
  editdata: any;


  ngOnInit(): void {
    this.service.GetAllRoles().subscribe(res => {
      this.rolelist = res;
      console.log("Current user ID: " + this.data.usercode);
    });
    if (this.data.usercode != null && this.data.usercode != '') {
      this.service.getUser(this.data.usercode).subscribe((res: any) => {
        this.editdata = res.payload[0]; // Access data from the payload property
        this.updateform.setValue({
          id: this.editdata.id,
          firstName: this.editdata.firstName,
          lastName: this.editdata.lastName,
          email: this.editdata.email,
          password: this.editdata.password,
          role: this.editdata.role,
          isActive: this.editdata.isActive
        });

      })

    }
    else {
      alert("No user selected.");
    }
  }


  updateform = this.builder.group({
    id: this.builder.control(''),
    firstName: this.builder.control(''),
    lastName: this.builder.control(''),
    email: this.builder.control(''),
    password: this.builder.control(''),
    role: this.builder.control('', Validators.required),
    isActive: this.builder.control(false)
  });

  updateUser() {
    if (this.updateform.valid) {
      this.service.Updateuser(this.updateform.value.id, this.updateform.value).subscribe(res => {
        console.log("Updated successfully.");
        this.dialog.close();
      }, error => {
        alert("Unable to change user role. User might have dependent properties.")
      })
    } else {
      alert("Please Select Role.");
    }
  }

  deleteUser() {
    Swal.fire({
      title: "Are you sure?",
      text: "Deleting a user is not reversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#20284a",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialog.close();
        const userId = this.data.usercode;
        console.log('Deleting user with ID:', userId);
        this.service.deleteUser(userId).subscribe(
          res => {
          }, error => {
            if (error.status == 404) {
              console.log('Successfully deleted user ID:', userId);
              Swal.fire({
                title: "Deleted!",
                text: "The user has been deleted.",
                icon: "success"
              });
              
            }
          });
      }
    });
  }

  // this.service.Updateuser(this.updateform.value.id, this.updateform.value).subscribe(res => {
  //   console.log("Updated successfully.");
  //   this.dialog.close();
  // }, error => {
  //   alert("Unable to change user role. User might have dependent properties.")
  // })

}



