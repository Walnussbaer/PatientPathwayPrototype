import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { WebSpeechRecognitionMessage } from 'src/app/shared/services/speech/WebSpeechRecognitionMessage';

@Component({
  selector: 'pathway-control-help-dialog',
  templateUrl: './pathway-control-help-dialog.component.html',
  styleUrls: ['./pathway-control-help-dialog.component.css']
})
export class PathwayControlHelpDialogComponent implements OnInit {

  /**
   * The currently active subscriptions for observables. 
   */
  private currentSpeechRecognitionServiceSubscriptions: Array<Subscription> = [];


  constructor(private speechRecognitionService: SpeechRecognitionService, private dialogRef: MatDialogRef<PathwayControlHelpDialogComponent>) {
    this.dialogRef.disableClose = true;
   }

  ngOnInit(): void {



    this.speechRecognitionService.initRecognition();
    this.setupSpeechRecognitionBehaviour();
    this.speechRecognitionService.startRecognition();

  }

  private setupSpeechRecognitionBehaviour(): void {

    this.currentSpeechRecognitionServiceSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.speechRecognitionService.stopRecognition();
        let recognitionResult: string = message.data;

        recognitionResult = recognitionResult.toLowerCase();

        if (recognitionResult == "dialog schließen") {

          this.unsubscribeFromAllSubscriptions();
          this.dialogRef.close();

        } 
      }
    }));

    this.currentSpeechRecognitionServiceSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionEnded().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {
        this.restartSpeechRecognition();
      }
    }));

    this.currentSpeechRecognitionServiceSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionError().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {
        this.restartSpeechRecognition();
      }
    }));

  }

  private restartSpeechRecognition() {

    this.unsubscribeFromAllSubscriptions();

    this.speechRecognitionService.stopRecognition();
    
    this.speechRecognitionService.initRecognition();
    this.setupSpeechRecognitionBehaviour();
    this.speechRecognitionService.startRecognition();

  }

  private unsubscribeFromAllSubscriptions() {

    this.currentSpeechRecognitionServiceSubscriptions.forEach(sub => {
      sub.unsubscribe();
    })

  }

}
