import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faMicrophone, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { SpeechSynthesisService } from 'src/app/shared/services/speech/speech-synthesis.service';
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

  /**
   * This event emitter emits an event when a new pathway event got created by the user. 
   */
  @Output() pathwayEventEmitter = new EventEmitter<PathwayEvent>();

  /**
   * Indicated whether the speech recognition is availabe for usage. 
   */
  public speechRecognitionAvailable: boolean = false;

  /**
   * Indicates whether the component is currently listening for user input via microphone. 
   */
  public pathIsListening: boolean = false;

  /**
   * The definition of the microphone activation button. 
   */
  public voiceControlIcon: IconDefinition = faMicrophone;

  /**
   * The currently active subscriptions for observables. 
   */
  private currentSpeechRecognitionServiceSubscriptions: Array<Subscription> = [];

  constructor(
    private matSnackbarService: MatSnackBar, 
    private speechRecognitionService: SpeechRecognitionService,
    private speechSynthesisService: SpeechSynthesisService,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    this.speechSynthesisService.initSynthesis();
    this.speechSynthesisService.getAvailableVoices();
    this.speechRecognitionAvailable = this.speechRecognitionService.initRecognition();

    // check whether we can use the speech recognition
    if (!this.speechRecognitionAvailable) {

      console.warn("Speech recognition not available. Please use Google Chrome or Microsoft Edge instead.");

      this.displayErrorMessage("Die Spracherkennung wird in diesem Browser nicht unterstützt. Bitte nutzen Sie Google Chrome oder Microsoft Edge.")

    } else {

      this.setupSpeechRecognitionBehaviour();
      // start to listen for voice commands
      this.speechRecognitionService.startRecognition();

    }
  }

  /**
   * Gets called when the user wants an explanation of the pathway controls. 
   */
     public explainPathwayControls(): void {

      let utteranceToSpeak = ("".concat(
      "Das ist ihr persönlicher Patientenpfad.",
      'Folgende Sprachbefehle stehen zur Verfügung:',
      "Neuer Termin: Ermöglicht das Anlegen eines neuen Termins.",
      "Hilfe: Öffnet ein Fenster mit einer Übersicht über die Sprachbefehle."));

      this.speechSynthesisService.speakUtterance(utteranceToSpeak);

    }
  /**
   * Gets called when the user pressed the microphone button. 
   */
  public onActivateVoiceControl(): void {

    this.restartSpeechRecognition();

  }

  /**
   * Gets called when the user pressed the microphone button while the speech recognition is running.
   */
  public onDeactivateVoiceControl(): void {

    this.speechRecognitionService.stopRecognition();

  }

  /**
   * Gets called when the speech recognition recognized that the user needs help. 
   */
  public openHelpDialog(): void {

    const helpDialogRef = this.dialog.open(
      PathwayControlHelpDialogComponent,
      {
        width: "300px",
        height: "80%",
      }
    );

    helpDialogRef.afterClosed().subscribe(result => {
      
      this.restartSpeechRecognition();
      
    })

  }

  /**
   * Use this method to display user friendly error message to the user. 
   * 
   * @param errorMessage the error message that shall be displayed 
   */
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
      this.currentSpeechRecognitionServiceSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {

          this.speechRecognitionService.stopRecognition();
    
          // get the recognition result ("the command that was said")
          let recognitionResult = message.data;
    
          // conert transcript to lower case, since at this point capital or small letters do not matter
          recognitionResult = recognitionResult.toLowerCase();
    
          // we need to do a string check on the transcript, since grammars don't work yet in the Google implementation of the Web Speech API
          switch (recognitionResult) {
    
            case "neuer termin": {
    
              this.openAndHandlePathwayAppointmentCreatorDialog();
    
              break;
    
            }
            case "hilfe": {

              this.openHelpDialog();

              break;
            }
    
            default: {

              this.displayErrorMessage("Dieses Sprachkommando wird nicht unterstützt.");

              // restart recognition
              //this.setupSpeechRecognitionBehaviour();
              this.restartSpeechRecognition();

              break;
    
            }
          }
        }
      }));

      this.currentSpeechRecognitionServiceSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionStarted().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {

          this.pathIsListening = true;

        }
      }));

      this.currentSpeechRecognitionServiceSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionEnded().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {

         this.pathIsListening = false;

        }
      }));

      
      this.currentSpeechRecognitionServiceSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionError().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {
          
          console.warn(message.data);

          // when an error occured, we just restart the recoginition for now
          // TODO in a future implementation, the error handling at this point should be more precise, e.g., if the error indicates that the user has no microphone enabled, then we shouln't just restart the recognition
          this.restartSpeechRecognition();

          //this.displayErrorMessage(message.data);   
        }
      }));
  }

  /**
   * Clean up all currently active subscriptions. 
   */
  private unsubscribeFromAllSubscriptions(): void {

    this.currentSpeechRecognitionServiceSubscriptions.forEach(subscription => {

      subscription.unsubscribe();

    })

    this.currentSpeechRecognitionServiceSubscriptions = [];

  }

  /**
   * Gets called when the speech recognition recognized that the user wants to create a new pathway event. 
   */
     private openAndHandlePathwayAppointmentCreatorDialog(): void {

      this.speechRecognitionService.stopRecognition();
      this.pathIsListening = false;
      this.unsubscribeFromAllSubscriptions();

      const pathwayAppointmentCreatorDialog = this.dialog.open(
        PathwayAppointmentCreatorComponent,
        {
          //width: "80%",
          //height: "50%",
        }
      );
  
      // define what shall happen after the pathway event creator component dialog is closed
      pathwayAppointmentCreatorDialog.afterClosed().subscribe(result => {
  
        if (result) {
  
          this.pathwayEventEmitter.emit(result as PathwayEvent);
  
        }
  
        this.restartSpeechRecognition();
      });
  
    }

    /**
     * Reinitializes the speech recognition service, the component behaviour and starts the recognition.
     */
    private restartSpeechRecognition() {

      console.log("Restarting speech recognition");
      this.unsubscribeFromAllSubscriptions();
      this.speechRecognitionService.stopRecognition();

      this.speechRecognitionService.initRecognition();
      this.setupSpeechRecognitionBehaviour();
      this.speechRecognitionService.startRecognition();

    }
}
