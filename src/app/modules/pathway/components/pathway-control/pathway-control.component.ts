import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCoffee, faMicrophone, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { PathwayEvent } from '../../model/PathwayEvent';

@Component({
  selector: 'pathway-control',
  templateUrl: './pathway-control.component.html',
  styleUrls: ['./pathway-control.component.css']
})
export class PathwayControlComponent implements OnInit {

  public speechRecognitionAvailable: boolean = false;

  @Output() pathwayEventEmitter = new EventEmitter<PathwayEvent>();

  voiceControlIcon: IconDefinition = faMicrophone;

  constructor(private matSnackbarService: MatSnackBar, private speechRecognitionService: SpeechRecognitionService) { }

  ngOnInit(): void {

    this.speechRecognitionAvailable = this.speechRecognitionService.init();

    if (!this.speechRecognitionAvailable) {
      console.warn("Speech recognition not available. Please use Google Chrome or Microsoft Edge instead.")
    } else {
      this.setupSpeechRecognitionEventListeners();
    }

    if (!this.speechRecognitionAvailable) {

      this.matSnackbarService.open(
        "Die Spracherkennung wird in diesem Browser nicht unterstützt. Bitte nutzen Sie Google Chrome oder Microsoft Edge.",
        "Verstanden", 
        {
          panelClass: ["warning-mat-snackbar"]
        });

    }

  }

  private setupSpeechRecognitionEventListeners(): void {

    // when the recognition was successful
    this.speechRecognitionService.speechRecognition.addEventListener('result',(e)=>{

      // get the first alternative from the first result and transcibe it (print what was recognized)
      let transcript: string = e.results[0][0].transcript;

      transcript = transcript.toLowerCase();

      console.log(transcript);

      // since grammars don't work yet, we need to to a string check on the said words
      if (transcript === "neues element") {

        // create a new pathway event
        let newPathwayEvent : PathwayEvent = {
          content: "Ich bin ein durch Sprache erstellter Termin",
          header: "Neuer Speech Recognition Termin",
          date: new Date()
        };

        this.pathwayEventEmitter.emit(newPathwayEvent);
        console.log("Created a new date in the pathway");

      }
      
      

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

public onActivateVoiceControl(): void {

  this.speechRecognitionService.startRecognition();

}

}
