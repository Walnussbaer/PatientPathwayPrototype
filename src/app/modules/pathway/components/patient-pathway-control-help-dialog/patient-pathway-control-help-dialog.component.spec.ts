import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPathwayControlHelpDialogComponent } from './patient-pathway-control-help-dialog.component';

describe('PatientPathwayControlHelpDialogComponent', () => {
  let component: PatientPathwayControlHelpDialogComponent;
  let fixture: ComponentFixture<PatientPathwayControlHelpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPathwayControlHelpDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPathwayControlHelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
