import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PathwayViewComponent } from './modules/pathway/components/pathway-view/pathway-view.component';
import { PatientPathwayComponent } from './modules/pathway/components/patient-pathway/patient-pathway.component';

const routes: Routes = [

  // pathway view for patient
  {
    path: "myPath",
    component: PathwayViewComponent
  },

  // default route
  {
    path: '',
    component: PathwayViewComponent,
    pathMatch: 'full'
  },

  // wildcard route
  {
    path: "**",
    component: PathwayViewComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
