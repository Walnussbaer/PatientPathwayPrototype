import { Component, OnInit } from '@angular/core';
import { PathwayService } from 'src/app/shared/services/pathway.service';
import { PathwayEntry } from './model/PathwayEntry';

@Component({
  selector: 'app-patient-pathway',
  templateUrl: './patient-pathway.component.html',
  styleUrls: ['./patient-pathway.component.css']
})
export class PatientPathwayComponent implements OnInit {

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

  /**
   * The data that shall be displayed in the timeline. 
   */
  public pathwayData: Array<PathwayEntry> = [];

  constructor(private pathwayService: PathwayService) { }

  ngOnInit(): void {

    this.pathwayService.getPathwayEntries().subscribe({
      next: (result) =>  { 
        this.pathwayData = result
        //console.log(this.pathwayData);
      },

      error: (error) => {
        console.error("Could not retrieve pathway data!");
      }
    })

  }

  public onEntryExpand(expanded: boolean): void {



  }

}
