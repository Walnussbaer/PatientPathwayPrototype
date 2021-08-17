import { Component, OnInit } from '@angular/core';
import { PathwayService } from 'src/app/shared/services/pathway/pathway.service';
import { SpeechSynthesisService } from 'src/app/shared/services/speech/speech-synthesis.service';
import { PathwayEvent } from '../../model/PathwayEvent';

@Component({
  selector: 'app-pathway-view',
  templateUrl: './pathway-view.component.html',
  styleUrls: ['./pathway-view.component.css']
})
export class PathwayViewComponent implements OnInit {

  /**
   * The events of the patient pathway that can be worked with in this view. 
   */
  public pathwayEvents: PathwayEvent[] = [];

  constructor(private pathwayService: PathwayService, private speechSynthesisService: SpeechSynthesisService) { }

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

  /**
   * Gets called when a new event got created, e.g. by the user. 
   * 
   * @param newPahtwayEvent the new pathway event that got created
   */
  public onNewPathwayEvent(newPahtwayEvent: PathwayEvent): void {

    this.pathwayEvents.push(newPahtwayEvent);

    this.sortPathwayEventsByDate();
  }

  /**
   * Gets called when the user wants to open the details of a specific event in the pahtway. 
   */
  public onUserWantsToOpenPathwayEvent(eventName: string): void {

    this.pathwayService.emitNewOpenPathwayEvent(eventName);

  }

  /**
   * Gets called when the user wants to delete a specific event, identified by name. 
   * @param eventName 
   */
  public onUserWantsToDeletePathwayEvent(eventName: string): void {

    this.pathwayEvents = this.pathwayEvents.filter((event: PathwayEvent) => {

      if (event.header?.toLocaleLowerCase() == eventName) return false;
      return true;

    } );

    this.speechSynthesisService.speakUtterance("Der Termin wurde erfolgreich gelöscht!");
    console.log(this.pathwayEvents);

  }

  /**
   * Sorts the pathway entries by date. 
   */
  private sortPathwayEventsByDate(): void {

    this.pathwayEvents = this.pathwayEvents.sort((firstPathwayEvent,secondPathwayEvent) => {

      var firstDate: Date = new Date(firstPathwayEvent.date!);
      var secondDate: Date = new Date(secondPathwayEvent.date!);

      return firstDate.getTime() - secondDate.getTime();

    });

    console.log("Pathway events sorted");
  } 
}
