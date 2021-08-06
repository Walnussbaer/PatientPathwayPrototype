import { Component, Input, OnInit } from '@angular/core';
import { PathwayService } from 'src/app/shared/services/pathway.service';
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
export class PatientPathwayComponent implements OnInit {

  @Input() pathwayEvents : PathwayEvent[] = [];

  /**
   * The size of the dots used in the pathway representation. 
   */
  public pathwayDotSize: number = 60;

  /**
   * Set to true if you want to pathway to have it's entries alternat the side. 
   */
  public pathwayEntryAlternation: boolean = false;

  /**
   * Seriously, I don't know what this option does. The provided stackblitz of the author does not explain it, nor does the provided documentation. 
   */
  public pathwaySide: string = "left";

  constructor() { }

  ngOnInit(): void {


  }

  public onEntryExpand(expanded: boolean): void {



  }

}
