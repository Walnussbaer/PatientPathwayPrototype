import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPathwayAppointmentCreatorComponent } from './patient-pathway-appointment-creator.component';

describe('PatientPathwayAppointmentCreatorComponent', () => {
  let component: PatientPathwayAppointmentCreatorComponent;
  let fixture: ComponentFixture<PatientPathwayAppointmentCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPathwayAppointmentCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPathwayAppointmentCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
