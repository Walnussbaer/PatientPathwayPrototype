import { Component, Input, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCalendarAlt, faClinicMedical, faHeadSideVirus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { PathwayEventType } from '../../model/PathwayEventType';

/**
 * This component can be used inside an mgl-timeline-entry-header component to display a custom header of a pathway event. 
 */
@Component({
  selector: 'patient-pathway-header',
  templateUrl: './patient-pathway-header.component.html',
  styleUrls: ['./patient-pathway-header.component.css']
})
export class PatientPathwayHeaderComponent implements OnInit {

  /**
   * The type of the event that the header describes. 
   */
  @Input() eventType?: PathwayEventType;

  /**
   * The textual content of the header of the {@link PathwayEvent}. 
   */
  @Input() eventHeader?: string;

  /**
   * The icon that is used in the component, depending on the event type. 
   */
  public icon!: IconDefinition;

  constructor() { }

  ngOnInit(): void {

    this.identifyIconToUse();

  }

  /**
   * Checks the type of the event and then defines, what icon the header shall use. 
   */
  private identifyIconToUse(): void {

    switch (this.eventType) {

      case PathwayEventType.APPOINTMENT: {
        this.icon = faCalendarAlt;
        break;
      }
      case PathwayEventType.SYMPTOM_BUNDLE: {
        this.icon = faHeadSideVirus;
        break;
      }
      default: {
        this.icon = faClinicMedical;
        break;
      }
    }
  }

}
