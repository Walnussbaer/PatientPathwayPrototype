import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { WebSpeechRecognitionMessage } from 'src/app/shared/services/speech/WebSpeechRecognitionMessage';

/**
 * A component to be used in a dialog to show information about voice commands and the usage of the pathway to the user. 
 */
@Component({
  selector: 'patient-pathway-control-help-dialog',
  templateUrl: './patient-pathway-control-help-dialog.component.html',
  styleUrls: ['./patient-pathway-control-help-dialog.component.css']
})
export class PatientPathwayControlHelpDialogComponent implements OnInit {

  /**
   * The currently active subscriptions for the speech recognition. 
   */
  private currentSpeechRecognitionSubscriptions: Array<Subscription> = [];

  constructor(private speechRecognitionService: SpeechRecognitionService, private dialogRef: MatDialogRef<PatientPathwayControlHelpDialogComponent>) {

    // we want the user to use his/ her voice to close the dialog
    this.dialogRef.disableClose = true;
   }

  ngOnInit(): void {

    this.restartSpeechRecognition();

  }

  /**
   * Set up the behaviour for the speech recognition, such as inbound voice commands from the user. 
   */
  private setupSpeechRecognitionBehaviour(): void {

    // define what shall happen when we got an inbound voice command from the user
    this.currentSpeechRecognitionSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.speechRecognitionService.stopRecognition();

        let recognitionResult: string = (message.data as string).toLowerCase();

        if (recognitionResult.match(/\w*(dialog)\s(schließen)\w*/)) {

          this.unsubscribeFromAllSpeechRecognitionSubscriptions();
          this.dialogRef.close();

        } 
      }
    }));

    // define what shall happened when the recognition has ended, e.g. user did not say anything
    this.currentSpeechRecognitionSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionEnded().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {
        this.restartSpeechRecognition();
      }
    }));

    // define what shall happen when the speech recognition encountered an error
    this.currentSpeechRecognitionSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionError().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {
        this.restartSpeechRecognition(); // just restart for now
      }
    }));

  }

  /**
   * Sets up speech recognition and starts it. 
   */
  private restartSpeechRecognition() {

    this.unsubscribeFromAllSpeechRecognitionSubscriptions();

    this.speechRecognitionService.stopRecognition();
    
    this.speechRecognitionService.initRecognition();
    this.setupSpeechRecognitionBehaviour();
    this.speechRecognitionService.startRecognition();

  }

  /**
   * Cleans up the speech recognition subscriptions just to be safe and free resources. 
   */
  private unsubscribeFromAllSpeechRecognitionSubscriptions() {

    this.currentSpeechRecognitionSubscriptions.forEach(sub => {
      sub.unsubscribe();
    })

  }

}
