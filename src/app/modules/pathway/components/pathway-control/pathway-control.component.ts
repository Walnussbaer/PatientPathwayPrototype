import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCoffee, faMicrophone, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'pathway-control',
  templateUrl: './pathway-control.component.html',
  styleUrls: ['./pathway-control.component.css']
})
export class PathwayControlComponent implements OnInit {

  @Input() speechRecognitionAvailable: boolean = false;

  voiceControlIcon: IconDefinition = faMicrophone;

  constructor(private matSnackbarService: MatSnackBar) { }

  ngOnInit(): void {

    if (!this.speechRecognitionAvailable) {

      this.matSnackbarService.open(
        "Die Spracherkennung wird in diesem Browser nicht unterstützt. Bitte nutzen Sie Google Chrome oder Microsoft Edge.",
        "Verstanden", 
        {
          panelClass: ["warning-mat-snackbar"]
        });

    }

  }

  onVoiceRecognitionActivated() {

    

  }

}
