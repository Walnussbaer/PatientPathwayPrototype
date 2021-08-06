import { Component, OnInit } from '@angular/core';
import { PathwayService } from 'src/app/shared/services/pathway/pathway.service';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { PathwayEvent } from '../../model/PathwayEvent';

@Component({
  selector: 'app-pathway-view',
  templateUrl: './pathway-view.component.html',
  styleUrls: ['./pathway-view.component.css']
})
export class PathwayViewComponent implements OnInit {

  public speechRecognitionReady: boolean = false;

  public pathwayEvents: PathwayEvent[] = [];

  constructor(private pathwayService: PathwayService, private speechRecognitionService: SpeechRecognitionService) { }

  ngOnInit(): void {

    this.speechRecognitionReady = this.speechRecognitionService.init();

    if (!this.speechRecognitionReady) {
      console.warn("Speech recognition not available. Please use Google Chrome or Microsoft Edge instead.")
    } else {
      this.setupSpeechRecognitionEventListeners();

      // TODO: wire this to the button in the control panel
      this.speechRecognitionService.startRecognition();
    }

    // call the business layer and get available events of pathway
    this.pathwayService.getPathwayEntries().subscribe({
      next: (result) =>  { 
        this.pathwayEvents = result
      },

      error: (error) => {
        console.error("Could not retrieve pathway data!");
      }
    });

  }

  private setupSpeechRecognitionEventListeners(): void {

      // when the recognition was successful
      this.speechRecognitionService.speechRecognition.addEventListener('result',(e)=>{

        // get the first alternative from the first result and transcibe it (print what was recognized)
        let transcript: string = e.results[0][0].transcript;

        transcript = transcript.toLowerCase();

        console.log(transcript);

        if (transcript === "neues element") {

          this.pathwayEvents.push({
            date: new Date(),
            content: "Test",
            header: "Test"
          })

        }

        console.log(this.pathwayEvents);
        
        console.log("Created a new date in the pathway");

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
