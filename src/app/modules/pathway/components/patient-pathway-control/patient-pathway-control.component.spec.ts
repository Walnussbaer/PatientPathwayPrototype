import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPathwayControlComponent } from './patient-pathway-control.component';

describe('PatientPathwayControlComponent', () => {
  let component: PatientPathwayControlComponent;
  let fixture: ComponentFixture<PatientPathwayControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPathwayControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPathwayControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
