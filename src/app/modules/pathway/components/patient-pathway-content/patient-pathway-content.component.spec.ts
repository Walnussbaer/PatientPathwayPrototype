import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPathwayContentComponent } from './patient-pathway-content.component';

describe('PatientPathwayContentComponent', () => {
  let component: PatientPathwayContentComponent;
  let fixture: ComponentFixture<PatientPathwayContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPathwayContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPathwayContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
