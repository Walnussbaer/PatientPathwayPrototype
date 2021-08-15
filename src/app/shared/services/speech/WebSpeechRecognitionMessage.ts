import { WebSpeechRecognitionMessageType } from "./WebSpeechRecognitionMessageType";


/**
 * This type defines the messages that get created on certain Web Speech API speech recognition events and can be used by the application to further process the speech recognition.
 *  
 */
export interface WebSpeechRecognitionMessage {

    messageType: WebSpeechRecognitionMessageType;

    data: any;

}