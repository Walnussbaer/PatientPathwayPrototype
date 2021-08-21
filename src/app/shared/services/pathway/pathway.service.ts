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

  private testDataUrl: string = "/assets/data/PathwayEntries.json";

  /**
   * The subject that manages the context of users wanting to see the details of a pathway event. 
   */
  private openDetailsRequest: Subject<PathwayEvent> = new Subject();

  /**
   * The subject that manages the context when the pathway actually opened the details of a pathway event. 
   */
  private pathwayEventOpened: Subject<PathwayEvent> = new Subject();

    /**
   * The subject that manages the context when a pathway event that is not availabe shall be handeled by the pathway (e.g the user wants to open a potential pathway event, which is not exiting)
   */
  private pathwayEventNotAvailable: Subject<PathwayEvent> = new Subject();

  /**
   * The subject that manages the context of users requesting to delete an event. 
   */
  private delteOperationRequest: Subject<boolean> = new Subject();


  constructor(private httpClient: HttpClient) { }

  /**
   * Returns an observable that can be subscribed to to define what shall happen when the user want's to open an existing pathway event.
   *  
   * @returns the Observable to subscribe to
   */
  public onNewPathwayEventOpeningClaim(): Observable<PathwayEvent> {

    return this.openDetailsRequest;

  }

    /**
   * Returns an observable that can be subscribed to to define what shall happen when the pathway tries to open a specific pathway event. 
   *  
   * @returns the Observable to subscribe to
   */
  public onPathwayEventOpened(): Observable<PathwayEvent> {

    return this.pathwayEventOpened;

  }

  public onPathwayEventNotAvailable(): Observable<PathwayEvent> {

    return this.pathwayEventNotAvailable;

  }

  /**
   * Returns an observable that can be subscribed to to define what shall happen when a pathway event got deleted. 
   *  
   * @returns the Observable to subscribe to
   */
  public onPathwayEventDeleted(): Observable<boolean> {

    return this.delteOperationRequest;

  }

  /**
   * Emits the event that the user requested to see the details of an event, identified by date an name. 
   * 
   * @param eventName the name of the event that shall be opened
   */
  public emitNewOpenPathwayEvent(event: PathwayEvent) {

    this.openDetailsRequest.next(event);

  }

  /**
   * Emits the event that the pathway tries to open the details of an event. 
   * 
   * @param event the event that is to be opened
   */
  public emitNewPathwayEventOpenEvent(event: PathwayEvent) {

    this.pathwayEventOpened.next(event);

  }

  /**
   * Emits the event that the pathway tries to open the details of an event. 
   * 
   * @param event the event that is to be opened
   */
  public emitNewPathwayEventNotAvailableEvent(event: PathwayEvent) {

    this.pathwayEventNotAvailable.next(event);

  }

  /**
   * Emits the event that a pathway event got deleted. 
   * 
   * @param eventName whether the delete operation could be executed or not
   */
  public answerPathwayDeleteRequest(operationResult: boolean) {

    this.delteOperationRequest.next(operationResult);

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
