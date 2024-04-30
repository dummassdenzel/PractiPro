import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWeeklyaccomplismentComponent } from './admin-weeklyaccomplisment.component';

describe('AdminWeeklyaccomplismentComponent', () => {
  let component: AdminWeeklyaccomplismentComponent;
  let fixture: ComponentFixture<AdminWeeklyaccomplismentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminWeeklyaccomplismentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminWeeklyaccomplismentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
