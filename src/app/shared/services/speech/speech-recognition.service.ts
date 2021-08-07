import { Injectable } from '@angular/core';

/* At the moment, we need to use the Google implementation, so we need to declare these variables here,
 otherwise, Angular will not recognize them, becauase webkitSpeechRecognition is not a library 
*/
declare var webkitSpeechRecognition: any;
declare var webkitSpeechGrammarList: any;

/**
 * This service handles the speech recognition. 
 * 
 * Note: As of now, grammars are not working correctly using the Web Speech API. The spech recognition does not check wheteher the grammar can be applied to the spoken
 * words or not. The spech recognition always returns an result. Therefore, this services checks the spoken words against strings. 
 */
@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {

  /**
   * The instance that controls the recognition of grammars. 
   * 
   * We declare this public for now, so we can easily add event listeners. 
   */
  public speechRecognition!: SpeechRecognition;

  /**
   * Contains the grammar for the speech recognition.
   */
  private speechGrammarList!: SpeechGrammarList;

  constructor() {}

   /**
    * Initializes the speech recognition service with a default configuration. 
    * 
    * @return true if the speech recognition is available and ready to use, else false
    */
   public init(): boolean {

    let speechRecognitionSupported: boolean = false;

    // check whether the browser supports the web speech API without a vendor prefix
    if ('speechRecognition' in window) {

      this.speechRecognition = new window.SpeechRecognition();
      this.speechGrammarList = new window.SpeechGrammarList();
      speechRecognitionSupported = true;

    } 
    // if not vendor independent version could be found, we gonna use the google implementation, which is currently the only one implementing the speech recognition properly
    else if ('webkitSpeechRecognition' in window) {

      this.speechRecognition = new webkitSpeechRecognition();
      this.speechGrammarList = new webkitSpeechGrammarList();
      speechRecognitionSupported = true;

    }
    else {
      speechRecognitionSupported = false;
    }
    
    // configure some parameters of the speech recognition
    if (speechRecognitionSupported) {

      /* the following comments are taken from https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API */

      // controls whether continuous results are captured, or just a single result each time recognition is started
      this.speechRecognition.continuous = false

      // set the language of the recognition
      this.speechRecognition.lang = "de-DE";

      // defines whether the speech recognition system should return interim results or final results
      this.speechRecognition.interimResults = false;

      // sets the number of alternative potential matches that should be returned per result
      // This can sometimes be useful, say if a result is not completely clear and you want to display a list if alternatives for the user to choose the correct one from.
      this.speechRecognition.maxAlternatives = 1;

      return true;
    }
    else {

      return false;

    }

   }

  /**
   * Adds a grammar to the speech recognition. Note that grammars are not supported by the Google implementation of the Web Speech API. This may change in the future. 
   * 
   * Rules that shall be added must be in the JSGF format. For example, a rule that look's for the terms 'New element' in an utterance of a human being should look like this:
   * 
   * "public \<newPathElement> = New element;"
   * 
   * Do not forget the ; at the end of a grammar rule. 
   * 
   * For more info, go to https://www.w3.org/TR/2000/NOTE-jsgf-20000605/
   * 
   * @param grammarName the name of the grammar
   * @param grammarRules an Array of grammar rules using the JSGF format
   * @param grammarWeight the weight (importance) of the grammar in relation to other grammars, must be between 0 and 1
   */
  public addGrammar(grammarName: string, grammarRules: Array<string>, grammarWeight: number): void {

    // the version of the grammar
    let grammarVersion: string = "#JSGF V1.0 UTF-8 de;";

    // the rules that belong to the grammar
    let concatedGrammarRules: string = "";

    // the grammar that shall be constructed and added to the speech recognition
    let grammar: string = "";

    grammarName = "grammar " + grammarName + ";";

    grammarRules.forEach((rule,index,array) =>{

      concatedGrammarRules = concatedGrammarRules + rule;

    })

    grammar = grammarVersion + grammarName + concatedGrammarRules;

    this.speechGrammarList.addFromString(grammar,grammarWeight);

  }

   public startRecognition(): void {

    this.speechRecognition.start();

  }

  public stopRecognition(): void {

    this.speechRecognition.stop();

  }

}
