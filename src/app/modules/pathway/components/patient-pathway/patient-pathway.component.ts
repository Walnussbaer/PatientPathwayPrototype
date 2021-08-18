import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnChanges, OnInit } from '@angular/core';
import { MglTimelineEntryComponent } from 'angular-mgl-timeline/src/timeline/timeline-entry/timeline-entry.component';
import { PathwayService } from 'src/app/shared/services/pathway/pathway.service';
import { SpeechSynthesisService } from 'src/app/shared/services/speech/speech-synthesis.service';
import { PathwayEvent } from '../../model/PathwayEvent';

/**
 * A component that displays {@link PathwayEvent}s in a vertical timeline. 
 * 
 * @input pathwayEvents an array of {@link PathwayEvent}s that shall be displayed in the timeline
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
   * Set to true if you want the pathway to have it's entries alternat the side. 
   */
  public pathwayEntryAlternation: boolean = false;

  /**
   * Seriously, I don't know what this option does. The provided stackblitz of the author does not explain it, nor does the provided documentation. 
   */
  public pathwaySide: string = "left";

  constructor(private pathwayService: PathwayService, private speechSynthesisService: SpeechSynthesisService) { }

  ngOnInit(): void {

    // subscribe to pathway open events using shared service 
    this.pathwayService.onNewPathwayEventOpeningClaim().subscribe({
      next: (event:PathwayEvent) => {
        console.log("pathway component is ordered to open event with name " + event.header + " on date " + event.date?.toLocaleDateString('de-DE'));
        this.openPathwayEventUiContainer(event);
      }
    });
  }

  public ngOnChanges() {

    console.log("Patient pathway changed");

  }

  /**
   * Opens an mgl-timeline-entry in the pathway to show its details using the name of the event as the identifier. 
   * 
   * @param pathwayEvent the element to open
   */
  private openPathwayEventUiContainer(pathwayEvent: PathwayEvent) {

    let elementId:string = pathwayEvent.header + "_" + pathwayEvent.date?.toLocaleDateString("de-DE");
    console.log(elementId);

    if (this.isAlreadyOpen(pathwayEvent)) {
      console.log("event is already expanded");
      return;
    };

    let containerToOpen: HTMLElement | null = document.getElementById(elementId);

    if (containerToOpen) {
      containerToOpen.click();
      this.pathwayService.emitNewPathwayEventOpenEvent(pathwayEvent);
    } else {

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
  private isAlreadyOpen(pathwayEvent: PathwayEvent): boolean {

    let containerId = pathwayEvent.header + "_" + pathwayEvent.date?.toLocaleDateString("de-DE") + "_container";

    let uiContainer: HTMLElement | null = document.getElementById(containerId);

    if (uiContainer) {

      if (uiContainer.className == "expanded") return true;
    }

    return false;
  }
}
