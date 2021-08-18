import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPathwayHeaderComponent } from './patient-pathway-header.component';

describe('PatientPathwayHeaderComponent', () => {
  let component: PatientPathwayHeaderComponent;
  let fixture: ComponentFixture<PatientPathwayHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPathwayHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPathwayHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
