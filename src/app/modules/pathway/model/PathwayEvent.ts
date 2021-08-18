import { PathwayEventType } from "./PathwayEventType";

export interface PathwayEvent {

    date?: Date;
    header?: string;
    content?: any;
    type?: PathwayEventType
    
}