import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPathwayComponent } from './patient-pathway.component';

describe('PatientPathwayComponent', () => {
  let component: PatientPathwayComponent;
  let fixture: ComponentFixture<PatientPathwayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPathwayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPathwayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
