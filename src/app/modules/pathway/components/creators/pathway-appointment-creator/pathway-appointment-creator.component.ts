import { Component, OnInit } from '@angular/core';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { WebSpeechRecognitionMessage } from 'src/app/shared/services/speech/WebSpeechRecognitionMessage';
import { PathwayEvent } from '../../../model/PathwayEvent';

@Component({
  selector: 'app-pathway-appointment-creator',
  templateUrl: './pathway-appointment-creator.component.html',
  styleUrls: ['./pathway-appointment-creator.component.css']
})
export class PathwayAppointmentCreatorComponent implements OnInit {

  public newPathwayEvent: PathwayEvent = {};

  private nextVoiceInput: any; 

  constructor(private speechRecognitionService: SpeechRecognitionService) { }

  ngOnInit(): void {

    this.setupSpeechRecognitionBehaviour();

    this.startVoiceGuidedEventCreation();

  }

  private startVoiceGuidedEventCreation() {

    // get the date for the new appointment


  }


  private setupSpeechRecognitionBehaviour() {

    // we subscribe to a potential result from the speech recognition service
    this.speechRecognitionService.onSpeechRecognitionResultAvailable().subscribe({
      next: (message: WebSpeechRecognitionMessage) => {

        this.nextVoiceInput = message.data;

      }
    });
  }

}
