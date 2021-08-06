import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPathwayComponent } from './components/patient-pathway/patient-pathway.component';
import { MglTimelineModule } from 'angular-mgl-timeline';
import { PathwayViewComponent } from './components/pathway-view/pathway-view.component';
import { PathwayControlComponent } from './components/pathway-control/pathway-control.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    PatientPathwayComponent,
    PathwayViewComponent,
    PathwayControlComponent
  ],
  imports: [
    CommonModule,
    MglTimelineModule,
    SharedModule
  ]
})
export class PathwayModule { }
