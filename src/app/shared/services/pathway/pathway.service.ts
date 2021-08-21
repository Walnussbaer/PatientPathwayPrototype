import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PathwayEvent } from 'src/app/modules/pathway/model/PathwayEvent';

/**
 * A service for handling a patient specific patient pathway. 
 */
@Injectable({
  providedIn: 'root'
})
export class PathwayService {

  /** The url of the test data json file. */
  private testDataUrl: string = "/assets/data/PathwayEntries.json";

  /** The subject that manages the context of users wanting to see the details of a pathway event. */
  private expandPathwayEventRequest: Subject<PathwayEvent> = new Subject();

  /** The subject that manages the context of users requesting to delete a pathway event. */
  private deletePathwayEventRequest: Subject<boolean> = new Subject();

  /** The subject that manages the context when the pathway actually opened the details of a pathway event. */
  private pathwayEventExpanded: Subject<PathwayEvent> = new Subject();

  /** The subject that manages the context when a pathway event that is not availabe shall be handeled by the pathway (e.g the user wants to open a potential pathway event, which is not exiting). */
  private pathwayEventNotAvailable: Subject<PathwayEvent> = new Subject();

  constructor(private httpClient: HttpClient) { }

  /**
   * Returns an observable that can be subscribed to to define what shall happen when the user requested to open an existing pathway event.
   *  
   * @returns the Observable to subscribe to
   */
  public onNewPathwayEventExpandRequest(): Observable<PathwayEvent> {

    return this.expandPathwayEventRequest;

  }

  /**
   * Emits the event that the user requested to see the details of an event, identified by date an name. 
   * 
   * @param eventName the name of the event that shall be opened
   */
  public emitNewPathwayEventExpandRequestEvent(event: PathwayEvent): void {

    this.expandPathwayEventRequest.next(event);

  }

  /**
   * Returns an observable that can be subscribed to to define what shall happen when the pathway actually expanded/ openend a specific pathway event. 
   *  
   * @returns the Observable to subscribe to
   */
  public onPathwayEventExpanded(): Observable<PathwayEvent> {

    return this.pathwayEventExpanded;

  }

  /**
   * Emits the event that the pathway expanded/ openened the details of a pathway event. 
   * 
   * @param event the event that was expanded
   */
  public emitNewPathwayEventExpandedEvent(event: PathwayEvent): void {

    this.pathwayEventExpanded.next(event);
  
  }

  /**
   * Returns an observable that can be subscribed to to define what shall happen when the pathway could not find a specific event called out for by the user. 
   * 
   * @returns the Observable to subscribe to
   */
  public onPathwayEventNotAvailable(): Observable<PathwayEvent> {

    return this.pathwayEventNotAvailable;

  }

  /**
   * Emits the event that the pathway tries to open the details of an event. 
   * 
   * @param event the event that is to be opened
   */
  public emitNewPathwayEventNotAvailableEvent(event: PathwayEvent): void {

    this.pathwayEventNotAvailable.next(event);
  
  }

  /**
   * Returns an observable that can be subscribed to to define what shall happen when a pathway event got deleted. 
   *  
   * @returns the Observable to subscribe to
   */
  public onPathwayEventDeleted(): Observable<boolean> {

    return this.deletePathwayEventRequest;

  }

  /**
   * Emits the event that a pathway event got deleted. 
   * 
   * @param operationResult whether the delete operation could be executed or not
   */
  public emitNewPathwayEventDeletedEvent(operationResult: boolean): void {

    this.deletePathwayEventRequest.next(operationResult);

  }

  /**
   * Get all the pathway entries that are stored. 
   * 
   * A pathway entry is a single event that occured/ will occur in a patient pathway. 
   */
  public getPathwayEntries(): Observable<PathwayEvent[]> {

    return this.httpClient.get<PathwayEvent[]>(this.testDataUrl).pipe(
      map((pathwayEvents) => {
        // convert date field to real JS date, so we have less problems later
        pathwayEvents.forEach((event => {
          event.date = new Date(event.date!);
        }));
        return pathwayEvents;
      })
    );

  }
}
