import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeechSynthesisService {

  private speechSynthesis!: SpeechSynthesis;

  private speechSynthesisUtterance!: SpeechSynthesisUtterance;

  constructor() { }

  public initSynthesis(): void {

    this.speechSynthesis = window.speechSynthesis;
    this.speechSynthesisUtterance = new SpeechSynthesisUtterance();

  }

  public speakUtterance(message: string) {

    if (!this.speechSynthesis) {
      console.warn("Speech synthesis service not initialized!");
      return;
    }

    console.log("speaking " + message);

    this.speechSynthesisUtterance.text = message;

    this.speechSynthesis.speak(this.speechSynthesisUtterance);


  }

  public onSpeechEnd(): Observable<string> {

    return new Observable(subscriber => {

      this.speechSynthesisUtterance.addEventListener("end",(endEvent)=> {

        subscriber.next("utterance finished");
        subscriber.complete();

      })

    });
  }

  public onSpeechStart(): Observable<string> {

    return new Observable(subscriber => {

      this.speechSynthesisUtterance.addEventListener("start", (startEvent)=> {

        subscriber.next("utterance started");

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
