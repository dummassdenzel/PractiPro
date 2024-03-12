import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [AdminSidebarComponent, AdminNavbarComponent, CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  constructor(private service: AuthService){
    this.Loaduser();
  }
  ngOnInit(): void {
    initFlowbite();
  }
  userlist: any;
  dataSource: any;

  Loaduser(){
    this.service.GetAll().subscribe(res => {
      this.userlist = res;
    });
  }

  displayedColumns: string[] = ['id', 'name', 'email', 'status', 'action'];

  Updateuser(code: any){

  }  

}
