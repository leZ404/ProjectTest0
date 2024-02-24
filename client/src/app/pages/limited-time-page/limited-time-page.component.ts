import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ChronometreComponent } from '@app/components/chronometre/chronometre.component';
import { CounterComponent } from '@app/components/counter/counter.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Difference } from '@app/interfaces/difference';
import { BlinkerService } from '@app/services/blinker.service';
import { CardQueueService } from '@app/services/card-queue.service';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';
import { GameHistoryService } from '@app/services/game-history.service';
import { GameInfoService } from '@app/services/game-info.service';
import { SocketService } from '@app/services/socket.service';
import { GameMode } from '@common/game-classes';

import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-limited-time-game-page',
    templateUrl: './limited-time-page.component.html',
    styleUrls: ['./limited-time-page.component.scss'],
    providers: [BlinkerService, CheatModeService, CardQueueService],
})
export class LimitedTimePageComponent {
    @ViewChild('canvas1') canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;

    @ViewChild('counter') counter: CounterComponent;
    @ViewChild('timer') timer: ChronometreComponent;
    @ViewChild('play1') play1: PlayAreaComponent;
    @ViewChild('play2') play2: PlayAreaComponent;


    isBlinking: boolean = false;
    pageLoaded: boolean = false;
    initialTime: Date;
    destroy$ = new Subject<any>();
    buttonTitle: string = 'Oui';
    message: string = 'Êtes-vous sûr de quitter la partie ?';
    wantToQuit: boolean = false;
    username = '';
    diff: Difference[] | undefined;
    originalImage: ImageBitmap;
    img1: ImageBitmap;
    img2: ImageBitmap;
    img1src: string;
    img2src: string;
    link1 = '';
    link2 = '';

    isDiff: boolean = false;
    gameEnded: boolean = false;
    cheatMode: boolean = false;
    isCoop: boolean = false;
    coopId: string = '';
    otherPlayerLeft: boolean = false;
    otherPlayerName: string = '';


    constructor(
        private gameInfo: GameInfoService,
        private differencesDetectionService: DifferencesDetectionService,
        private blinker: BlinkerService,
        private cheatModeService: CheatModeService,
        private socketService: SocketService,
        private cardQueueService: CardQueueService,
        private cdRef: ChangeDetectorRef,
        private gameHistoryService: GameHistoryService,
    ) {}
    ngAfterViewInit() {
        this.username = this.gameInfo.username;
        if (this.gameInfo.CoopUsername.length > 0) {
            this.gameInfo.isSolo = false;
            this.isCoop = true;
            this.username = this.gameInfo.CoopUsername[0] + ' et ' + this.gameInfo.CoopUsername[1];
            this.coopId = this.gameInfo.CoopId;
            if (this.gameInfo.CoopUsername[0] === this.gameInfo.username) {
                this.otherPlayerName = this.gameInfo.CoopUsername[1];
            }
            else {
                this.otherPlayerName = this.gameInfo.CoopUsername[0];
            }
        }


        this.cardQueueSetup();


        window.addEventListener('keydown', this.keydownHandler);
        const image = new Image();
        image.src = this.img1src;
        image.onload = () => {
            createImageBitmap(image).then((btmp) => {
                this.originalImage = btmp;
            });
        }

        this.socketService.listen('playerLeft').subscribe((x) => {
            this.username = this.gameInfo.username;
            this.gameInfo.CoopUsername = [];
            this.otherPlayerLeft = true;
            this.isCoop = false;

        });
        this.changeImage();
        this.defaultInit();
    }



    cardQueueSetup = () => {
        this.cardQueueService.getNext();
        this.cardQueueService.leftImageURL.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.link1 = x;

            if (this.link1 !== '' && this.link2 !== '') {
                this.changeImage();
            }

        });
        this.cardQueueService.rightImageURL.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.link2 = x

            if (this.link1 !== '' && this.link2 !== '') {
                this.changeImage();
            }

        });
        this.cardQueueService.leftImage.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.img1src = x
            this.changeImage();

        });
        this.cardQueueService.rightImage.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.img2src = x;
            this.changeImage();

        });

        this.cardQueueService.differences.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.diff = x
            this.differencesDetectionService.setDifference(this.diff);
        });
        this.differencesDetectionService.setDifference(this.diff);
        this.cardQueueService.gameEnded.subscribe(async (x) => {
            if (x) {
                await this.endGame(false);
            }
        });



    }





    defaultInit = () => {



        this.differencesDetectionService.resetFound();
        this.differencesDetectionService.resetCount();

        this.blinker.init(this.canvas1, this.canvas2);
        this.blinker.canvas1.pipe(takeUntil(this.destroy$)).pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.canvas1 = x;
            this.canvasToUrl(this.canvas1, this.canvas2);
        });
        this.blinker.isBlinking.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            this.isBlinking = x;
        });

        this.cheatModeService.init();
        this.cheatModeService.setBlinkerService(this.blinker);
        this.differencesDetectionService.found.pipe(takeUntil(this.destroy$)).subscribe((x) => {
            if (x) {
                this.counter.increase();

                if (this.pageLoaded) {
                    this.timer.addTime(this.gameInfo.timeAddedDifference);

                    this.cardQueueService.getNext();
                    this.playAudio();
                }
            }
        });
        this.counter.reset();

        if (this.gameInfo.initialTime > 120) {
            this.gameInfo.initialTime = 120;
        }
        this.timer.startCountDownFrom(this.gameInfo.initialTime);
        this.initialTime = new Date()
        this.pageLoaded = true;
    }


    async changeImage(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const image1 = new Image();
            image1.src = this.img1src;
            image1.onload = () => {
                createImageBitmap(image1).then((btmp) => {
                    this.img1 = btmp;
                });
                const image2 = new Image();
                image2.src = this.img2src;
                image2.onload = () => {
                    createImageBitmap(image2).then(async (btmp) => {
                        this.img2 = btmp;
                        const ctx1 = this.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                        const ctx2 = this.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                        ctx1.drawImage(this.img1, 0, 0, this.canvas1.nativeElement.width, this.canvas1.nativeElement.height);
                        ctx2.drawImage(this.img2, 0, 0, this.canvas2.nativeElement.width, this.canvas2.nativeElement.height);
                        resolve();

                    });
                };
            };
        });
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

        this.cdRef.detectChanges();
    }



    onContinue(eventData: { quit: boolean, message: string }) {
        this.wantToQuit = eventData.quit;
        if (eventData.quit && eventData.message === 'Êtes-vous sûr de quitter la partie ?') {
            this.endGame(true);
        }
    }

    playAudio() {
        const TIMEOUT = 1000;
        this.isDiff = true;
        setTimeout(() => {
            this.isDiff = false;
        }, TIMEOUT);
    }

    onKeydown() {
        if (this.cheatMode) {
            this.cheatModeService.startBlink();
        } else {
            this.cheatModeService.stopBlink();
        }
    }

    async endGame(quit: boolean): Promise<void> {
        this.cheatModeService.stopBlink();
        window.removeEventListener('keydown', this.keydownHandler);
        this.gameEnded = true;

        this.socketService.emit('leaveGame', null);

        this.message = (this.timer.minutes === 0 && this.timer.seconds === 0) ? 'Temps écoulé!' : 'Bravo vous avez complété toutes les fiches!';
        this.timer.stop();
        const gameMode = this.gameInfo.isSolo ? GameMode.TEMPS_LIMITE : GameMode.TEMPS_LIMITE_COOP;
        const duration = new Date().getTime() - this.initialTime.getTime();

        if (gameMode === GameMode.TEMPS_LIMITE || this.gameInfo.CoopUsername.length === 0) {
            await this.gameHistoryService.uploadHistory(gameMode, this.initialTime, duration, this.username, this.otherPlayerName, quit, this.otherPlayerLeft);
        }
        this.ngOnDestroy();
    }

    keydownHandler = (event: KeyboardEvent): void => {
        if (event.key === 't') {

            this.cheatMode = !this.cheatMode;
            this.onKeydown();
        }
    };

    ngOnDestroy(): void {
        this.cheatModeService.stopBlink();
        this.destroy$.next('destroy');
        this.destroy$.complete();
        window.removeEventListener('keydown', this.keydownHandler);


        this.socketService.emit('leaveGame', null);

    }
}
