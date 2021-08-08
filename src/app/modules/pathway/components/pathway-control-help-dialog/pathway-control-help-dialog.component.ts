import { Component, OnInit } from '@angular/core';
import { SpeechRecognitionService } from 'src/app/shared/services/speech/speech-recognition.service';

@Component({
  selector: 'pathway-control-help-dialog',
  templateUrl: './pathway-control-help-dialog.component.html',
  styleUrls: ['./pathway-control-help-dialog.component.css']
})
export class PathwayControlHelpDialogComponent implements OnInit {

  public creatorIsListening: boolean = false;

  constructor(private speechRecognitionService: SpeechRecognitionService) { }

  ngOnInit(): void {

    this.speechRecognitionService.initRecognition();

  }

}
