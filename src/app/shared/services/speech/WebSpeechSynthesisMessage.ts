import { WebSpeechSynthesisMessageType } from "./WebSpeechSynthesisMessageType";

/**
 * This type defines the messages that get created on certain Web Speech API speech synthesis events and can be used by the application to further process the speech recognition. 
 * 
 */
 export interface WebSpeechSynthesisMessage {

    messageType: WebSpeechSynthesisMessageType;

    data: any;

}