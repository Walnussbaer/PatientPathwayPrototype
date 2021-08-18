import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
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
    private dialog: MatDialog,
    private pathwayService: PathwayService) { }

  ngOnInit(): void {

    this.speechRecognitionAvailable = this.speechRecognitionService.initRecognition();

    // check whether we can use the speech recognition
    if (!this.speechRecognitionAvailable) {

      console.warn("Speech recognition not available. Please use Google Chrome instead.");

      this.displayMessage("Die Spracherkennung wird in diesem Browser nicht unterstützt. Bitte nutzen Sie Google Chrome.")

    }

    // define what shall happen when pathway events are not available
    this.pathwayService.onPathwayEventNotAvailable().subscribe({
      next: (result: PathwayEvent) => {

        let userMessage: string = "Es gibt kein Event mit dem Namen " + result.header + " zum Datum " + result.date?.toLocaleDateString("de-DE");

        // when the speech synthesis service speaks, we don't want to listen for voice commands
        let synthesizerSubscription = this.speechSynthesisService.onSpeechStart().subscribe({
          next: (result: WebSpeechSynthesisMessage) => {
            synthesizerSubscription.unsubscribe();
            this.speechRecognitionService.stopRecognition();
          }
        });

        // we want to restart the speech recoginitoin after the synthesizer has spoken
        let speechEndSynthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
          next: (result) => {
            speechEndSynthesizerSubscription.unsubscribe();
            this.restartSpeechRecognition();
            return;
          }
        });

        // in case the synthesizer could not speak
        let speechErrorSynthesizerSubscription = this.speechSynthesisService.onErrorEvent().subscribe({
          next: (result) => {
            speechErrorSynthesizerSubscription.unsubscribe();
            this.displayMessage(result.data + userMessage);
            this.restartSpeechRecognition();
            return;
          }
        });

        this.speechSynthesisService.speakUtterance(userMessage);
        
      }
    })

    // define what shall happen when pathway events got deleted
    this.pathwayService.onPathwayEventDeleted().subscribe({
      next: (result:boolean) => {

        // when the speech synthesis service speaks, we don't want to listen for voice commands
        let synthesizerSubscription = this.speechSynthesisService.onSpeechStart().subscribe({
          next: (result: WebSpeechSynthesisMessage) => {
            synthesizerSubscription.unsubscribe();
            this.speechRecognitionService.stopRecognition();
          }
        });

        // we want to restart the speech recoginitoin after the synthesizer has spoken
        let speechEndSynthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
          next: (result) => {
            speechEndSynthesizerSubscription.unsubscribe();
            this.restartSpeechRecognition();
            return;
          }
        });

        // in case the synthesizer could not speak
        let speechErrorSynthesizerSubscription = this.speechSynthesisService.onErrorEvent().subscribe({
          next: (result) => {
            speechErrorSynthesizerSubscription.unsubscribe();
            this.displayMessage(result.data + "Das Event wurde erfolgreich gelöscht.");
            this.restartSpeechRecognition();
            return;
          }
        });

        if (result == true) {
          this.speechSynthesisService.speakUtterance("Das Event wurde erfolgreich gelöscht!");
        } else {
          this.speechSynthesisService.speakUtterance("Es gibt kein Event mit diesem Namen an diesem Datum!");
        }
      }
    });

    // subscribe for voice list (it takes some time to load the available voices from the browser/ operation system)
    this.speechSynthesisService.onVoiceListUpdated().subscribe({
      next: (result: WebSpeechSynthesisMessage) => {

        let allVoices = result.data as SpeechSynthesisVoice[];
        let germanVoices : SpeechSynthesisVoice[] = [];
        
        // we only want to choose from german voices, because the other voices make no sense for german text
        germanVoices = allVoices.filter((voice)=>{
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
      PathwayControlHelpDialogComponent,
      {
        width: "60%",
      }
    );

    helpDialogRef.afterClosed().subscribe(result => {
      
      this.restartSpeechRecognition();
      
    })

  }

  /**
   * Gets called when the user changed the selected voice in the available voices dropdown. 
   * 
   * @param event the event that carries the selected value
   */
  public onVoiceChanged(event: any) {

    let chosenVoiceURI: string = event.target.value;

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
   * Use this method to display user friendly error message to the user. 
   * 
   * @param errorMessage the error message that shall be displayed 
   */
  private displayMessage(errorMessage: string): void {

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
          let recognitionResult: string = message.data;
    
          // conert transcript to lower case, since at this point capital or small letters do not matter
          let convertedRecognitionResult: string = recognitionResult.toLowerCase();
    
          // we need to do a string check on the transcript, since grammars don't work yet in the Google implementation of the Web Speech API
          switch (convertedRecognitionResult) {
    
            case convertedRecognitionResult.match(/\w*(neuer)\s(termin)\w*/)?.input: {
    
              this.openAndHandlePathwayAppointmentCreatorDialog();
    
              break;
    
            }

            case convertedRecognitionResult.match(/\w*(neues)\s(symptom)\s\w+/)?.input: {

              // find out where the symptom string starts in the recognition result
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

              // get the 'am' keyword position
              let firstWhitespaceStringPosition = convertedRecognitionResult.indexOf(" ");
              let keywordStringPosition = convertedRecognitionResult.lastIndexOf("am");

              // calculate the position where the event should be in the transcipt
              let eventNameStringStartPosition = firstWhitespaceStringPosition + 1;
              let eventNameLength = keywordStringPosition - 1 - firstWhitespaceStringPosition;

              // get the name of the event from the transcript
              let eventName: string = convertedRecognitionResult.substr(firstWhitespaceStringPosition, eventNameLength).trim();

              // get the date that was mentioned
              let dateStringPosition = keywordStringPosition + "am".length + 1;
              let eventDate: Date = new Date(convertedRecognitionResult.substring(dateStringPosition));

              console.log("user wants to delete event " + eventName);

              if (eventName) {
                this.userWantsDoDeleteEvent.emit({
                  header: eventName,
                  date: eventDate
                });
              }          
              break;
            }

            case convertedRecognitionResult.match(/(zeige)\s([\w-\säöü]*)\s(am)\s(\w*)/)?.input: {

              // get the 'am' keyword position
              let firstWhitespaceStringPosition = convertedRecognitionResult.indexOf(" ");
              let keywordStringPosition = convertedRecognitionResult.lastIndexOf("am");

              // calculate the position where the event should be in the transcipt
              let eventNameStringStartPosition = firstWhitespaceStringPosition + 1;
              let eventNameLength = keywordStringPosition - 1 - firstWhitespaceStringPosition;

              // get the name of the event from the transcript
              let eventName: string = convertedRecognitionResult.substr(firstWhitespaceStringPosition, eventNameLength).trim();

              // get the date that was mentioned
              let dateStringPosition = keywordStringPosition + "am".length + 1;
              let eventDate: Date = new Date(convertedRecognitionResult.substring(dateStringPosition));

              if (eventName) {
                this.userWantsToOpenEvent.emit({
                  header: eventName,
                  date: eventDate
                });
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
          //height: "30%",
        }
      );
  
      // define what shall happen after the pathway event creator component dialog is closed
      pathwayAppointmentCreatorDialog.afterClosed().subscribe((result: PathwayEvent | WebSpeechSynthesisMessage) => {

        // it might happen that the user canceled the creation process before any data or error message is available
        if (result!){
      
          let synthesizerSubscription = this.speechSynthesisService.onSpeechEnd().subscribe({
            next: (result) => {
              synthesizerSubscription.unsubscribe();
              this.restartSpeechRecognition();
              return;
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
      this.pathIsListening = false;
      this.unsubscribeFromAllSubscriptions();

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
          return;
        }
      });

      // define what shall happen when an error occured at the synthesizer
      let onSpeechErrorSynthesizerSubscription = this.speechSynthesisService.onErrorEvent().subscribe({
        next: (result) => {
          onSpeechErrorSynthesizerSubscription.unsubscribe();
          this.displayMessage(result.data + "Das Symptom wurde ihrem Pfad hinzugefügt.");
          this.restartSpeechRecognition();
          return;
        }
      });

      // inform the user about what just happended
      this.speechSynthesisService.speakUtterance("Das Symptom wurde in ihren Pfad hinzugefügt.");
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

    /**
     * A type checker for checking whether a givne object is of type {@link PathwayEvent}.
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

}
