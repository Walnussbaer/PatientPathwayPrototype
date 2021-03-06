import { Component, Input, OnInit } from '@angular/core';
import { PathwayEventType } from '../../model/PathwayEventType';

/**
 * This component can be used inside an mgl-timeline-entry-content component to display custom content of a pathway event. 
 */
@Component({
  selector: 'patient-pathway-content',
  templateUrl: './patient-pathway-content.component.html',
  styleUrls: ['./patient-pathway-content.component.css']
})
export class PatientPathwayContentComponent implements OnInit {

  /**
   * The type of the event that the content describes. 
   */
  @Input() eventType?: PathwayEventType;

  /**
   * The content of the of the {@link PathwayEvent}. 
   */
  @Input() eventContent?: any;

  constructor() { }

  ngOnInit(): void {}

}
