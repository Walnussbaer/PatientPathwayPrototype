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
   * The subject that manages the context of users wanting to see the details of a pathway event. 
   */
  private openDetailsRequest: Subject<string> = new Subject();

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
  public onNewPathwayEventOpeningClaim(): Observable<string> {

    return this.openDetailsRequest;

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
   * Emits the event that the user requested to see the details of an event with a specific name. 
   * 
   * @param eventName the name of the event that shall be opened
   */
  public emitNewOpenPathwayEvent(eventName: string) {

    this.openDetailsRequest.next(eventName);

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

    return this.httpClient.get<PathwayEvent[]>(this.testDataUrl);

  }
}
