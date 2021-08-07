import { Component, OnInit } from '@angular/core';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';
import { PathwayEvent } from '../../model/PathwayEvent';

@Component({
  selector: 'app-pathway-event-creator',
  templateUrl: './pathway-event-creator.component.html',
  styleUrls: ['./pathway-event-creator.component.css']
})
export class PathwayEventCreatorComponent implements OnInit {

  public newPathwayEvent: PathwayEvent = {};

  constructor(private speechRecognitionService: SpeechRecognitionService) { }

  ngOnInit(): void {

  }
}
