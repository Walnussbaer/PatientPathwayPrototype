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

@Component({
  selector: 'app-pathway-appointment-creator',
  templateUrl: './pathway-appointment-creator.component.html',
  styleUrls: ['./pathway-appointment-creator.component.css']
})
export class PathwayAppointmentCreatorComponent implements OnInit {

  public userCanStartCreationProcess: boolean = false;

  public appointmentDate?: Date;

  public istLastVoiceInputValid: boolean = true;

  public appointmentCaption?: string;

  public appointmentContent?: string;

  public currentStepInAppointmentCreation = 0;

  public newPathwayEvent: PathwayEvent = {};

  public recording: boolean = false;

  public speaking: boolean = false;

  public creatorContentClass: string = "is-not-recording";

  private currentSubscriptions?: Array<Subscription> = [];

  public dateQuestion: string = "Wann ist der Termin?";

  public captionQuestion: string ="Welchen Namen soll der Termin erhalten?";

  public contentQuestion: string = "Sie können nun noch eine Beschreibung dem Termin hinzufügen.";

  public welcomeUtterance: string = "Herzliche Willkommen zur sprachgeführten Anlegung eines neuen Termins.";



  constructor(
    private speechRecognitionService: SpeechRecognitionService, 
    private speechSynthesisService: SpeechSynthesisService,
    private matSnackbarService: MatSnackBar,
    public dialogRef: MatDialogRef<PathwayAppointmentCreatorComponent>
    ) { }

  ngOnInit(): void {

    this.speechRecognitionService.initRecognition();
    this.speechSynthesisService.initSynthesis();
    this.setupSpeechRecognitionBehaviour();

    this.speechSynthesisService.onSpeechEnd().subscribe({
      complete: () => {
        this.userCanStartCreationProcess = true;
      }
    })

    this.speechSynthesisService.speakUtterance(this.welcomeUtterance);

  }


  private setupSpeechRecognitionBehaviour(): void {

    this.speechRecognitionService.onSpeechRecognitionStarted().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.recording = true;
        this.creatorContentClass = "is-recording";

      }
    });

    this.speechRecognitionService.onSpeechRecognitionEnded().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.clearCurrentSubscriptions();

        this.recording = false;
        this.creatorContentClass = "is-not-recording";

      }
    });

    this.speechRecognitionService.onSpeechRecognitionError().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.matSnackbarService.open(message.data,undefined,{
          duration: 3500
        })

        this.clearCurrentSubscriptions();
        
        this.istLastVoiceInputValid = false;
        this.recording = false;
        this.creatorContentClass = "is-not-recording";

      }
    });

    this.speechSynthesisService.onSpeechStart().subscribe({

      next: (result) => {

        this.speaking = true;

      }

    })

  }

  public getDateInput(): void {

    this.istLastVoiceInputValid = false;

    this.currentStepInAppointmentCreation = 1;

    this.speechSynthesisService.onSpeechEnd().subscribe({
      next: (result) => {
        this.speaking = false;
        console.log("Utterance finished!");
        // we want to start the recognition after the question was asked by the synthesizer
        this.speechRecognitionService.startRecognition();
      }
    });

    this.currentSubscriptions!.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        let dateValue: Date;

        dateValue = new Date(message.data);

        if (dateValue.toString() == "Invalid Date") {

          this.matSnackbarService.open("Das ist kein valides Datum",undefined,{
            duration:5000
          })

          this.speechRecognitionService.stopRecognition();
          this.clearCurrentSubscriptions();
          this.istLastVoiceInputValid = false;

        } else {

          this.speechRecognitionService.stopRecognition();
          this.clearCurrentSubscriptions();

          this.appointmentDate = dateValue;
          this.istLastVoiceInputValid = true;

        }
      }
    })); 

    this.speechSynthesisService.speakUtterance(this.dateQuestion);
    
  }

  public getCaptionInput(): void {

    this.istLastVoiceInputValid = false;

    this.currentStepInAppointmentCreation = 2;

    this.speechSynthesisService.onSpeechEnd().subscribe({
      next: (result) => {
        this.speaking = false;
        console.log("Utterance finished!");
        // we want to start the recognition after the question was asked by the synthesizer
        this.speechRecognitionService.startRecognition();
      }
    });

    this.currentSubscriptions!.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({

      next: (message: WebSpeechRecognitionMessage) => {

        let captionValue: string;

        captionValue = message.data;

        this.speechRecognitionService.stopRecognition();
        this.clearCurrentSubscriptions();

        this.appointmentCaption = captionValue;
        this.istLastVoiceInputValid = true;

      }
    }));

    this.speechSynthesisService.speakUtterance(this.captionQuestion);

  }

  public getContentInput(): void {

    this.istLastVoiceInputValid = false;

    this.currentStepInAppointmentCreation = 3;

    this.speechSynthesisService.onSpeechEnd().subscribe({
      next: (result) => {
        this.speaking = false;
        console.log("Utterance finished!");
        // we want to start the recognition after the question was asked by the synthesizer
        this.speechRecognitionService.startRecognition();
      }
    });

    this.currentSubscriptions!.push(this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({

      next: (message: WebSpeechRecognitionMessage) => {

        let contentValue: string;

        contentValue = message.data;

        this.speechRecognitionService.stopRecognition();
        this.clearCurrentSubscriptions();

        this.appointmentContent = contentValue;
        this.istLastVoiceInputValid = true;

      }
    }));

    this.speechSynthesisService.speakUtterance(this.contentQuestion);
  }

  public saveAppointment(): void {

    this.newPathwayEvent = {
      date: this.appointmentDate,
      header: this.appointmentCaption,
      content: this.appointmentContent
    }

    this.dialogRef.close(this.newPathwayEvent);

  }

  private clearCurrentSubscriptions(): void {

    this.currentSubscriptions?.forEach(subscription => {

      subscription.unsubscribe();

    })

  }
  
}

