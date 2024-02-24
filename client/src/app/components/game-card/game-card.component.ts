import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { CommunicationService } from '@app/services/communication.service';
import { GameInfoService } from '@app/services/game-info.service';
import { ImageTransferService } from '@app/services/image-transfer.service';
import { SocketService } from '@app/services/socket.service';
import { consts } from '@common/consts';
import { Difficulty, GameCardTemplate } from '@common/game-card-template';
import { GameMode, NewTime } from '@common/game-classes';
import { Subject, takeUntil } from 'rxjs';
import { PopupTextComponent, StageLvl } from '../popup-text/popup-text.component';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit, OnDestroy {
    @Input() gameCard: GameCardTemplate;
    @Input() page: string;
    img1URL = '';
    img2URL = '';
    img1: string;
    img2: string;
    name: string;
    username: string;
    username2: string;
    timesSolo: NewTime[];
    times1v1: NewTime[];
    difficulty: Difficulty;
    isWaiting: boolean;
    isFull: boolean;
    destroy$ = new Subject<any>();

    constructor(
        private readonly dialogRef: MatDialog,
        private readonly router: Router,
        private readonly communication: CommunicationService,
        private imageTransfer: ImageTransferService,
        private gameInfo: GameInfoService,
        private socketService: SocketService
    ) {}

    ngOnInit() {
        if (this.gameCard.img1ID && this.gameCard.img2ID) {
            const response1 = this.communication.downloadImage(this.gameCard.img1ID);
            response1.pipe(takeUntil(this.destroy$)).subscribe((res) => {
                if (res.body) {
                    this.img1URL = `url(data:image/bmp;base64,${res.body})`;
                    this.img1 = `data:image/bmp;base64,${res.body}`;
                }
            });

            const response2 = this.communication.downloadImage(this.gameCard.img2ID);
            response2.pipe(takeUntil(this.destroy$)).subscribe((res) => {
                if (res.body) {
                    this.img2URL = `url(data:image/bmp;base64,${res.body})`;
                    this.img2 = `data:image/bmp;base64,${res.body}`;
                }
            });
        }
        this.name = this.gameCard.name;
        this.difficulty = this.gameCard.difficulty;

        this.configSockets();
        this.setBestTimes();
    }

    configSockets() {
        // to update button status creer/joindre
        this.socketService.listen('gameCardStatus').pipe(takeUntil(this.destroy$)).subscribe({
            next: (data: any) => {
                if (data.cardId && data.isWaiting !== null && data.isFull !== null && data.cardId === this.gameCard.id) {
                    this.isWaiting = data.isWaiting || data.isFull;
                    this.isFull = data.isFull;
                }
            },
        });

        this.socketService.listen('gameFull').pipe(takeUntil(this.destroy$)).subscribe({
            next: (data: any) => {
                if (data.cardId && data.cardId === this.gameCard.id) this.openDialogNotify('La partie est pleine');
            },
        });

        // if new game is instantiated then go to lobby
        this.socketService.listen('createdNewRoom').pipe(takeUntil(this.destroy$)).subscribe({
            next: async (data: any) => {
                if (data.cardId === this.gameCard.id) {
                    this.transferImage();
                    this.transferInfo(this.username);;

                    this.dialogRef.closeAll();
                    this.router.navigateByUrl('/lobby');
                }
            }
        });

        // the second player waits to be accepted and start the game
        this.socketService.listen('startGame').pipe(takeUntil(this.destroy$)).subscribe({
            next: (data: any) => {
                if (data.cardId === this.gameCard.id) {
                    this.dialogRef.closeAll();

                    this.name = data.gameName;

                    this.transferImage();
                    this.transferInfo(data.username, this.username);

                    this.router.navigateByUrl('/game1v1');
                }
            }
        });

        this.socketService.listen('abortGame').pipe(takeUntil(this.destroy$)).subscribe({
            next: (data: any) => {
                if (data.message && data.cardId && data.cardId === this.gameCard.id) {
                    this.openDialogNotify(data.message);
                    this.socketService.emit('leaveGame', null);
                }
            }
        });
        // initially get the game card status
        this.socketService.emit('askGameCardStatus', this.gameCard.id);
    }

    transferImage = () => {
        this.imageTransfer.link1 = this.img1URL;
        this.imageTransfer.link2 = this.img2URL;
        this.imageTransfer.img1 = this.img1;
        this.imageTransfer.img2 = this.img2;

        this.imageTransfer.diff = this.gameCard.differences;
    };

    transferInfo = (username: string, username2?: string) => {
        this.gameInfo.username = username;
        this.gameInfo.username2 = username2 ? username2 : '';
        this.gameInfo.isLeader = !username2;
        this.gameInfo.gameName = this.name;
        this.gameInfo.gameCardId = this.gameCard.id;
        this.gameInfo.difficulty = this.difficulty.valueOf();
        this.gameInfo.nDiff = this.gameCard.differences.length;
    };

    openDialogDeleteCard() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: `Supprimer le jeu <strong>${this.gameCard.name}</strong>?`,
                btnText: 'Non',
                btnText2: 'Oui',
            } as DialogData,
            this.deleteCardCallback,
        );
    }

    openDialogReinitCard() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: `Réinitialiser les meilleurs temps du jeu <strong>${this.gameCard.name}</strong>?`,
                btnText: 'Non',
                btnText2: 'Oui',
            } as DialogData,
            this.reinitCardCallback,
        );
    }

    openDialogEnterUsernameSolo = () => {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: 'Entrez votre nom de joueur',
                btnText: 'Commencer',
                stage: StageLvl.EnterName,
            } as DialogData,
            this.transfer,
        );
    }

    openDialogEnterUsernameDuo = () => {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: 'Entrez votre nom de joueur',
                btnText: 'Continuer',
                stage: StageLvl.EnterName,
            } as DialogData,
            this.joinGame,
        );
    }

    openDialogWrongName() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: 'Nom incorrect',
                btnText: 'Recommencer',
            } as DialogData,
            this.openDialogEnterUsernameDuo,
        );
    }

    openDialogWrongSolo() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: 'Nom incorrect',
                btnText: 'Recommencer',
            } as DialogData,
            this.openDialogEnterUsernameSolo,
        );
    }

    openDialogLoad() {
        return PopupTextComponent.openDialog(
            this.dialogRef,
            {
                btnText: 'Annuler',
                stage: StageLvl.Loading,
                preventClose: true,
            } as DialogData,
            this.leaveGame,
        );
    }

    openDialogNotify(message: string) {
        PopupTextComponent.openDialog(this.dialogRef, {
            message,
        } as DialogData);
    }

    joinGame = (feedback: DialogFeedback) => {
        if (!this.validateName(feedback.name)) {

            this.openDialogWrongName();

        } else {
            this.username = feedback.name;
            this.socketService.emit('joinGameClassic1v1', { gameCardId: this.gameCard.id, username: this.username });
            this.openDialogLoad();
        }
    };

    transfer = (feedback: DialogFeedback) => {
        if (!this.validateName(feedback.name)) {
            this.openDialogWrongSolo();
        } else {
            this.socketService.emit('joinGameSolo', { gameCardId: this.gameCard.id });
            this.transferImage();
            this.transferInfo(feedback.name);
            this.dialogRef.closeAll();
            this.router.navigateByUrl('/game');
        }
    }

    leaveGame = () => {
        this.dialogRef.closeAll();
        this.socketService.emit('leaveGame', null);
    }

    deleteCardCallback = (feedback: DialogFeedback) => {
        const res = feedback.event.target as HTMLButtonElement;
        if (res.innerHTML === 'Oui') this.deleteCard();
        this.dialogRef.closeAll();
    }

    reinitCardCallback = (feedback: DialogFeedback) => {
        const res = feedback.event.target as HTMLButtonElement;
        if (res.innerHTML === 'Oui') {
            this.communication.resetBestTimes(this.gameCard.id as string).pipe(takeUntil(this.destroy$)).subscribe((res) => {
                if (res.status === consts.HTTP_STATUS_OK) {
                    this.socketService.emit('bestTimesUpdate', {});
                }
            });
        }
        this.dialogRef.closeAll();
    }

    deleteCard() {
        if (this.gameCard && this.gameCard.id) {
            this.communication.deleteGameCard(this.gameCard.id).pipe(takeUntil(this.destroy$)).subscribe((res) => {
                if (res.status === consts.HTTP_STATUS_OK) {
                    this.socketService.emit('gameCardDeleted', { cardId: this.gameCard.id });
                    this.router.navigateByUrl('/').then(async () => this.router.navigate(['/config']));
                }
            });
        }
    }

    validateName(name: string) {
        return name && name.length > 0 && name.length < 10;
    }

    setBestTimes() {
        if (this.gameCard.id) {
            const res = this.communication.getBestTimes(this.gameCard.id);
            res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
                if (response && response.body) {
                    const result = response.body as NewTime[];
                    this.timesSolo = result.filter((time) => time.gameMode === GameMode.CLASSIQUE_SOLO).sort((a, b) => a.duration - b.duration);
                    this.times1v1 = result.filter((time) => time.gameMode === GameMode.CLASSIQUE_1V1).sort((a, b) => a.duration - b.duration);
                }
            });
        }
    }

    ngOnDestroy() {
        this.destroy$.next('destroy');
        this.destroy$.complete();
    }
}

