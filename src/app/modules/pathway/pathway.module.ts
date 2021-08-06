import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPathwayComponent } from './components/patient-pathway/patient-pathway.component';
import { MglTimelineModule } from 'angular-mgl-timeline';
import { PathwayViewComponent } from './components/pathway-view/pathway-view.component';



@NgModule({
  declarations: [
    PatientPathwayComponent,
    PathwayViewComponent
  ],
  imports: [
    CommonModule,
    MglTimelineModule
  ]
})
export class PathwayModule { }
