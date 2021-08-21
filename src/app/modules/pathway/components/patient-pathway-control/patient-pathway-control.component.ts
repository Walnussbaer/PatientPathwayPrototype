import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faMicrophone, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { PathwayService } from 'src/app/shared/services/pathway/pathway.service';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { SpeechSynthesisService } from 'src/app/shared/services/speech/speech-synthesis.service';
import { WebSpeechRecognitionMessage } from 'src/app/shared/services/speech/WebSpeechRecognitionMessage';
import { WebSpeechSynthesisMessage } from 'src/app/shared/services/speech/WebSpeechSynthesisMessage';
import { PathwayEvent } from '../../model/PathwayEvent';
import { PathwayEventType } from '../../model/PathwayEventType';
import { PathwayAppointmentCreatorComponent } from '../creators/pathway-appointment-creator/pathway-appointment-creator.component';
import { PatientPathwayControlHelpDialogComponent } from '../patient-pathway-control-help-dialog/patient-pathway-control-help-dialog.component';

/**
 * A component for taking in user inputs/ user actions and handling them accordingly. 
 */
@Component({
  selector: 'patient-pathway-control',
  templateUrl: './patient-pathway-control.component.html',
  styleUrls: ['./patient-pathway-control.component.css'],
})
export class PatientPathwayControlComponent implements OnInit {

  /**
   * This event emitter emits an event when a new pathway event got created by the user. 
   */
  @Output() newPathwayEventCreated = new EventEmitter<PathwayEvent>();

  /**
   * This event emitter emits an event when the user wants to open a specific event in his/her pathway. 
   */
  @Output() userWantsToOpenEvent = new EventEmitter<PathwayEvent>();

  /**
   * This event emitter emits an event when the user wants do delete a specific event in his/her pathway. 
   */
  @Output() userWantsDoDeleteEvent = new EventEmitter<PathwayEvent>();

  /**
   * The voices the user can choose from for the speech synthesizer. Take some time to load. 
   */
  public availableVoices: SpeechSynthesisVoice[] = [];

  /**
   * Indicates whether the speech recognition is availabe for usage. 
   */
  public speechRecognitionAvailable: boolean = false;

  /**
   * Indicates whether the component is currently listening for user input via microphone. 
   */
  public isListening: boolean = false;

  /**
   * The definition of the microphone activation button icon. 
   */
  public voiceControlIcon: IconDefinition = faMicrophone;

  /**
   * The currently active subscriptions for the speech recognition. 
   */
  private currentSpeechRecognitionSubscriptions: Array<Subscription> = [];

  constructor(
    private matSnackbarService: MatSnackBar, 
    private speechRecognitionService: SpeechRecognitionService,
    private speechSynthesisService: SpeechSynthesisService,
    private dialog: MatDialog,
    private pathwayService: PathwayService) { }

  ngOnInit(): void {

    this.speechRecognitionAvailable = this.speechRecognitionService.initRecognition();

    // check whether we can use the speech recognition
    if (!this.speechRecognitionAvailable) {

      console.warn("Speech recognition not available. Please use Google Chrome instead.");

      this.displayMessage("Die Spracherkennung wird in diesem Browser nicht unterstützt. Bitte nutzen Sie Google Chrome.")

    }

    // define what shall happen when pathway events the user wants to show or delete are not available in the timeline/ patient pathway
    this.pathwayService.onPathwayEventNotAvailable().subscribe({
      next: (result: PathwayEvent) => {

        let userMessage: string = "Es gibt kein Event mit dem Namen " + result.header + " zum Datum " + result.date?.toLocaleDateString("de-DE");

        // when the speech synthesis service speaks, we don't want to listen for voice commands
        let speechStartSynthesizerSubscription = this.speechSynthesisService.onSpeechStart().subscribe({
          next: (result: WebSpeechSynthesisMessage) => {

            speechStartSynthesizerSubscription.unsubscribe();
            this.speechRecognitionService.stopRecognition();
          }
        });

        // we want to restart the speech recognition after the synthesizer has spoken
        let speechEndSynthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
          next: (result) => {

            speechEndSynthesizerSubscription.unsubscribe();
            this.restartSpeechRecognition();
          }
        });

        // in case the synthesizer could not speak
        let speechErrorSynthesizerSubscription = this.speechSynthesisService.onErrorEvent().subscribe({
          next: (result) => {

            let errorMessage = result.data;

            speechErrorSynthesizerSubscription.unsubscribe();
            this.displayMessage(errorMessage + userMessage);
            this.restartSpeechRecognition();
          }
        });

        this.speechSynthesisService.speakUtterance(userMessage);
        
      }
    })

    // define what shall happen when pathway events got deleted
    this.pathwayService.onPathwayEventDeleted().subscribe({
      next: (eventDeleted:boolean) => {

        let userMessage = "";

        if (eventDeleted) {
          userMessage = "Das Event wurde erfolgreich gelöscht!"
        } else {
          userMessage = "Es gibt kein Event mit diesem Namen an diesem Datum!"
        }

        // when the speech synthesis service speaks, we don't want to listen for voice commands
        let speechStartSynthesizerSubscription = this.speechSynthesisService.onSpeechStart().subscribe({
          next: (result: WebSpeechSynthesisMessage) => {

            speechStartSynthesizerSubscription.unsubscribe();
            this.speechRecognitionService.stopRecognition();
          }
        });

        // we want to restart the speech recognition after the synthesizer has spoken
        let speechEndSynthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
          next: (result) => {

            speechEndSynthesizerSubscription.unsubscribe();
            this.restartSpeechRecognition();
          }
        });

        // in case the synthesizer could not speak
        let speechErrorSynthesizerSubscription = this.speechSynthesisService.onErrorEvent().subscribe({
          next: (result) => {

            speechErrorSynthesizerSubscription.unsubscribe();

            let errorMessage = result.data;
            this.displayMessage(errorMessage + userMessage);
            this.restartSpeechRecognition();
          }
        });

        this.speechSynthesisService.speakUtterance(userMessage);
      }
    });

    // subscribe for voice list (it takes some time to load the available voices from the browser/ operating system)
    this.speechSynthesisService.onVoiceListUpdated().subscribe({
      next: (result: WebSpeechSynthesisMessage) => {

        let allVoices = result.data as SpeechSynthesisVoice[];

        // we only want to choose from german voices, because the other voices make no sense for german utterances
        let germanVoices: SpeechSynthesisVoice[] =  allVoices.filter((voice)=>{
          return voice.lang == "de-DE";
        });

        this.availableVoices = germanVoices;
      }
    })
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
      PatientPathwayControlHelpDialogComponent,
      {
        width: "60%",
      }
    );

    // when the user closed the help dialog, we want to restart the speech recognition
    helpDialogRef.afterClosed().subscribe(result => {
      
      this.restartSpeechRecognition();
    })
  }

  /**
   * Gets called when the user changed the selected voice in the available voices dropdown. 
   * 
   * @param event the event that carries the selected value from the select element
   */
  public onVoiceChanged(event: any): void {

    let chosenVoiceURI: string = event.target.value;

    // find the chosen voice in all the available voices
    let chosenVoice: SpeechSynthesisVoice | undefined = this.availableVoices.find((voice:SpeechSynthesisVoice) => {

      if (voice.voiceURI === chosenVoiceURI){
        return true;
      }
      return false;
    });

    if (chosenVoice){
      this.speechSynthesisService.setVoice(chosenVoice);
    }
  }

  /**
   * Use this method to display a message to the user. 
   * 
   * @param messageToDisplay the message that shall be displayed 
   */
  private displayMessage(messageToDisplay: string): void {

    this.matSnackbarService.open(
      messageToDisplay,
      "Verstanden", 
      {
        panelClass: ["warning-mat-snackbar"],
        duration: 8000, // in miliseconds,
        horizontalPosition: "center",
        verticalPosition: "bottom"
      });
  }

  /**
   * Set up the actions that should take place when the speech recognition is used. 
   *
   */
  private setupSpeechRecognitionBehaviour(): void {

      // we subscribe to a potential result from the speech recognition service
      this.currentSpeechRecognitionSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {

          this.speechRecognitionService.stopRecognition();
    
          // get the recognition result ("the command that was said")
          let recognitionResult: string = message.data;
    
          // convert transcript to lower case, since for commands, capital or small letters do not matter
          let convertedRecognitionResult: string = recognitionResult.toLowerCase();
    
          // we need to do a string check on the transcript, since grammars don't work yet in the Google implementation of the Web Speech API
          switch (convertedRecognitionResult) {
    
            case convertedRecognitionResult.match(/\w*(neuer)\s(termin)\w*/)?.input: {
    
              this.openAndHandlePathwayAppointmentCreatorDialog();
    
              break;
    
            }

            case convertedRecognitionResult.match(/\w*(neues)\s(symptom)\s\w+/)?.input: {

              // find out where the symptom keyword string starts in the recognition result
              // we use the converted recognition result, in case the recognizer did not corretly use small/ capital letters
              let keywordStringPosition = convertedRecognitionResult.indexOf("symptom");

              // the symptom should be after the keyword 'symptom' and another whitespace
              let symptomStringPosition = keywordStringPosition + "symptom".length + 1;
              
              // look for the symptom in the string (should be after the word 'symptom' and another whitespace)
              let symptom = recognitionResult.substring(symptomStringPosition);
    
              this.addNewSymptom(symptom);
    
              break;
    
            }

            case convertedRecognitionResult.match(/\w*(auf)\s(ein)\s(wiederhören)\w*/)?.input: {
    
              this.displayMessage("Man hört sich.");
              this.speechRecognitionService.stopRecognition();
    
              break;
    
            }

            case convertedRecognitionResult.match(/\w*(hilfe)\w*/)?.input: {

              this.openHelpDialog();

              break;
            }

            case convertedRecognitionResult.match(/(lösche)\s([\w-\säöü]*)\s(am)\s(\w*)/)?.input: {

              let eventToDelete: PathwayEvent | null = this.getDesiredPathewayEventFromRecognitionTranscript(convertedRecognitionResult);

              if (eventToDelete) {

                console.log("user wants to delete event " + eventToDelete.header + " on date " + eventToDelete.date);

                this.userWantsDoDeleteEvent.emit(eventToDelete);
              }          
              break;
            }

            case convertedRecognitionResult.match(/(zeige)\s([\w-\säöü]*)\s(am)\s(\w*)/)?.input: {

              let eventToExpand: PathwayEvent | null = this.getDesiredPathewayEventFromRecognitionTranscript(convertedRecognitionResult);

              if (eventToExpand) {
                this.userWantsToOpenEvent.emit(eventToExpand);
              }

              this.restartSpeechRecognition();
              
              break;
            }
    
            default: {

              this.displayMessage("Dieses Sprachkommando wird nicht unterstützt.");

              this.restartSpeechRecognition();

              break;
            }
          }
        }
      }));

      // define what shall happen when the speech recognition started
      this.currentSpeechRecognitionSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionStarted().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {

          this.isListening = true;
        }
      }));

      // define what shall happen when the speech recognition ended (e.g. if the user did not say anything)
      this.currentSpeechRecognitionSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionEnded().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {

         this.isListening = false;
        }
      }));

      // define what shall happen when an error occured during the speech recognition.
      this.currentSpeechRecognitionSubscriptions.push(this.speechRecognitionService.onSpeechRecognitionError().subscribe({
        next: (message: WebSpeechRecognitionMessage) => {

          let errorMessage = message.data;
          
          console.warn(errorMessage);

          // when an error occured, we just restart the recoginition for now
          // TODO in a future implementation, the error handling at this point should be more precise, e.g., if the error indicates that the user has no microphone enabled, then we shouldn't just restart the recognition
          this.restartSpeechRecognition();
        }
      }));
  }

  /**
   * Clean up all currently active speech recognition subscriptions. 
   */
  private unsubscribeFromAllSpeechRecognitionSubscriptions(): void {

    this.currentSpeechRecognitionSubscriptions.forEach(subscription => {

      subscription.unsubscribe();

    })

    this.currentSpeechRecognitionSubscriptions = [];

  }

  /**
   * Gets called when the speech recognition recognized that the user wants to create a new pathway event. 
   */
  private openAndHandlePathwayAppointmentCreatorDialog(): void {

    this.speechRecognitionService.stopRecognition();
    this.isListening = false;
    this.unsubscribeFromAllSpeechRecognitionSubscriptions();

    const pathwayAppointmentCreatorDialog = this.dialog.open(PathwayAppointmentCreatorComponent);

    // define what shall happen after the pathway event creator component dialog is closed
    pathwayAppointmentCreatorDialog.afterClosed().subscribe((result: PathwayEvent | WebSpeechSynthesisMessage) => {

      // it might happen that the user canceled the creation process before any data or error message is available
      if (result!){
    
        let synthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
          next: (result) => {
            synthesizerSubscription.unsubscribe();
            this.restartSpeechRecognition();
          }
        });

        if (this.isPathwayEvent(result)) {

          this.newPathwayEventCreated.emit(result as PathwayEvent);
          this.speechSynthesisService.speakUtterance("Sie haben erfolgreich einen neuen Termin angelegt.");    

        } else {

          result = <WebSpeechSynthesisMessage> result;
          let errorMessage = result.data;

          // otherwise we got an error message 
          this.displayMessage(errorMessage);
          this.speechSynthesisService.speakUtterance(errorMessage);
        }
      } else {
      // restart to listen for voice commands
      this.restartSpeechRecognition();
      }
    });
  }

  /**
   * Gets called when the user wants to add a new symptom to his pathway. 
   * 
   * @param symptom the symptom that is new
   */
  private addNewSymptom(symptom: string): void {

    this.speechRecognitionService.stopRecognition();
    this.isListening = false;
    this.unsubscribeFromAllSpeechRecognitionSubscriptions();

    let userMessage = "Das Symptom wurde Ihrem Pfad hinzugefügt."

    console.log("user wants to add a new symptom: " + symptom);

    let event: PathwayEvent = {
      content: [symptom],
      header: "Symptome",
      date: new Date(),
      type: PathwayEventType.SYMPTOM_BUNDLE
    };

    this.newPathwayEventCreated.emit(event);

    // define what shall happen when the system has spoken to the user
    let onSpeechEndSynthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
      next: (result) => {

        onSpeechEndSynthesizerSubscription.unsubscribe();
        this.restartSpeechRecognition();
      }
    });

    // define what shall happen when an error occured at the synthesizer
    let onSpeechErrorSynthesizerSubscription = this.speechSynthesisService.onErrorEvent().subscribe({
      next: (result) => {

        onSpeechErrorSynthesizerSubscription.unsubscribe();
        this.displayMessage(result.data + userMessage);
        this.restartSpeechRecognition();
      }
    });

    // inform the user about what just happended
    this.speechSynthesisService.speakUtterance(userMessage);
  }

  /**
   * Reinitializes the speech recognition service, the component behaviour and starts the recognition.
   */
  private restartSpeechRecognition() {

    console.log("Restarting speech recognition");
    this.unsubscribeFromAllSpeechRecognitionSubscriptions();
    this.speechRecognitionService.stopRecognition();

    this.speechRecognitionService.initRecognition();
    this.setupSpeechRecognitionBehaviour();
    this.speechRecognitionService.startRecognition();

  }

  /**
   * A type checker for checking whether a given object is of type {@link PathwayEvent}.
   * 
   * @param objectToCheck that object that might be a {@link PathwayEvent}
   * 
   * @returns true if the type check succeeds, else false
   */
  private isPathwayEvent(objectToCheck:any): boolean {

    if (objectToCheck?.date && objectToCheck?.header && objectToCheck?.content) {
      return true;
    }
    return false;

  }

  /**
   * Takes in a transcript and checks it for the header and the date of a possibly existing {@link PathwayEvent}.
   * 
   * @param recognitionTranscript the transcript from the speech recognition to analyze
   */
  private getDesiredPathewayEventFromRecognitionTranscript(recognitionTranscript: string): PathwayEvent | null {

    // get the first whitespace, which indicates where the event name starts
    let firstWhitespaceStringPosition = recognitionTranscript.indexOf(" ");

    // get the 'am' keyword position in the transcript string
    let keywordStringPosition = recognitionTranscript.lastIndexOf("am");

    // calculate the position where the event name should be in the transcipt
    let eventNameStringStartPosition = firstWhitespaceStringPosition + 1;
    let eventNameLength = keywordStringPosition - 1 - firstWhitespaceStringPosition;

    // get the name of the event from the transcript
    let eventName: string = recognitionTranscript.substr(eventNameStringStartPosition, eventNameLength).trim();

    // get the date that was mentioned
    let dateStringPosition = keywordStringPosition + "am".length + 1;
    let eventDate: Date = new Date(recognitionTranscript.substring(dateStringPosition));

    if (eventName && eventDate) {
      return {
        header: eventName,
        date: eventDate
      }
    } else {
      return null;
    }
  }

}
