import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientPathwayComponent } from './modules/pathway/patient-pathway/patient-pathway.component';

const routes: Routes = [

  // pathway view for patient
  {
    path: "myPath",
    component: PatientPathwayComponent
  },

  // default route
  {
    path: '',
    component: PatientPathwayComponent,
    pathMatch: 'full'
  },

  // wildcard route
  {
    path: "**",
    component: PatientPathwayComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
