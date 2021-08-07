import { Component, OnInit } from '@angular/core';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { PathwayEvent } from '../../model/PathwayEvent';

@Component({
  selector: 'app-pathway-event-creator',
  templateUrl: './pathway-event-creator.component.html',
  styleUrls: ['./pathway-event-creator.component.css']
})
export class PathwayEventCreatorComponent implements OnInit {

  public newPathwayEvent: PathwayEvent = {};

  constructor(private speechRecognitionService: SpeechRecognitionService) { }

  ngOnInit(): void {

    this.speechRecognitionService.init();
    this.setupSpeechRecognitionEventListeners();

    this.initSpeechGuidedAppointmentCreation();


  }

  private initSpeechGuidedAppointmentCreation(): void {

    

  }

  private setupSpeechRecognitionEventListeners(): void {

    // when the recognition was successful
    this.speechRecognitionService.speechRecognition.addEventListener('result',(e)=>{

      // get the first alternative from the first result and transcibe it (print what was recognized)
      let transcript: string = e.results[0][0].transcript;

      transcript = transcript.toLowerCase();

      console.log(transcript);
    })

    // when the user stopped talking
    this.speechRecognitionService.speechRecognition.addEventListener("speechend",(e)=>{

      console.log("Speech has ended!");

      this.speechRecognitionService.speechRecognition.stop();

    })

    // when there was no match during speech recognition
    this.speechRecognitionService.speechRecognition.addEventListener("nomatch",(e)=> {
      console.log("We couldn't recognize what you said!");
    })

    // when an unexpected error occured
    this.speechRecognitionService.speechRecognition.addEventListener("error",(e)=> {
      console.error("An error occured during speech recognition: " + e.error);
    })

}

}
