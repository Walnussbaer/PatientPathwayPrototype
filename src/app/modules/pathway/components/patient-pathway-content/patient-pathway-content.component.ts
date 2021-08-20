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

  @Input() eventType?: PathwayEventType;

  @Input() eventContent?: any;

  constructor() { }

  ngOnInit(): void {}

}
