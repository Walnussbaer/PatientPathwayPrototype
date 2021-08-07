import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCoffee, faMicrophone, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { PathwayEvent } from '../../model/PathwayEvent';
import { PathwayControlHelpDialogComponent } from '../pathway-control-help-dialog/pathway-control-help-dialog.component';
import { PathwayEventCreatorComponent } from '../pathway-event-creator/pathway-event-creator.component';

@Component({
  selector: 'pathway-control',
  templateUrl: './pathway-control.component.html',
  styleUrls: ['./pathway-control.component.css']
})
export class PathwayControlComponent implements OnInit {

  @Output() pathwayEventEmitter = new EventEmitter<PathwayEvent>();

  public speechRecognitionAvailable: boolean = false;

  public pathIsListening: boolean = false;

  public voiceControlIcon: IconDefinition = faMicrophone;

  constructor(
    private matSnackbarService: MatSnackBar, 
    private speechRecognitionService: SpeechRecognitionService,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    this.speechRecognitionAvailable = this.speechRecognitionService.initRecognition();

    // check whether we can use the speech recognition
    if (!this.speechRecognitionAvailable) {

      console.warn("Speech recognition not available. Please use Google Chrome or Microsoft Edge instead.")

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
      if (transcript === "neuer termin") {

        this.speechRecognitionService.stopRecognition();

        const newPathwayEventDialog = this.dialog.open(
          PathwayEventCreatorComponent,
          {
            width: "50%",
            height: "50%",
          }
        );

      
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
      this.pathIsListening = false;

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
  this.pathIsListening = true;




}

public onDeactivateVoiceControl(): void {

  this.speechRecognitionService.stopRecognition();
  this.pathIsListening = false;

}

public openVoiceCommandHelpDialog(): void {

  const helpDialogRef = this.dialog.open(
    PathwayControlHelpDialogComponent,
    {
      width: "450px",
      height: "300px",
    }
  )

}


}
