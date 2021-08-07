import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPathwayComponent } from './components/patient-pathway/patient-pathway.component';
import { MglTimelineModule } from 'angular-mgl-timeline';
import { PathwayViewComponent } from './components/pathway-view/pathway-view.component';
import { PathwayControlComponent } from './components/pathway-control/pathway-control.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PathwayControlHelpDialogComponent } from './components/pathway-control-help-dialog/pathway-control-help-dialog.component';
import { PathwayEventCreatorComponent } from './components/pathway-event-creator/pathway-event-creator.component';



@NgModule({
  declarations: [
    PatientPathwayComponent,
    PathwayViewComponent,
    PathwayControlComponent,
    PathwayControlHelpDialogComponent,
    PathwayEventCreatorComponent
  ],
  imports: [
    CommonModule,
    MglTimelineModule,
    SharedModule
  ]
})
export class PathwayModule { }
