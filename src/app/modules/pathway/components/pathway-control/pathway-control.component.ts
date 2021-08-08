import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCoffee, faMicrophone, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { WebSpeechRecognitionMessage } from 'src/app/shared/services/speech/WebSpeechRecognitionMessage';
import { PathwayEvent } from '../../model/PathwayEvent';
import { PathwayAppointmentCreatorComponent } from '../creators/pathway-appointment-creator/pathway-appointment-creator.component';
import { PathwayControlHelpDialogComponent } from '../pathway-control-help-dialog/pathway-control-help-dialog.component';

@Component({
  selector: 'pathway-control',
  templateUrl: './pathway-control.component.html',
  styleUrls: ['./pathway-control.component.css'],
})
export class PathwayControlComponent implements OnInit {

  @Output() pathwayEventEmitter = new EventEmitter<PathwayEvent>();

  public speechRecognitionAvailable: boolean = false;

  public pathIsListening: boolean = false;

  public voiceControlIcon: IconDefinition = faMicrophone;

  constructor(
    private matSnackbarService: MatSnackBar, 
    private speechRecognitionService: SpeechRecognitionService,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    this.speechRecognitionAvailable = this.speechRecognitionService.initRecognition();

    // check whether we can use the speech recognition
    if (!this.speechRecognitionAvailable) {

      console.warn("Speech recognition not available. Please use Google Chrome or Microsoft Edge instead.");

      this.displayErrorMessage("Die Spracherkennung wird in diesem Browser nicht unterstützt. Bitte nutzen Sie Google Chrome oder Microsoft Edge.")

    } else {

      this.setupSpeechRecognitionBehaviour();

    }
  }

  public onActivateVoiceControl(): void {

    this.speechRecognitionService.startRecognition();
    this.pathIsListening = true;

  }

  public onDeactivateVoiceControl(): void {

    this.speechRecognitionService.stopRecognition();
    this.pathIsListening = false;

  }

  public openPathwayEventCreatorDialog(): void {

    const newPathwayEventDialog = this.dialog.open(
      PathwayAppointmentCreatorComponent,
      {
        width: "50%",
        height: "50%",
      }
    );
  }

  public openHelpDialog(): void {

    const helpDialogRef = this.dialog.open(
      PathwayControlHelpDialogComponent,
      {
        width: "300px",
        height: "80%",
      }
    )
  }

  private displayErrorMessage(errorMessage: string): void {

    this.matSnackbarService.open(
      errorMessage,
      "Verstanden", 
      {
        panelClass: ["warning-mat-snackbar"],
        duration: 8000, // in miliseconds,
        horizontalPosition: "center",
        verticalPosition: "top"
      });
  }

  /**
   * Set up the actions that should take place when the speech recognition is used. 
   * 
   * We need to do this only once during initialization of the componenent. 
   */
  private setupSpeechRecognitionBehaviour() {

      // we subscribe to a potential result from the speech recognition service
      this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {
    
          // get the recognition result ("the command that was said")
          let recognitionResult = message.data;
    
          // conert transcript to lower case, since at this point capital or small letters do not matter
          recognitionResult = recognitionResult.toLowerCase();
    
          // we need to do a string check on the transcript, since grammars don't work yet in the Google implementation of the Web Speech API
          switch (recognitionResult) {
    
            case "neuer termin": {
    
              this.openPathwayEventCreatorDialog();

              // get back the new event from the dialog
    
              //this.pathwayEventEmitter.emit(newPathwayEvent);
    
              break;
    
            }
            case "hilfe": {
    
              this.openHelpDialog();
              break;
            }
    
            default: {
    
              this.displayErrorMessage("Dieses Sprachkommando wird nicht unterstützt.");
              break;
    
            }
          }
        }
      });

      this.speechRecognitionService.onSpeechRecognitionStarted().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {

          console.log("speech recognition started");
          this.pathIsListening = true;

        }
      });

      this.speechRecognitionService.onSpeechRecognitionEnded().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {

          console.log("speech recognition ended");
          this.speechRecognitionService.stopRecognition();
          this.pathIsListening = false;

        }
      });

      
      this.speechRecognitionService.onSpeechRecognitionError().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {

          console.error("error occured");
          
          this.speechRecognitionService.stopRecognition();

          this.displayErrorMessage(message.data);     

          this.pathIsListening = false;

        }
      });
  }
}
