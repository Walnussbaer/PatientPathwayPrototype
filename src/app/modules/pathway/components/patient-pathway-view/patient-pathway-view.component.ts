import { Component, OnInit } from '@angular/core';
import { PathwayService } from 'src/app/shared/services/pathway/pathway.service';
import { PathwayEvent } from '../../model/PathwayEvent';
import { PathwayEventType } from '../../model/PathwayEventType';

/**
 * A view that can be routed to. Handles all pathway related actions and passes data/ gets data from the pathway itself. 
 */
@Component({
  selector: 'patient-pathway-view',
  templateUrl: './patient-pathway-view.component.html',
  styleUrls: ['./patient-pathway-view.component.css']
})
export class PatientPathwayViewComponent implements OnInit {

  /**
   * The events of the patient pathway that can be worked with in this view. 
   */
  public pathwayEvents: PathwayEvent[] = [];

  constructor(private pathwayService: PathwayService) { }

  ngOnInit(): void {

    // call the business layer and get available events of pathway
    this.pathwayService.getPathwayEntries().subscribe({
      next: (result) =>  { 

        this.pathwayEvents = result;
      },

      error: (error) => {
        console.error("Could not retrieve pathway data!");
      }
    });
  }

  /**
   * Gets called when a new event got created, e.g. by the user using the appointment creator. 
   * 
   * @param newPahtwayEvent the new pathway event that got created
   */
  public onNewPathwayEvent(newPahtwayEvent: PathwayEvent): void {

    switch (newPahtwayEvent.type) {

      case PathwayEventType.APPOINTMENT: {

        this.pathwayEvents.push(newPahtwayEvent);
        break;

      }
      
      case PathwayEventType.SYMPTOM_BUNDLE: {

        // check whether we already have some symptoms for the current date 
        let existingSymptomBundleForDate: PathwayEvent | undefined = this.pathwayEvents.find((event: PathwayEvent)=>{

          //time does not matter
          if (
            event.date!.getDay() == newPahtwayEvent.date!.getDay() 
            &&event.date!.getFullYear() == newPahtwayEvent.date!.getFullYear()
            && event.date!.getMonth() == newPahtwayEvent.date!.getMonth()) {
              return true;
          }
          return false;
        });

        // if we already have symptoms for the current date, expand the current symptom bundle, else we just created a new one
        if (existingSymptomBundleForDate) {

          console.log("extending existing symptom bundle");
          existingSymptomBundleForDate.content.push(newPahtwayEvent.content[0]);

        } else {

          console.log("created new symptom bundle for current date");
          this.pathwayEvents.push(newPahtwayEvent);
        }
      }
      break;
    }
    this.sortPathwayEventsByDate();
  }

  /**
   * Gets called when the user wants to open the details of a specific event in the pahtway. 
   */
  public onUserWantsToOpenPathwayEvent(event: PathwayEvent): void {

    this.pathwayService.emitNewPathwayEventExpandRequestEvent(event);

  }

  /**
   * Gets called when the user wants to delete a specific event, identified by name and date. 
   * 
   * @param event the the event that shall be deleted
   */
  public onUserWantsToDeletePathwayEvent(pathwayEvent: PathwayEvent): void {

    // find the event that shall be deleted using header and date
    let eventToDelete: PathwayEvent | undefined = this.pathwayEvents.find((event: PathwayEvent) => {

      if (
        event.header!.toLocaleLowerCase() == pathwayEvent.header!.toLocaleLowerCase() && 
        event.date!.getDay() == pathwayEvent.date!.getDay() &&
        event.date!.getFullYear() == pathwayEvent.date!.getFullYear() &&
        event.date!.getMonth() == pathwayEvent.date!.getMonth()) {
          return true
      }
      return false;
    });

    // if the event is existing, we delete ist
    if (eventToDelete) {

      // filter out the event that we want to delete
      this.pathwayEvents = this.pathwayEvents.filter((event: PathwayEvent) => {

        if (
          event.header!.toLocaleLowerCase() == eventToDelete!.header!.toLocaleLowerCase() && 
          event.date!.getDay() == eventToDelete!.date!.getDay() &&
          event.date!.getFullYear() == eventToDelete!.date!.getFullYear() &&
          event.date!.getMonth() == eventToDelete!.date!.getMonth()) {
            return false
        }
        return true;
      });

      // tell the shared service what just happended
      this.pathwayService.emitNewPathwayEventDeletedEvent(true);
    } else {
      this.pathwayService.emitNewPathwayEventDeletedEvent(false);
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
