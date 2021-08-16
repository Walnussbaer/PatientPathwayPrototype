import { Component, Inject, OnInit } from '@angular/core';
import { concat, Observable, of, Subscription } from 'rxjs';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { WebSpeechRecognitionMessage } from 'src/app/shared/services/speech/WebSpeechRecognitionMessage';
import { PathwayEvent } from '../../../model/PathwayEvent';
import { concatMap, delay, mergeMap } from 'rxjs/operators';
import { WebSpeechRecognitionMessageType } from 'src/app/shared/services/speech/WebSpeechRecognitionMessageType';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { SpeechSynthesisService } from 'src/app/shared/services/speech/speech-synthesis.service';
import { faMicrophone, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { WebSpeechSynthesisMessage } from 'src/app/shared/services/speech/WebSpeechSynthesisMessage';

@Component({
  selector: 'app-pathway-appointment-creator',
  templateUrl: './pathway-appointment-creator.component.html',
  styleUrls: ['./pathway-appointment-creator.component.css']
})
export class PathwayAppointmentCreatorComponent implements OnInit {

  public userCanStartCreationProcess: boolean = false;

  public appointmentDate?: Date;

  public appointmentCaption?: string;

  public appointmentContent?: string;

  public isLastVoiceInputValid: boolean = true;

  public currentStepInAppointmentCreation = 0;

  public newPathwayEvent: PathwayEvent = {};

  public recordingFormInput: boolean = false;

  public listeningForControlCommmand: boolean = false;

  public controlIndicatorIconClass: string = "not-waiting-for-command";

  public voiceControlIcon: IconDefinition = faMicrophone;

  public speaking: boolean = false;

  public creatorContentClass: string = "is-not-recording";

  private currentFormSubscriptions: Array<Subscription> = [];

  private currentControlSubscriptions: Array<Subscription> = [];

  public dateQuestion: string = "Wann ist der Termin?";

  public captionQuestion: string ="Welchen Namen soll der Termin erhalten?";

  public contentQuestion: string = "Sie können nun noch eine Beschreibung dem Termin hinzufügen.";

  public welcomeUtterance: string = "Herzliche Willkommen zur sprachgeführten Anlegung eines neuen Termins.";

  constructor(
    private speechRecognitionService: SpeechRecognitionService, 
    private speechSynthesisService: SpeechSynthesisService,
    private matSnackbarService: MatSnackBar,
    public dialogRef: MatDialogRef<PathwayAppointmentCreatorComponent>
    ) {
      this.dialogRef.disableClose = true;
     }

  public ngOnInit(): void {

    this.speechSynthesisService.initSynthesis();

    // define error handling for speech synthesis
    this.speechSynthesisService.onErrorEvent().subscribe({
      next: (result: WebSpeechSynthesisMessage) => {

        let errorMessage = result.data;

        // clean up, because we gonna abort the whole process
        this.clearCommandInputSubscriptions();
        this.clearFormInputSubscriptions();
        
        this.matSnackbarService.open(errorMessage,"Okay",{
          panelClass: "warning-mat-snackbar",
        });

        this.closeDialogWithoutResult();
      }
    });

    // this handler also does not need to be removed
    this.speechSynthesisService.onSpeechStart().subscribe({
      next: (result => {
        this.speaking = true;
      })
    });
     
    this.startCreationProcess();
  
  }

  /**
   * Closes the dialog and does not pass a result to the containing parent component. 
   */
  public closeDialogWithoutResult() {

    this.dialogRef.close(null);

  }

  /**
   * Starts the ping pong between speech synthesizer and user. 
   */
  public startCreationProcess() {

    this.currentStepInAppointmentCreation = 0;
    this.userCanStartCreationProcess = false;

    this.speechRecognitionService.initRecognition();

    this.speechSynthesisService.onSpeechEnd().subscribe({
      complete: () => {

        this.speaking = false;
        this.userCanStartCreationProcess = true;
        this.listenForNextControlInput(this.getDateInput);
      }
    });

    // welcome the to the creation process
    this.speechSynthesisService.speakUtterance(this.welcomeUtterance);
  }

  /**
   * Start the process for getting the date of the new appointment. 
   */
  public getDateInput(): void {

    this.isLastVoiceInputValid = false;

    this.currentStepInAppointmentCreation = 1;

    this.speechSynthesisService.onSpeechEnd().subscribe({
      next: (result) => {

        this.speaking = false;
        console.log("Utterance finished!");

        // we want to start the recognition after the question was asked by the synthesizer
        this.listenForNextFormInput();
      }
    });

    this.currentFormSubscriptions!.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.speechRecognitionService.stopRecognition();
      
        let dateValue: Date;

        dateValue = new Date(message.data);

        if (dateValue.toString() == "Invalid Date") {

          this.isLastVoiceInputValid = false;

          this.matSnackbarService.open("Das ist kein valides Datum",undefined,{
            duration:3000
          });

        } else {

          this.appointmentDate = dateValue;
          this.isLastVoiceInputValid = true;
          this.listenForNextControlInput(this.getHeaderInput,this.startCreationProcess,this.getDateInput);
        }
      }
    })); 
    this.speechSynthesisService.speakUtterance(this.dateQuestion);
  }

  /**
   * Start the process for getting the caption of the new appointment. 
   */
  public getHeaderInput(): void {

    this.isLastVoiceInputValid = false;

    this.currentStepInAppointmentCreation = 2;

    this.speechSynthesisService.onSpeechEnd().subscribe({
      next: (result) => {

        this.speaking = false;
        console.log("Utterance finished!");

        // we want to start the recognition after the question was asked by the synthesizer
        this.listenForNextFormInput();
      }
    });

    this.currentFormSubscriptions!.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({

      next: (message: WebSpeechRecognitionMessage) => {

        this.speechRecognitionService.stopRecognition();

        let captionValue: string;

        captionValue = message.data;

        this.appointmentCaption = captionValue;
        this.isLastVoiceInputValid = true;

        this.listenForNextControlInput(this.getContentInput,this.getDateInput,this.getHeaderInput);

      }
    }));
    this.speechSynthesisService.speakUtterance(this.captionQuestion);
  }

  /**
   * Start the process for getting the content of the new appointment. 
   */
  public getContentInput(): void {

    this.isLastVoiceInputValid = false;

    this.currentStepInAppointmentCreation = 3;

    this.speechSynthesisService.onSpeechEnd().subscribe({
      next: (result) => {

        this.speaking = false;
        console.log("Utterance finished!");
        // we want to start the recognition after the question was asked by the synthesizer
        this.listenForNextFormInput();
      }
    });

    this.currentFormSubscriptions!.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({

      next: (message: WebSpeechRecognitionMessage) => {

        this.speechRecognitionService.stopRecognition();

        let contentValue: string;

        contentValue = message.data;

        this.appointmentContent = contentValue;
        this.isLastVoiceInputValid = true;

        this.listenForNextControlInput(this.saveAppointment,this.getHeaderInput,this.getContentInput);

      }
    }));

    this.speechSynthesisService.speakUtterance(this.contentQuestion);
  }

  /**
   * Construct the new appointment, pass it to the parent component and close the dialog.
   */
  public saveAppointment(): void {

    this.newPathwayEvent = {
      date: this.appointmentDate,
      header: this.appointmentCaption,
      content: this.appointmentContent
    }

    this.dialogRef.close(this.newPathwayEvent);
  }

  /**
   * Start the recognition and listen for next form input. 
   */
  private listenForNextFormInput(): void {

    this.speechRecognitionService.stopRecognition()

    this.setupFormInputBehaviour();
    this.speechRecognitionService.startRecognition();

  }

  /**
   * Start the recognition and listen for next control input. 
   * 
   * @param nextStep the method to call when the user called for the next step in the creation process
   * @param previousStep the method to call when the user called for the previous step in the creation process
   * @param currentStep the method to call when the suer called for reapeating the current step in the creation process
   */
  private listenForNextControlInput(nextStep: () => void, previousStep?: () => void, currentStep?: () => void): void {

    this.speechRecognitionService.stopRecognition();
    this.clearCommandInputSubscriptions();

    this.speechRecognitionService.initRecognition();
    this.setupControlInputBehaviour(nextStep,previousStep,currentStep);
    this.speechRecognitionService.startRecognition();

  }

  /**
   * Setup behaviour of speech recognition for handling command input from the user. 
   * 
   * @param nextStep the method to call when the user called for the next step in the creation process
   * @param previousStep the method to call when the user called for the previous step in the creation process
   * @param currentStep the method to call when the suer called for reapeating the current step in the creation process
   */
  private setupControlInputBehaviour(nextStep: () => void, previousStep?: () => void, currentStep?: () => void): void {

    this.currentControlSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
      next: (result: WebSpeechRecognitionMessage) => {

        this.speechRecognitionService.stopRecognition();
        this.controlIndicatorIconClass = "not-waiting-for-command";
        this.listeningForControlCommmand = false;
        
        let recognitionResult: string = (result.data as string).toLowerCase();
        
        this.clearCommandInputSubscriptions();

        // cancel the creation should always be possible
        if (recognitionResult == "dialog schließen") {

          console.log("closing appointment creation dialog");
          this.speechRecognitionService.stopRecognition();
          this.closeDialogWithoutResult();
        }

        // in case the just started the appointment creation, we can only start the creation process
        else if (recognitionResult == "start" && this.currentStepInAppointmentCreation==0){

          console.log("starting creation process");
          nextStep.call(this);
        }

        else if (recognitionResult == "weiter" && this.currentStepInAppointmentCreation>0 && this.currentStepInAppointmentCreation < 3){

          console.log("asking for next user input")
          nextStep.call(this);
        }

        else if (recognitionResult == "zurück" && this.currentStepInAppointmentCreation>0 && this.currentStepInAppointmentCreation < 4){

          console.log("going back to previous user input")
          previousStep!.call(this);
        }

        else if (recognitionResult == "neue eingabe" && this.currentStepInAppointmentCreation>0 && this.currentStepInAppointmentCreation < 4){

          console.log("repeating current step")
          currentStep!.call(this);
        }

        else if (recognitionResult == "fertig" && this.currentStepInAppointmentCreation == 3){

          //this.clearFormInputSubscriptions();
          console.log("finishing proccess")
          nextStep.call(this);
        }
        // if command was not on the previous options, then we gonna ask for a new command
        else {
          console.log("user used incorrect command");
          this.listenForNextControlInput(nextStep);
          this.controlIndicatorIconClass = "waiting-for-command"
          this.listeningForControlCommmand = true;
        }
      }
    }));

    this.currentControlSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionStarted().subscribe({
      next: (restult: WebSpeechRecognitionMessage) => {

        this.controlIndicatorIconClass = "waiting-for-command"
        this.listeningForControlCommmand = true;
      }
    }))

    this.currentControlSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionEnded().subscribe({
      next: (result: WebSpeechRecognitionMessage) => {
        
        this.listenForNextControlInput(nextStep);
        this.controlIndicatorIconClass = "waiting-for-command";
        this.listeningForControlCommmand = true;

      }
    }));

    this.currentControlSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionError().subscribe({
      next: (result: WebSpeechRecognitionMessage) => {
        
        this.listenForNextControlInput(nextStep);
        this.controlIndicatorIconClass = "waiting-for-command";
        this.listeningForControlCommmand = true;

      }
    }));
  }

  /**
   * Setup behaviour of speech recognition for handling form input from the user. 
   */
  private setupFormInputBehaviour(): void {

    this.currentFormSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionStarted().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.recordingFormInput = true;
        this.creatorContentClass = "is-recording";

      }
    }));

    this.currentFormSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionEnded().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.clearFormInputSubscriptions();
        this.recordingFormInput = false;
        this.creatorContentClass = "is-not-recording";
        

      }
    }));

    this.currentFormSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionError().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.matSnackbarService.open(message.data,undefined,{
          duration: 3500
        })

        this.clearFormInputSubscriptions();
        this.isLastVoiceInputValid = false;
        this.recordingFormInput = false;
        this.creatorContentClass = "is-not-recording";
        

      }
    }));

    /*
    this.currentFormSubscriptions.push(this.speechSynthesisService.onSpeechStart().subscribe({

      next: (result) => {

        this.speaking = true;

      }
      

    })); */
  }
  
  /**
   * Clear all subscriptions for working with form inputs from the user. 
   */
     private clearFormInputSubscriptions(): void {

      this.currentFormSubscriptions?.forEach(subscription => {
        subscription.unsubscribe();
      })
    }
  
    /**
     * Clear all subscriptions for working with control inputs from the user. 
     */
    private clearCommandInputSubscriptions(): void {
  
      this.currentControlSubscriptions.forEach(subscription => {
        subscription.unsubscribe();
      })
    }
}

