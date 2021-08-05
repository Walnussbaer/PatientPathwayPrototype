import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPathwayComponent } from './patient-pathway/patient-pathway.component';
import { MglTimelineModule } from 'angular-mgl-timeline';



@NgModule({
  declarations: [
    PatientPathwayComponent
  ],
  imports: [
    CommonModule,
    MglTimelineModule
  ]
})
export class PathwayModule { }
