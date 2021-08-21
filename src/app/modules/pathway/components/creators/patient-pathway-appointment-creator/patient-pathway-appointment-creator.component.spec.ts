import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathwayAppointmentCreatorComponent } from './patient-pathway-appointment-creator.component';

describe('PatientPathwayAppointmentCreatorComponent', () => {
  let component: PathwayAppointmentCreatorComponent;
  let fixture: ComponentFixture<PathwayAppointmentCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathwayAppointmentCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathwayAppointmentCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
