import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStudentsubmittedreqComponent } from './admin-studentsubmittedreq.component';

describe('AdminStudentsubmittedreqComponent', () => {
  let component: AdminStudentsubmittedreqComponent;
  let fixture: ComponentFixture<AdminStudentsubmittedreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStudentsubmittedreqComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminStudentsubmittedreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
