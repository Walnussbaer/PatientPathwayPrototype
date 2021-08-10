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

  public pathwayEvents: PathwayEvent[] = [];

  constructor(private pathwayService: PathwayService) { }

  ngOnInit(): void {

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

  public onNewPathwayEvent(newPahtwayEvent: PathwayEvent): void {

    this.pathwayEvents.push(newPahtwayEvent);

    this.sortPathwayEvents();

  }

  private sortPathwayEvents(): void {

    this.pathwayEvents = this.pathwayEvents.sort((firstPathwayEvent,secondPathwayEvent) => {

      var firstDate: Date = new Date(firstPathwayEvent.date!);
      var secondDate: Date = new Date(secondPathwayEvent.date!);

      return firstDate.getTime() - secondDate.getTime();

    });

    console.log("Events sorted");

    console.log(this.pathwayEvents);

  }
}
