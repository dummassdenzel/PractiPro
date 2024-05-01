import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDatetimeComponent } from './admin-datetime.component';

describe('AdminDatetimeComponent', () => {
  let component: AdminDatetimeComponent;
  let fixture: ComponentFixture<AdminDatetimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDatetimeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminDatetimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
