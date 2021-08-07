import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule} from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {MatSnackBarModule} from '@angular/material/snack-bar'; 
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'; 
import {MatDialogModule} from '@angular/material/dialog'; 



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatButtonModule,
    FontAwesomeModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  exports: [
    MatButtonModule,
    FontAwesomeModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
    
  ]
})
export class SharedModule { }
