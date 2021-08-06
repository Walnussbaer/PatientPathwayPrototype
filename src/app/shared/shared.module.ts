import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule} from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {MatSnackBarModule} from '@angular/material/snack-bar'; 



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatButtonModule,
    FontAwesomeModule,
    MatSnackBarModule
  ],
  exports: [
    MatButtonModule,
    FontAwesomeModule,
    MatSnackBarModule
    
  ]
})
export class SharedModule { }
