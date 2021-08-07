import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathwayEventCreatorComponent } from './pathway-event-creator.component';

describe('PathwayEventCreatorComponent', () => {
  let component: PathwayEventCreatorComponent;
  let fixture: ComponentFixture<PathwayEventCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathwayEventCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathwayEventCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
