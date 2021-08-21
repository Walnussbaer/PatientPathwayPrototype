import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { PathwayService } from 'src/app/shared/services/pathway/pathway.service';
import { PathwayEvent } from '../../model/PathwayEvent';

/**
 * A component that displays {@link PathwayEvent}s in a vertical timeline. 
 */
@Component({
  selector: 'patient-pathway',
  templateUrl: './patient-pathway.component.html',
  styleUrls: ['./patient-pathway.component.css']
})
export class PatientPathwayComponent implements OnInit,OnChanges {

  /**
   * The events the pathway shall display. 
   */
  @Input() pathwayEvents : PathwayEvent[] = [];

  /**
   * The size of the dots used in the pathway representation. 
   */
  public pathwayDotSize: number = 50;

  /**
   * Set to true if you want the pathway to have it's entries alternate the side. 
   */
  public pathwayEntryAlternation: boolean = false;

  /**
   * Defines whether the pathway events shall be displayed on the left or the right side of the timeline. 
   */
  public pathwaySide: string = "left";

  constructor(private pathwayService: PathwayService) { }

  ngOnInit(): void {

    // subscribe to pathway open events using shared service 
    this.pathwayService.onNewPathwayEventOpeningClaim().subscribe({
      next: (event:PathwayEvent) => {
        console.log("pathway component is ordered to open event with name " + event.header + " on date " + event.date?.toLocaleDateString('de-DE'));
        this.expandPathwayEventHeader(event);
      }
    });
  }

  public ngOnChanges() {}

  /**
   * Expands an mgl-timeline-entry in the pathway to show the content of the pathway event using the header and the date of the event as the identifier. 
   * 
   * @param pathwayEvent the event of which the UI container shall be expanded
   */
  private expandPathwayEventHeader(pathwayEvent: PathwayEvent) {

    // construct the id of the ui element that we are looking for (not the entry itself, but the header, which can be clicked to get expanded)
    let elementId:string = pathwayEvent.header + "_" + pathwayEvent.date?.toLocaleDateString("de-DE");

    // check whether the entry is already expanded
    if (this.isExpanded(pathwayEvent)) {
      console.log("event " + elementId + " is already expanded");
      return;
    };

    // get the HTML (an mgl-timeline-entry-header) element that can be expanded using a click
    let containerToOpen: HTMLElement | null = document.getElementById(elementId);

    // if element exists, open it using a simlulated mouse klick
    if (containerToOpen) {
      containerToOpen.click();
      this.pathwayService.emitNewPathwayEventOpenEvent(pathwayEvent);
    } else {

      // if the desired event has no UI representation, we want to inform other components
      this.pathwayService.emitNewPathwayEventNotAvailableEvent(pathwayEvent);
    }
  }

  /**
   * Checks whether the UI container of a pathway event is already expanded or not. 
   * 
   * @param pathwayEvent that element that shall be checked
   * 
   * @return true if the element exists and is already open, else false
   */
  private isExpanded(pathwayEvent: PathwayEvent): boolean {

    // construct the id of the ui element that we are looking for  (the mgl-timeline-entry holds the information whether it's content is expanded or not)
    let containerId = pathwayEvent.header + "_" + pathwayEvent.date?.toLocaleDateString("de-DE") + "_container";

    // get the mgl-timeline-entry
    let uiContainer: HTMLElement | null = document.getElementById(containerId);

    // check whether the mgl-timeline-entry is expanded
    if (uiContainer) {

      if (uiContainer.className == "expanded") return true;
    }

    return false;
  }
}
