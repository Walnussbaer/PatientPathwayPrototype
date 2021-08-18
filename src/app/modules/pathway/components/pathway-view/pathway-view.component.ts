import { Component, OnInit } from '@angular/core';
import { PathwayService } from 'src/app/shared/services/pathway/pathway.service';
import { SpeechSynthesisService } from 'src/app/shared/services/speech/speech-synthesis.service';
import { PathwayEvent } from '../../model/PathwayEvent';
import { PathwayEventType } from '../../model/PathwayEventType';

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
        this.pathwayEvents = result;

        this.pathwayEvents.forEach((event:PathwayEvent) => {
          // convert date field to real JS date
          event.date = new Date(event.date!);
        })

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

    switch (newPahtwayEvent.type) {

      case PathwayEventType.APPOINTMENT: {

        this.pathwayEvents.push(newPahtwayEvent);
        this.sortPathwayEventsByDate();
        break;

      }
      
      case PathwayEventType.SYMPTOM_BUNDLE: {

        // check whether we already have some symptoms for the current date 
        let existingSymptomBundleForDate: PathwayEvent | undefined = this.pathwayEvents.find((event: PathwayEvent)=>{

          let dateOfEventToCompare: Date = new Date(event.date!);
          let dateOfNewPathwayEvent: Date = new Date(newPahtwayEvent.date!);

          //(time does not matter)
          if (
            dateOfEventToCompare.getDay() == dateOfNewPathwayEvent.getDay() 
            &&dateOfEventToCompare.getFullYear() == dateOfNewPathwayEvent.getFullYear()
            && dateOfEventToCompare.getMonth() == dateOfNewPathwayEvent.getMonth()) {
              return true
          }
          return false;
        });

        if (existingSymptomBundleForDate) {

          console.log("extend existing symptom bundle");
          existingSymptomBundleForDate.content.push(newPahtwayEvent.content[0]);
          this.sortPathwayEventsByDate();

        } else {

          console.log("create new symptom bundle");
          this.pathwayEvents.push(newPahtwayEvent);
          this.sortPathwayEventsByDate();
        }
      }
      break;
    }
  }

  /**
   * Gets called when the user wants to open the details of a specific event in the pahtway. 
   */
  public onUserWantsToOpenPathwayEvent(event: PathwayEvent): void {

    this.pathwayService.emitNewOpenPathwayEvent(event);

  }

  /**
   * Gets called when the user wants to delete a specific event, identified by name and date. 
   * 
   * @param event the the event that shall be deleted
   */
  public onUserWantsToDeletePathwayEvent(pathwayEvent: PathwayEvent): void {

    let eventToDelete: PathwayEvent | undefined = this.pathwayEvents.find((event: PathwayEvent) => {

      if (
        event.header!.toLocaleLowerCase() == pathwayEvent.header!.toLocaleLowerCase() && 
        event.date!.getDay() == pathwayEvent.date!.getDay() 
        &&event.date!.getFullYear() == pathwayEvent.date!.getFullYear()
        && event.date!.getMonth() == pathwayEvent.date!.getMonth()) {
          return true
      }
      return false;
    });

    if (eventToDelete) {

      this.pathwayEvents = this.pathwayEvents.filter((event: PathwayEvent) => {

        if (
          event.header!.toLocaleLowerCase() == eventToDelete!.header!.toLocaleLowerCase() && 
          event.date!.getDay() == eventToDelete!.date!.getDay() 
          &&event.date!.getFullYear() == eventToDelete!.date!.getFullYear()
          && event.date!.getMonth() == eventToDelete!.date!.getMonth()) {
            return false
        }
        return true;
      });

      this.pathwayService.answerPathwayDeleteRequest(true);
    } else {
      this.pathwayService.answerPathwayDeleteRequest(false);
    }
  }

  /**
   * Sorts the pathway entries by date. 
   */
  private sortPathwayEventsByDate(): void {

    this.pathwayEvents = this.pathwayEvents.sort((firstPathwayEvent,secondPathwayEvent) => {

      let firstDate: Date = new Date(firstPathwayEvent.date!);
      let secondDate: Date = new Date(secondPathwayEvent.date!);

      return firstDate.getTime() - secondDate.getTime();

    });

    console.log("Pathway events sorted");
  } 
}
