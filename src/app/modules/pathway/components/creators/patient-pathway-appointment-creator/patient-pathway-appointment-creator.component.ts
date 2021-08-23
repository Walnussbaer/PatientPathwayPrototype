import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { WebSpeechRecognitionMessage } from 'src/app/shared/services/speech/WebSpeechRecognitionMessage';
import { PathwayEvent } from '../../../model/PathwayEvent';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { SpeechSynthesisService } from 'src/app/shared/services/speech/speech-synthesis.service';
import { faMicrophone, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { WebSpeechSynthesisMessage } from 'src/app/shared/services/speech/WebSpeechSynthesisMessage';
import { PathwayEventType } from '../../../model/PathwayEventType';

@Component({
  selector: 'patient-pathway-appointment-creator',
  templateUrl: './patient-pathway-appointment-creator.component.html',
  styleUrls: ['./patient-pathway-appointment-creator.component.css']
})
export class PatientPathwayAppointmentCreatorComponent implements OnInit {

  /** Indicates whether the user is allowed to start the creation process. */
  public userCanStartCreationProcess: boolean = false;

  /** The date of the appointment that shall be created. */
  public appointmentDate?: Date;

  /** The header of the appointment that shall be created.  */
  public appointmentHeader?: string;

  /** The content of the header that shall be created.  */
  public appointmentContent?: string;

  /** Indicates whether the last voice input was valid concerning the appointment creation. */
  public isLastVoiceInputValid: boolean = true;

  /** The current step in the appointment creation process. */
  public currentStepInAppointmentCreation: number = 0;

  /** The new appointment that is being created. */
  public newPathwayEvent: PathwayEvent = {};

  /** Indicates whether the program is recording voice input for the appointment. */
  public recordingFormInput: boolean = false;

  /** Indicates whether the creator is recording voice input for the next user command. */
  public listeningForControlCommmand: boolean = false;

  /** The css class for the icon that indicates whether the creator is currently waiting for a user command. */
  public controlIndicatorIconClass: string = "not-waiting-for-command";

  /** The icon definition for the icon which is indicating whether the creator is currently waiting for a user command. */
  public voiceControlIcon: IconDefinition = faMicrophone;

  /** Indicates whether the creator is currently speaking with the user. */
  public speaking: boolean = false;

  /** The css class for the content area of the creator. */
  public creatorContentClass: string = "is-not-recording";

  /** An array holding all subscriptions which belong the appointment creation process. */
  private currentFormSubscriptions: Array<Subscription> = [];

  /** An array holding all subscriptions which belong to the process of handling voice commands from the user. */
  private currentControlSubscriptions: Array<Subscription> = [];

  /** The utterance for the date of the appointment. */
  public dateQuestion: string = "Wann ist der Termin?";

  /** The utterance for the header of the appointment. */
  public headerQuestion: string ="Welchen Namen soll der Termin erhalten?";

  /** The utterance for the content of the appointment. */
  public contentQuestion: string = "Sie können nun noch eine Beschreibung dem Termin hinzufügen.";

  /** The utterance to welcome the user. */
  public welcomeUtterance: string = "Herzlich Willkommen zur sprachgeführten Anlegung eines neuen Termins.";

  constructor(
    private speechRecognitionService: SpeechRecognitionService, 
    private speechSynthesisService: SpeechSynthesisService,
    private matSnackbarService: MatSnackBar,
    public dialogRef: MatDialogRef<PatientPathwayAppointmentCreatorComponent>,
    ) {
      this.dialogRef.disableClose = true;
     }

  public ngOnInit(): void {

    // define what shall happen when the synthesizer started speaking
    this.speechSynthesisService.onSpeechStart().subscribe({
      next: (result => {
        console.log("synthesizer started speaking")
        this.speaking = true;
      })
    });

    // define what shall happen when the synthesizer stopped speaking
    this.speechSynthesisService.onSpeechEnd().subscribe({
      next: (result => {
        console.log("synthesizer stopped speaking");
        this.speaking = false;
      })
    });

    // define error handling for speech synthesizer
    this.speechSynthesisService.onErrorEvent().subscribe({
      next: (result: WebSpeechSynthesisMessage) => {

        let errorMessage = result.data;

        // clean up, because we gonna abort the whole process
        this.clearCommandInputSubscriptions();
        this.clearFormInputSubscriptions();
        
        this.displayErrorMessage(errorMessage);

        this.closeDialogWithoutResult();
      }
    });

    // start the creation of creating a new appointment
    this.startCreationProcess();
  }

  /**
   * Closes the dialog and does not pass a result to the containing parent component. 
   */
  public closeDialogWithoutResult(): void {

    this.dialogRef.close(null);

  }

  /**
   * Construct the new appointment, pass it to the parent component and close the dialog.
   */
  public closeDialogWithResult(): void {

    this.newPathwayEvent = {
      date: this.appointmentDate,
      header: this.appointmentHeader,
      content: this.appointmentContent,
      type: PathwayEventType.APPOINTMENT
    }

    this.dialogRef.close(this.newPathwayEvent);
  }

  /**
   * Starts the ping pong between speech synthesizer and user. 
   */
  public startCreationProcess(): void {

    this.currentStepInAppointmentCreation = 0;
    this.userCanStartCreationProcess = false;

    this.speechRecognitionService.initRecognition();

    // we want to start the recognition after the question was asked by the synthesizer
    let synthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
      next: () => {

        synthesizerSubscription.unsubscribe(); //clean up
        this.userCanStartCreationProcess = true;
        this.listenForNextControlInput(this.getDateInput)
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

    // we want to start the recognition after the question was asked by the synthesizer
    let synthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
      next: () => {

        synthesizerSubscription.unsubscribe(); // clean up
        this.listenForNextFormInput(this.getDateInput);
      }
    });

    this.currentFormSubscriptions!.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.clearFormInputSubscriptions();
        this.speechRecognitionService.stopRecognition();
        this.recordingFormInput = false;
        this.creatorContentClass = "is-not-recording";

        let dateValue: Date = new Date(message.data);

        // if the date is not valid, we need to reask the user
        if (dateValue.toString() == "Invalid Date") {

          let errorMessage: string = "Das ist kein echtes Datum";
          this.isLastVoiceInputValid = false;

          this.displayErrorMessage(errorMessage);

          let synthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
            next: () => {

              synthesizerSubscription.unsubscribe();
              this.getDateInput();
            }
          });

          this.speechSynthesisService.speakUtterance(errorMessage);

        // if the date IS valid, we can continue with the next creation step
        } else {

          this.appointmentDate = dateValue;
          this.isLastVoiceInputValid = true;
          this.listenForNextControlInput(this.getHeaderInput,this.startCreationProcess,this.getDateInput);
        }
      }
    })); 

    // ask for the date of the new appointment
    this.speechSynthesisService.speakUtterance(this.dateQuestion);
  }

  /**
   * Start the process for getting the header of the new appointment. 
   */
  public getHeaderInput(): void {

    this.isLastVoiceInputValid = false;
    this.currentStepInAppointmentCreation = 2;

    // we want to start the recognition after the question was asked by the synthesizer
    let synthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
      next: (result) => {
 
        synthesizerSubscription.unsubscribe(); // clean up
        this.listenForNextFormInput(this.getHeaderInput);
      }
    });

    this.currentFormSubscriptions!.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.clearFormInputSubscriptions();
        this.speechRecognitionService.stopRecognition();
        this.recordingFormInput = false;
        this.creatorContentClass = "is-not-recording";

        this.appointmentHeader = message.data as string;
        this.isLastVoiceInputValid = true;

        this.listenForNextControlInput(this.getContentInput,this.getDateInput,this.getHeaderInput);
      }
    }));

    // ask for the header of the new appointment
    this.speechSynthesisService.speakUtterance(this.headerQuestion);
  }

  /**
   * Start the process for getting the content of the new appointment. 
   */
  public getContentInput(): void {

    this.isLastVoiceInputValid = false;
    this.currentStepInAppointmentCreation = 3;

    // we want to start the recognition after the question was asked by the synthesizer
    let synthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
      next: (result) => {

        synthesizerSubscription.unsubscribe();
        this.listenForNextFormInput(this.getContentInput);
      }
    });

    this.currentFormSubscriptions!.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.clearFormInputSubscriptions();
        this.speechRecognitionService.stopRecognition();
        this.recordingFormInput = false;
        this.creatorContentClass = "is-not-recording";

        this.appointmentContent = message.data;
        this.isLastVoiceInputValid = true;

        this.listenForNextControlInput(this.closeDialogWithResult,this.getHeaderInput,this.getContentInput);
      }
    }));

    this.speechSynthesisService.speakUtterance(this.contentQuestion);
  }

  /**
   * Start the recognition and listen for next form input. 
   */
  private listenForNextFormInput(currentStep: () => void): void {

    this.speechRecognitionService.stopRecognition();

    this.setupFormInputBehaviour(currentStep);

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

        // we don't want to listen for commands anymore
        this.clearCommandInputSubscriptions();

        this.speechRecognitionService.stopRecognition();
        this.controlIndicatorIconClass = "not-waiting-for-command";
        this.listeningForControlCommmand = false;
        
        let recognitionResult: string = (result.data as string).toLowerCase();

        // cancel the creation should always be possible
        if (recognitionResult == "dialog schließen") {

          console.log("canceling appointment creation")
          this.closeDialogWithoutResult();
        }

        // in case we just started the appointment creation, we can only start the creation process
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

          console.log("finishing proccess")
          nextStep.call(this);
        }
        // if command was not on the previous options, then we gonna ask for a new command
        else {

          console.log("user used incorrect command");

          this.displayErrorMessage("'" + recognitionResult + "' ist kein valides Kommando");

          this.listenForNextControlInput(nextStep,previousStep,currentStep);
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
        
        this.listenForNextControlInput(nextStep,previousStep,currentStep);
        this.controlIndicatorIconClass = "waiting-for-command";
        this.listeningForControlCommmand = true;
      }
    }));

    this.currentControlSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionError().subscribe({
      next: (result: WebSpeechRecognitionMessage) => {
        
        this.listenForNextControlInput(nextStep,previousStep,currentStep);
        this.controlIndicatorIconClass = "waiting-for-command";
        this.listeningForControlCommmand = true;
      }
    }));
  }

  /**
   * Setup behaviour of speech recognition for handling form input from the user. 
   */
  private setupFormInputBehaviour(currentStep: () => void): void {

    this.currentFormSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionStarted().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.recordingFormInput = true;
        this.creatorContentClass = "is-recording";

      }
    }));

    this.currentFormSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionEnded().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.recordingFormInput = false;
        this.creatorContentClass = "is-not-recording";
        this.clearFormInputSubscriptions();

        if (!message.data) {
          currentStep.call(this);
        }

      }
    }));

    this.currentFormSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionError().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.clearFormInputSubscriptions();
        this.displayErrorMessage(message.data);
        this.closeDialogWithoutResult();
      }
    }));
  }
  
  /**
   * Clear all subscriptions for working with form inputs from the user. 
   */
  private clearFormInputSubscriptions(): void {

    this.currentFormSubscriptions.forEach(subscription => {
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

  /**
   * Convenience method for displaying error messages using the Angular Material Design Snackbar. 
   * 
   * @param errorMessage the error message to display
   */
  private displayErrorMessage(errorMessage: string): void {

    this.matSnackbarService.open(errorMessage,"Okay",{
      panelClass: "warning-mat-snackbar",
      duration: 4000,
    });
  }
}

