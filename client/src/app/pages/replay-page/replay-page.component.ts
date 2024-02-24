import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EventDescription } from '@app/classes/event-description';
import { videoTool } from '@app/components/control-video-tool/control-video-tool.component';
import { ControlVideoComponent } from '@app/components/control-video/control-video.component';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { ClickHistoryService } from '@app/services/click-history.service';
import { ReplayService } from '@app/services/replay.service';
import { constsClue } from '@common/consts';
import { Subject } from 'rxjs';
import { GamePageClassic1v1Component } from '../game-page-classic1v1/game-page-classic1v1.component';
import { GamePageComponent } from '../game-page/game-page.component';

@Component({
  selector: 'app-replay-page',
  templateUrl: './replay-page.component.html',
  styleUrls: ['./replay-page.component.scss'],
})
export class ReplayPageComponent implements AfterViewInit {

  @ViewChild('gamePage') gamePage: GamePageComponent;
  @ViewChild('gamePage1v1') gamePage1v1: GamePageClassic1v1Component;
  @ViewChild('controlBar') controlBar: ControlVideoComponent;

  gamePageElem: GamePageComponent | GamePageClassic1v1Component;
  currentEvent: EventDescription = {} as EventDescription;
  indexEvent: number = 0;

  constructor(
    private readonly clickHistoryService: ClickHistoryService,
    public replayService: ReplayService,
    private readonly dialogRef: MatDialog,
    private readonly router: Router
  ) {}


  ngAfterViewInit(): void {
    this.changeCurrentEvent();
    this.clickHistoryService.incremented = new Subject<number>();
    this.clickHistoryService.startTimer();
    this.clickHistoryService.incremented.subscribe((value) => {
      this.playEvents(value);
    });
    this.gamePageElem = this.replayService.isSolo ? this.gamePage : this.gamePage1v1;
  }



  playEvents(time: number) {
    while (this.currentEvent && this.currentEvent.time === time) {
      this.currentEvent.play(this);
      this.changeCurrentEvent();
    }
  }

  changeCurrentEvent() {
    this.currentEvent = this.clickHistoryService.clickHistory[this.indexEvent];
    this.indexEvent++;
  }

  async updateChrono(tool: videoTool) {
    switch (tool) {
      case videoTool.play:
        clearInterval(this.gamePageElem.timer.interval);
        this.gamePageElem.timer.startTimer();
        break;
      case videoTool.pause:
        clearInterval(this.gamePageElem.timer.interval);

        break;
      case videoTool.restart:
        this.restartControlBehaviour()

        break;
      case videoTool.forwardTwo:
        clearInterval(this.gamePageElem.timer.interval);
        this.gamePageElem.timer.startTimer(500);

        break;
      case videoTool.forwardFour:
        clearInterval(this.gamePageElem.timer.interval);
        this.gamePageElem.timer.startTimer(250);

        break;
    }
  }

  async restartControlBehaviour() {
    this.gamePageElem.timer.stop();
    this.gamePageElem.timer.chrono = '00:00';
    this.gamePageElem.blinker.clearAllBlink.next(true);
    if (this.gamePageElem === this.gamePage) {
      this.gamePageElem.clues.nClues = constsClue.N_CLUES;
    }
    //this.gamePageElem.sidebar.messenger.messages = [];
    this.gamePageElem.counter.reset();
    this.gamePageElem.initialiseGame();
    this.loadImage1();
    this.loadImage2();

    this.gamePageElem.timer.startTimer();
    this.indexEvent = 0;
    this.changeCurrentEvent();
  }

  async loadImage1(): Promise<void> {
    return new Promise((resolve) => {
      const image1 = new Image();
      image1.src = this.gamePageElem.img1src;
      image1.onload = () => {
        createImageBitmap(image1).then((btmp) => {
          this.gamePageElem.img1 = btmp;
          resolve();
        });
      };
    });
  }
  async loadImage2(): Promise<void> {
    return new Promise((resolve) => {
      const image2 = new Image();
      image2.src = this.gamePageElem.img2src;
      image2.onload = () => {
        createImageBitmap(image2).then((btmp) => {
          this.gamePageElem.img2 = btmp;
          resolve();
        });
      };
    });
  }

  openDialogEndReplay() {
    PopupTextComponent.openDialog(
      this.dialogRef,
      {
        message: "<h2>Fin de la partie!</h2> Voulez-vous rejouer la partie?",
        btnText: 'Quitter',
        btnText2: 'Rejouer',
        preventClose: true,
      } as DialogData,
      this.endGameCallback,
    );
  }

  endGameCallback = (feedback: DialogFeedback) => {
    this.dialogRef.closeAll();
    const btn = feedback.event.target as HTMLButtonElement;

    if (btn.innerHTML === 'Rejouer') {
      this.controlBar.emitRestart();
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    this.indexEvent = 0;
    this.currentEvent = {} as EventDescription;
    this.clickHistoryService.incremented.unsubscribe();
    this.clickHistoryService.reinit();
  }
}