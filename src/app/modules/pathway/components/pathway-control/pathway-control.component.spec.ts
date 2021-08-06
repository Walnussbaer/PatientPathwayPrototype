import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathwayControlComponent } from './pathway-control.component';

describe('PathwayControlComponent', () => {
  let component: PathwayControlComponent;
  let fixture: ComponentFixture<PathwayControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathwayControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathwayControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
