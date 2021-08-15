import { Component, Input, OnChanges, OnInit } from '@angular/core';
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
  public pathwayDotSize: number = 60;

  /**
   * Set to true if you want the pathway to have it's entries alternat the side. 
   */
  public pathwayEntryAlternation: boolean = false;

  /**
   * Seriously, I don't know what this option does. The provided stackblitz of the author does not explain it, nor does the provided documentation. 
   */
  public pathwaySide: string = "left";

  constructor() { }

  ngOnInit(): void {
  }

  public ngOnChanges() {

    console.log("Patient pathway changed");

  }

}
