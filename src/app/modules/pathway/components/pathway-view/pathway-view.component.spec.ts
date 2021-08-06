import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathwayViewComponent } from './pathway-view.component';

describe('PathwayViewComponent', () => {
  let component: PathwayViewComponent;
  let fixture: ComponentFixture<PathwayViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathwayViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathwayViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
