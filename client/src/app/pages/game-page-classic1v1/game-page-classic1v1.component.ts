import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChronometreComponent } from '@app/components/chronometre/chronometre.component';
import { CounterComponent } from '@app/components/counter/counter.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { Difference } from '@app/interfaces/difference';
import { BlinkerService } from '@app/services/blinker.service';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { CurrentGameService } from '@app/services/current-game.service';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';
import { GameHistoryService } from '@app/services/game-history.service';
import { GameInfoService } from '@app/services/game-info.service';
import { ImageTransferService } from '@app/services/image-transfer.service';
import { ImageUpdateService } from '@app/services/image-update.service';
import { ReplayService } from '@app/services/replay.service';
import { GameMode } from '@common/game-classes';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-game-page-classic1v1',
  templateUrl: './game-page-classic1v1.component.html',
  styleUrls: ['./game-page-classic1v1.component.scss'],
  providers: [BlinkerService, CheatModeService, CurrentGameService],
})
export class GamePageClassic1v1Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas1') canvas1: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;
  @ViewChild('leftPlayArea') leftPlayArea: PlayAreaComponent;
  @ViewChild('rightPlayArea') rightPlayArea: PlayAreaComponent;
  @ViewChild('counter') counter: CounterComponent;
  @ViewChild('counter2') counter2: CounterComponent;
  @ViewChild('timer') timer: ChronometreComponent;
  @ViewChild('sidebar') sidebar: SidebarComponent;

  private destroy$ = new Subject<any>();
  audio: HTMLAudioElement;
  isBlinking: boolean;
  pageLoaded: boolean;
  initialTime: Date;
  buttonTitle: string;
  message: string;
  wantToQuit: boolean;

  username: string;
  username2: string;
  winner: string;

  diff: Difference[] | undefined;

  originalImage: ImageBitmap;
  img1: ImageBitmap;
  img2: ImageBitmap;
  img1src: string;
  img2src: string;
  link1: string;
  link2: string;

  gameEnded: boolean;
  cheatMode: boolean;
  leader: boolean;

  constructor(
    private imageTransfer: ImageTransferService,
    private gameInfo: GameInfoService,
    private differencesDetectionService: DifferencesDetectionService,
    private imageUpdateService: ImageUpdateService,
    public blinker: BlinkerService,
    private cheatModeService: CheatModeService,
    private currentGameService: CurrentGameService,
    private gameHistoryService: GameHistoryService,
    private replayService: ReplayService,
    public router: Router
  ) {
    this.replayService.isSolo = false;
    this.replayService.restartTimer();
  }

  ngOnInit() {
    this.initialiseGame();
    this.differencesDetectionService.difference.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      this.diff = x;
    });

    this.username = this.leader ? this.gameInfo.username : this.gameInfo.username2;
    this.username2 = this.leader ? this.gameInfo.username2 : this.gameInfo.username;
    if (this.diff) {
      this.currentGameService.init(this.username, this.username2);
    }

    window.addEventListener('keydown', this.keydownHandler);
    const image = new Image();
    image.src = this.img1src;
    image.onload = () => {
      createImageBitmap(image).then((btmp) => {
        this.originalImage = btmp;
      });
    }
  }

  initialiseGame() {

    this.audio = new Audio();
    this.link1 = this.imageTransfer.link1;
    this.img1src = this.imageTransfer.img1;
    this.link2 = this.imageTransfer.link2;
    this.img2src = this.imageTransfer.img2;
    this.diff = this.imageTransfer.diff;
    this.username = this.gameInfo.username;
    this.username2 = this.gameInfo.username2;
    this.gameEnded = false;
    this.cheatMode = false;
    this.leader = this.gameInfo.isLeader;
    this.differencesDetectionService.setDifference(this.diff);
    this.destroy$ = new Subject<any>();
    this.isBlinking = false;
    this.pageLoaded = false;
    this.buttonTitle = 'Oui';
    this.message = 'Êtes-vous sûr de quitter la partie ?';
    this.wantToQuit = false;
  }
  async setup() {

    const image1 = new Image();
    image1.src = this.img1src;
    image1.onload = () => {
      createImageBitmap(image1).then((btmp) => {
        this.img1 = btmp;
      });
      const image2 = new Image();
      image2.src = this.img2src;
      image2.onload = () => {
        createImageBitmap(image2).then((btmp) => {
          this.img2 = btmp;
          this.differencesDetectionService.resetFound();
          this.differencesDetectionService.resetCount();

          this.blinker.init(this.canvas1, this.canvas2);
          this.blinker.canvas1.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.canvas1 = x;
            this.canvasToUrl(this.canvas1, this.canvas2);
          });
          this.blinker.isBlinking.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.isBlinking = x;
          });

          this.cheatModeService.init();
          this.differencesDetectionService.found.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            if (x) {
              if (this.pageLoaded) {
                this.refresh(x);
              } else {
                const updated = this.imageUpdateService.updateImage(x, this.canvas1, this.canvas2, this.img1, this.img2);
                this.canvasToUrl(updated.c1, updated.c2);
              }
            }
          });
          this.currentGameService.diffArray.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            if (x) {
              this.differencesDetectionService.setDifference(this.diff);
              if (this.pageLoaded) {
                this.refresh(x);
              } else {
                const updated = this.imageUpdateService.updateImage(x, this.canvas1, this.canvas2, this.img1, this.img2);
                this.canvasToUrl(updated.c1, updated.c2);
              }
            }
          });
          this.counter.reset();
          this.counter2.reset();
          this.currentGameService.resetCount();
          this.currentGameService.currentPlayerCount.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.counter.count = x;
          });
          this.currentGameService.otherPlayerCount.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.counter2.count = x;
          });
          this.currentGameService.endGame.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            const result = x[0];
            const quit = x[1];
            if (result) {
              this.endGame(this.winner, quit);
            }
          });
          this.currentGameService.winner.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.winner = x;
          });

          this.initialTime = new Date()
          this.pageLoaded = true;
        });
      };
    };

  }

  ngAfterViewInit() {
    this.setup();
  }

  refresh(x: Difference[]) {
    let updated: { c1: ElementRef<HTMLCanvasElement>, c2: ElementRef<HTMLCanvasElement> };
    if (this.cheatMode) {
      updated = this.imageUpdateService.updateImage(x, this.canvas1, this.canvas2, this.originalImage, this.originalImage);
    } else {
      updated = this.imageUpdateService.updateImage(x, this.canvas1, this.canvas2, this.img1, this.img2);
    }
    this.canvas1 = updated.c1;
    this.canvas2 = updated.c2;
    this.canvasToUrl(this.canvas1, this.canvas2);
    this.playAudio();
    if (!this.cheatMode) {
      const ctx1 = this.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
      const ctx2 = this.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
      this.blinker.blinkPixels([x[0]], ctx1, ctx2);
    }
  }

  canvasToUrl(c1: ElementRef<HTMLCanvasElement>, c2: ElementRef<HTMLCanvasElement>) {
    const url2 = c2.nativeElement.toDataURL();
    this.img2src = url2;
    const image2 = new Image();
    image2.src = this.img2src;
    image2.onload = () => {
      createImageBitmap(image2).then((btmp) => {
        this.img2 = btmp;
      });
    };

    this.link2 = 'url(' + url2 + ')';
    const url1 = c1.nativeElement.toDataURL();

    this.img1src = url1;
    const image1 = new Image();
    image1.src = this.img1src;
    image1.onload = () => {
      createImageBitmap(image1).then((btmp) => {
        this.img1 = btmp;
      });
    };
    this.link1 = 'url(' + url1 + ')';
  }

  onContinue(eventData: { quit: boolean, message: string }) {
    this.wantToQuit = eventData.quit;
    if (eventData.quit && eventData.message === 'Êtes-vous sûr de quitter la partie ?') {
      this.currentGameService.gameEnded(true);
    }
  }

  async playAudio() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = "assets/audio/success.mp3";
    await this.audio.play().catch((err: any) => {
      console.log(err);
    });
  }

  onKeydown() {
    if (this.cheatMode) {
      this.cheatModeService.startBlink();
    } else {
      this.cheatModeService.stopBlink();
    }
  }

  async endGame(winner: string, quit: boolean) {
    this.endGameReset(winner);
    if (winner == this.username) {
      const duration = new Date().getTime() - this.initialTime.getTime();
      await this.gameHistoryService.uploadHistory(GameMode.CLASSIQUE_1V1, this.initialTime, duration, this.username, this.username2, quit);
      if (!quit) {
        await this.gameHistoryService.uploadNewTime(GameMode.CLASSIQUE_1V1, duration, this.username, this.gameInfo.gameCardId as string);
      }
    }
  }

  endGameReset(winner: string) {
    this.cheatModeService.stopBlink();
    window.removeEventListener('keydown', this.keydownHandler);
    this.gameEnded = this.router.url !== '/replay';
    this.timer.stop();
    this.message = winner + ' a gagné la partie!';
    this.currentGameService.gameEnded(false);
  }

  keydownHandler = (event: KeyboardEvent): void => {
    if (event.key === 't') {
      this.cheat();
    }
  };

  cheat() {
    this.cheatMode = !this.cheatMode;
    this.onKeydown();
    this.replayService.addCheatModeEventReplay();
  }

  clickChat() {
    window.removeEventListener('keydown', this.keydownHandler);
  }

  closeChat() {
    window.addEventListener('keydown', this.keydownHandler);
  }

  ngOnDestroy(): void {
    this.cheatModeService.stopBlink();
    this.destroy$.next('destroy');
    this.destroy$.complete();
    window.removeEventListener('keydown', this.keydownHandler);
    this.counter.reset();
    this.counter2.reset();
    this.currentGameService.resetCount();
    this.replayService.stopTimer();
    this.timer.stop();
  }
}
