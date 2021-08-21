import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientPathwayViewComponent } from './modules/pathway/components/patient-pathway-view/patient-pathway-view.component';
import { PatientPathwayComponent } from './modules/pathway/components/patient-pathway/patient-pathway.component';

const routes: Routes = [

  // pathway view for patient
  {
    path: "myPath",
    component: PatientPathwayViewComponent
  },

  // default route
  {
    path: '',
    component: PatientPathwayViewComponent,
    pathMatch: 'full'
  },

  // wildcard route
  {
    path: "**",
    component: PatientPathwayViewComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
