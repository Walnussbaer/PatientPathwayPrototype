import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpeechSynthesisService } from './shared/services/speech/speech-synthesis.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'PatientPathwayPrototype';

  public constructor(private speechSynthesisService: SpeechSynthesisService, private snackBarService: MatSnackBar) {
   
    if (this.speechSynthesisService.initSynthesis() == false) {

      snackBarService.open("Ihr Browser unterstützt keine Sprachsynthese. Bitte verwenden Sie eine aktuelle Version von Google Chrome oder Mirosoft Edge","Alles klar");

    }

  }

}
