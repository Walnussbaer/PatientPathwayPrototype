import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathwayAppointmentCreatorComponent } from './pathway-appointment-creator.component';

describe('PathwayAppointmentCreatorComponent', () => {
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
