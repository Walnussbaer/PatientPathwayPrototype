import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { WebSpeechRecognitionMessage } from 'src/app/shared/services/speech/WebSpeechRecognitionMessage';
import { PathwayEvent } from '../../../model/PathwayEvent';

@Component({
  selector: 'app-pathway-appointment-creator',
  templateUrl: './pathway-appointment-creator.component.html',
  styleUrls: ['./pathway-appointment-creator.component.css']
})
export class PathwayAppointmentCreatorComponent implements OnInit {

  // TODO: change to date
  public appointmentDate?: any;

  public appointmentHeader?: string;

  public newPathwayEvent: PathwayEvent = {};

  private nextVoiceInput: string = "";

  constructor(private speechRecognitionService: SpeechRecognitionService) { }

  ngOnInit(): void {

    this.setupSpeechRecognitionBehaviour();

    this.startVoiceGuidedEventCreation();

  }

  private startVoiceGuidedEventCreation() {

    // get the date for the new appointment
    this.getDateInput().subscribe({
      next: (result) => {
        this.appointmentDate = result;
      }
    });

    // get the header for the new appointment
    //this.getHeaderInput();

  }


  private setupSpeechRecognitionBehaviour() {


  }

  private getDateInput(): Observable<string> {

    let dateInput: string; 

    let dateSubscription: Subscription = this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.speechRecognitionService.stopRecognition();
        dateInput = message.data;
        dateSubscription.unsubscribe();
      }
      });

      return new Observable(subscription => {

        this.speechRecognitionService.initRecognition();
        this.speechRecognitionService.startRecognition();

        subscription.next(dateInput);
        subscription.complete();

      });
    }
}

