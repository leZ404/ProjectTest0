import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupTextComponent, StageLvl } from '@app/components/popup-text/popup-text.component';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { CommunicationService } from '@app/services/communication.service';
import { GameConstantsService } from '@app/services/game-constants.service';
import { GameInfoService } from '@app/services/game-info.service';
import { SocketService } from '@app/services/socket.service';
import { GameCardTemplate } from '@common/game-card-template';

@Component({
  selector: 'app-limited-selecto',
  templateUrl: './limited-selecto.component.html',
  styleUrls: ['./limited-selecto.component.scss']
})
export class LimitedSelectoComponent {
  cardOrder: number[] = [];
  nGameCards: number;
  gameCards: GameCardTemplate[];
  constants: any;

  constructor(private readonly dialogRef: MatDialog, private readonly router: Router, private gameInfo: GameInfoService, private socketService: SocketService, private readonly communication: CommunicationService, private gameConstants: GameConstantsService) {
    this.configSockets()

    this.socketService.listen("orderSent").subscribe((res: any) => {
      if (res) {
        this.cardOrder = res.order;
      }
    });
    this.communication.downloadGameCards().subscribe((res: any) => {
      this.gameCards = res.body as GameCardTemplate[];
      this.nGameCards = this.gameCards.length;
    });
  }

  configSockets() {
    // the second player waits to be accepted and start the game
    this.socketService.listen('startGameCoop').subscribe({
      next: (data: any) => {
        this.dialogRef.closeAll();
        this.gameInfo.CoopUsername = [];

        this.gameInfo.CoopUsername.push(data.username1);
        this.gameInfo.CoopUsername.push(data.username2);
        this.gameInfo.gameCards = this.gameCards;
        this.gameInfo.nGameCards = this.nGameCards;
        this.gameInfo.cardOrder = data.order;
        this.gameInfo.CoopId = data.id;

        this.router.navigateByUrl('/limited-time');
      }
    });
  }

  openDialogEnterUsernameSolo = () => {
    PopupTextComponent.openDialog(
      this.dialogRef,
      {
        message: 'Entrez votre nom de joueur',
        btnText: 'Commencer',
        stage: StageLvl.EnterName,
      } as DialogData,
      this.startGameSolo,
    );
  }

  startGameSolo = async (feedback: DialogFeedback) => {
    if (!this.validateName(feedback.name)) {
      this.openDialogWrongSolo();
    } else {
      this.gameInfo.username = feedback.name;
      this.gameInfo.CoopUsername = [];

      this.dialogRef.closeAll();
      this.socketService.emit('startGameSolo', { username: feedback.name });
      if (!this.gameCards) {
        await this.downloadCards();
      }

      if (this.cardOrder.length == 0) {
        await this.getOrder();
      }
      this.constants = await this.gameConstants.getConstants();
      this.gameInfo.initialTime = this.constants.initialTime;
      this.gameInfo.gameCards = this.gameCards;
      this.gameInfo.nGameCards = this.nGameCards;
      this.gameInfo.cardOrder = this.cardOrder;
      this.gameInfo.timeAddedDifference = this.constants.timeWon;

      this.router.navigate(['/limited-time']);
    }
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

  joinGame = async (feedback: DialogFeedback) => {
    if (!this.validateName(feedback.name)) {
      this.openDialogWrongName();
    } else {
      this.constants = await this.gameConstants.getConstants();
      this.gameInfo.initialTime = this.constants.initialTime;
      this.socketService.emit('joinGameCoop', { username: feedback.name });
      this.gameInfo.username = feedback.name;
      this.gameInfo.timeAddedDifference = this.constants.timeWon;
      this.openDialogLoad();
    }
  }

  validateName(name: string) {
    return name && name.length > 0 && name.length < 10;
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
    PopupTextComponent.openDialog(
      this.dialogRef,
      {
        message: 'En attente d\'un autre joueur',
        btnText: 'Annuler',
        stage: StageLvl.Loading,
        preventClose: true,
      } as DialogData,
      this.leaveGame,
    );
  }

  leaveGame = () => {
    this.dialogRef.closeAll();
    this.socketService.emit('leaveGame', null);
  }

  async downloadCards() {
    return new Promise<void>((resolve) => {
      this.communication.downloadGameCards().subscribe((res: any) => {
        this.gameCards = res.body as GameCardTemplate[];
        this.nGameCards = this.gameCards.length;
        resolve();

      });
    });
  }

  async getOrder() {
    return new Promise<void>((resolve) => {
      this.socketService.listen("orderSent").subscribe((res: any) => {
        if (res) {
          this.cardOrder = res.order;
          resolve();
        }
      });
    });
  }
};
