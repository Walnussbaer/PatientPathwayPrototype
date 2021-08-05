import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PathwayEntry } from 'src/app/modules/pathway/patient-pathway/model/PathwayEntry';

/**
 * A service for handling a patient specific patient pathway. 
 */
@Injectable({
  providedIn: 'root'
})
export class PathwayService {

  private testDataUrl: string = "/assets/data/PathwayEntries.json";

  constructor(private httpClient: HttpClient) { }

  /**
   * Get all the pathway entries that are stored. 
   * 
   * A pathway entry is a single event that occured/ will occur in a patient pathway. 
   */
  public getPathwayEntries(): Observable<PathwayEntry[]> {

    return this.httpClient.get<PathwayEntry[]>(this.testDataUrl);

  }

}
