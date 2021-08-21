import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPathwayComponent } from './components/patient-pathway/patient-pathway.component';
import { MglTimelineModule } from 'angular-mgl-timeline';
import { PatientPathwayViewComponent } from './components/patient-pathway-view/patient-pathway-view.component';
import { PatientPathwayControlComponent } from './components/patient-pathway-control/patient-pathway-control.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatientPathwayControlHelpDialogComponent } from './components/patient-pathway-control-help-dialog/patient-pathway-control-help-dialog.component';
import { PathwayAppointmentCreatorComponent } from './components/creators/pathway-appointment-creator/pathway-appointment-creator.component';
import { PatientPathwayHeaderComponent } from './components/patient-pathway-header/patient-pathway-header.component';
import { PatientPathwayContentComponent } from './components/patient-pathway-content/patient-pathway-content.component';



@NgModule({
  declarations: [
    PatientPathwayComponent,
    PatientPathwayViewComponent,
    PatientPathwayControlComponent,
    PatientPathwayControlHelpDialogComponent,
    PathwayAppointmentCreatorComponent,
    PatientPathwayHeaderComponent,
    PatientPathwayContentComponent
  ],
  imports: [
    CommonModule,
    MglTimelineModule,
    SharedModule
  ]
})
export class PathwayModule { }
