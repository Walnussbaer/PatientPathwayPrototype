import { Component, Input, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCalendarAlt, faClinicMedical, faHeadSideVirus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { PathwayEventType } from '../../model/PathwayEventType';

@Component({
  selector: 'patient-pathway-header',
  templateUrl: './patient-pathway-header.component.html',
  styleUrls: ['./patient-pathway-header.component.css']
})
export class PatientPathwayHeaderComponent implements OnInit {

  @Input() eventType?: PathwayEventType;

  @Input() eventHeader?: string;

  public icon!: IconDefinition;

  constructor() { }

  ngOnInit(): void {

    this.identifyIconToUse();

  }

  /**
   * Checks the type of the event and then defines, what icon the header shall use. 
   */
  private identifyIconToUse() {

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