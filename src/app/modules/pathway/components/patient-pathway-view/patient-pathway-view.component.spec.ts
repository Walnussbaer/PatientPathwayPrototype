import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientPathwayViewComponent } from './patient-pathway-view.component';

describe('PatientPathwayViewComponent', () => {
  let component: PatientPathwayViewComponent;
  let fixture: ComponentFixture<PatientPathwayViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPathwayViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPathwayViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
