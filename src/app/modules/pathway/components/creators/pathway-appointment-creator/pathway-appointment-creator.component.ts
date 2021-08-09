import { Component, Inject, OnInit } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { WebSpeechRecognitionMessage } from 'src/app/shared/services/speech/WebSpeechRecognitionMessage';
import { PathwayEvent } from '../../../model/PathwayEvent';
import { concatMap, delay, mergeMap } from 'rxjs/operators';
import { WebSpeechRecognitionMessageType } from 'src/app/shared/services/speech/WebSpeechRecognitionMessageType';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pathway-appointment-creator',
  templateUrl: './pathway-appointment-creator.component.html',
  styleUrls: ['./pathway-appointment-creator.component.css']
})
export class PathwayAppointmentCreatorComponent implements OnInit {

  // TODO: change to date
  public appointmentDate?: Date;

  public istLastVoiceInputValid: boolean = true;

  public appointmentCaption?: string;

  public appointmentContent?: string;

  public currentStepInAppointmentCreation = 0;

  public newPathwayEvent: PathwayEvent = {};

  public recording: boolean = false;

  public creatorContentClass: string = "is-not-recording";

  constructor(
    private speechRecognitionService: SpeechRecognitionService, 
    private matSnackbarService: MatSnackBar,
    public dialogRef: MatDialogRef<PathwayAppointmentCreatorComponent>
    ) { }

  ngOnInit(): void {

    this.speechRecognitionService.initRecognition();

    this.setupSpeechRecognitionBehaviour();

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

        this.recording = false;
        this.creatorContentClass = "is-not-recording";

      }
    });

    this.speechRecognitionService.onSpeechRecognitionError().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.matSnackbarService.open(message.data,undefined,{
          duration: 3500
        })

        this.istLastVoiceInputValid = false;
        this.recording = false;
        this.creatorContentClass = "is-not-recording";

      }
    });

  }



  public getDateInput(): void {

    this.istLastVoiceInputValid = false;

    this.currentStepInAppointmentCreation = 1;

    let dateRecognitionSubscription: Subscription = this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        let dateValue: Date;

        dateValue = new Date(message.data);

        if (dateValue.toString() == "Invalid Date") {

          this.matSnackbarService.open("Das ist kein valides Datum",undefined,{
            duration:5000
          })

          this.speechRecognitionService.stopRecognition();
          dateRecognitionSubscription.unsubscribe();
          this.istLastVoiceInputValid = false;

        } else {

          this.speechRecognitionService.stopRecognition();
          dateRecognitionSubscription.unsubscribe();
          this.appointmentDate = dateValue;
          this.istLastVoiceInputValid = true;

        }
      }
    });

    this.speechRecognitionService.startRecognition();
  }

  public getCaptionInput(): void {

    this.istLastVoiceInputValid = false;

    this.currentStepInAppointmentCreation = 2;

    let captionRecognitionSubscription: Subscription = this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({

      next: (message: WebSpeechRecognitionMessage) => {

        let captionValue: string;

        captionValue = message.data;

        this.speechRecognitionService.stopRecognition();
        captionRecognitionSubscription.unsubscribe();
        this.appointmentCaption = captionValue;
        this.istLastVoiceInputValid = true;

      }
    });

    this.speechRecognitionService.startRecognition();


  }

  public getContentInput(): void {

    this.istLastVoiceInputValid = false;

    this.currentStepInAppointmentCreation = 3;

    let contentRecognitionSubscription: Subscription = this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({

      next: (message: WebSpeechRecognitionMessage) => {

        let contentValue: string;

        contentValue = message.data;

        this.speechRecognitionService.stopRecognition();
        contentRecognitionSubscription.unsubscribe();
        this.appointmentContent = contentValue;
        this.istLastVoiceInputValid = true;

      }
    });

    this.speechRecognitionService.startRecognition();

  }

  public saveAppointment(): void {

    this.newPathwayEvent = {
      date: this.appointmentDate,
      header: this.appointmentCaption,
      content: this.appointmentContent
    }

    this.dialogRef.close(this.newPathwayEvent);

  }
  
}

