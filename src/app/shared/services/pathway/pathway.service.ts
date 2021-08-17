import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PathwayEvent } from 'src/app/modules/pathway/model/PathwayEvent';

/**
 * A service for handling a patient specific patient pathway. 
 */
@Injectable({
  providedIn: 'root'
})
export class PathwayService {

  private testDataUrl: string = "/assets/data/PathwayEntries.json";

  /**
   * A subject/ observable that can be subscribed to to define what shall happen when the user want's to open an existing pathway event. 
   */
  private openPathwayEventSubject: Subject<string> = new Subject();

  constructor(private httpClient: HttpClient) { }

  /**
   * Returns an observable that can be subscribed to to define what shall happen when the user want's to open an existing pathway event.
   *  
   * @returns the Observable to subscribe to
   */
  public onNewPathwayEventOpeningClaim(): Observable<string> {

    return this.openPathwayEventSubject;

  }

  /**
   * 
   * @param eventName 
   */
  public emitNewOpenPathwayEvent(eventName: string) {

    this.openPathwayEventSubject.next(eventName);

  }

  /**
   * Get all the pathway entries that are stored. 
   * 
   * A pathway entry is a single event that occured/ will occur in a patient pathway. 
   */
  public getPathwayEntries(): Observable<PathwayEvent[]> {

    return this.httpClient.get<PathwayEvent[]>(this.testDataUrl);

  }
}
