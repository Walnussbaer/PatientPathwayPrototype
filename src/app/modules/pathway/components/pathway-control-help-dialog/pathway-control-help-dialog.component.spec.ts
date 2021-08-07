import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathwayControlHelpDialogComponent } from './pathway-control-help-dialog.component';

describe('PathwayControlHelpDialogComponent', () => {
  let component: PathwayControlHelpDialogComponent;
  let fixture: ComponentFixture<PathwayControlHelpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathwayControlHelpDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathwayControlHelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
