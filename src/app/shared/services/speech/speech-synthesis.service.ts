import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebSpeechSynthesisMessage } from './WebSpeechSynthesisMessage';
import { WebSpeechSynthesisMessageType } from './WebSpeechSynthesisMessageType';

@Injectable({
  providedIn: 'root'
})
export class SpeechSynthesisService {

  /**
   * The controller interface for the speech synthesis.
   */
  private speechSynthesis!: SpeechSynthesis;

  /**
   * The utterance that shall be synthesized. 
   */
  private speechSynthesisUtterance!: SpeechSynthesisUtterance;

  constructor() { }

  /**
   * Initializes the service. 
   * 
   * @return false if the the speech synthesis is not supported, else false
   */
  public initSynthesis(): boolean {

    // we check if a implementation of the controller interface is availabe
    if (!('speechSynthesis' in window)){
      console.log("Die Sprachsynthetisierung wird in diesem Browser leider nicht unterstützt.");
      return false;
    }

    this.speechSynthesis =  window.speechSynthesis;
    this.speechSynthesisUtterance = new SpeechSynthesisUtterance();
    return true;
  }

  /**
   * Gets a message as input, synthesizes this message and speaks it out loud.
   * 
   * @param message the message to synthesize and say
   */
  public speakUtterance(message: string):void {

    if (!this.speechSynthesis) {
      console.warn("Speech synthesis service not initialized!");
      return;
    }

    this.speechSynthesisUtterance.text = message;

    this.speechSynthesis.speak(this.speechSynthesisUtterance);
  }

  /**
   * Returns an Observable that can be subscribed to. The observable returns a value when the speech synthesizer has stopped talking out loud.
   * 
   * @returns the Observable to subscribe to
   */
  public onSpeechEnd(): Observable<WebSpeechSynthesisMessage> {

    return new Observable(subscriber => {

      this.speechSynthesisUtterance.addEventListener("end",(endEvent)=> {

        let message: WebSpeechSynthesisMessage = {
          data: "Stopped talking",
          messageType: WebSpeechSynthesisMessageType.END
        }

        subscriber.next(message);
        subscriber.complete();

      })

    });
  }

  public onErrorEvent(): Observable<WebSpeechSynthesisMessage> {

    return new Observable(subscriber => {
      this.speechSynthesisUtterance.addEventListener("error",(errorEvent) => {

        let customErrorMessage: string = "";
        let errorIdentifier: string = errorEvent.error;

        // see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisErrorEvent/error for reference

        switch(errorIdentifier) {

          case "canceled": {
            customErrorMessage = "Die Sprachsynthetisierung konnte nicht gestartet werden."
            break;
          }
          case "interrupted": {
            customErrorMessage = "Die Sprachsynthetisierung wurde unterbrochen."
            break;
          }
          case "audio-busy": {
            customErrorMessage = "Die Sprachsynthetisierung konnte nicht gestartet werden, da das Audioausgabegerät beschäftigt ist."
            break;
          }
          case "audio-hardware": {
            customErrorMessage = "Bitte schließen Sie ein entsprechendes Audiogerät an, um die Sprachsynthetisierung nutzen zu können."
            break;
          }
          case "network": {
            customErrorMessage = "Ein Netzwerkfehler ist bei der Sprachsynthetisierung aufgetreten."
            break;
          }
          case "synthesis-unavailable": {
            customErrorMessage = "Für die Sprachausgabe konnte keine Sprachsynthetisierung durchgeführt werden."
            break;
          }
          case "synthesis-failed": {
            customErrorMessage = "Während der Sprachsynthetisierung ist ein Fehler aufgetreten."
            break;
          }
          case "language-unavailable": {
            customErrorMessage = "Die gewählte Sprache steht für die Sprachsynthetisierung nicht zur Verfügung."
            break;
          }
          case "voice-unavailable": {
            customErrorMessage = "Die gewählte Stimme steht für die Sprachsynthetisierung nicht zur Verfügung."
            break;
          }
          case "text-too-long": {
            customErrorMessage = "Der Text ist zu lang für eine Sprachsynthetisierung."
            break;
          }
          case "invalid-argument": {
            customErrorMessage = "Die Sprachsynthetisierung konnte nicht durchgeführt werden, da die konfigurierte Sprachgeschwindigkeit, -tonlage oder die -lautstärke invalide Werte enthalten."
            break;
          }
          default: {
            break;
          }

        }

        let message: WebSpeechSynthesisMessage = {
          data: customErrorMessage,
          messageType: WebSpeechSynthesisMessageType.ERROR
        };
        subscriber.next(message);

      })
    })

  }

  /**
   * Returns an Observable that can be subscribed to. The observable returns a value when the speech synthesizer has started talking out loud.
   * 
   * @returns the Observable to subscribe to
   */
  public onSpeechStart(): Observable<WebSpeechSynthesisMessage> {

    return new Observable(subscriber => {

      this.speechSynthesisUtterance.addEventListener("start", (startEvent)=> {

        let message: WebSpeechSynthesisMessage = {
          data: "Started talking",
          messageType: WebSpeechSynthesisMessageType.START
        }

        subscriber.next(message);

      })

    })

  }

  /**
   * Get the available voices in the currently active browser. 
   * 
   * Note: Seems to be not supported. Always returns an empty array.
   * 
   * @returns an array of {@link SpeechSynthesisVoice}s. 
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {

    if (!this.speechSynthesis) {
      return [];
    }

    let availableVoices: SpeechSynthesisVoice[] = this.speechSynthesis.getVoices();

    return availableVoices;

  }

}
