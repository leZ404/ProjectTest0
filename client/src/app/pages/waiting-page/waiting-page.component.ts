import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogData } from '@app/interfaces/dialog-data';
import { GameInfoService } from '@app/services/game-info.service';
import { SocketService } from '@app/services/socket.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-waiting-page',
  templateUrl: './waiting-page.component.html',
  styleUrls: ['./waiting-page.component.scss']
})
export class WaitingPageComponent implements OnInit, OnDestroy {

  gameName: string | undefined;
  player1Name: string;
  player2Name: string;
  gameClosed: boolean;
  destroy$: Subject<any>;

  constructor(
    private gameInfo: GameInfoService,
    private socketService: SocketService,
    private router: Router,
    private dialogRef: MatDialog
  ) {}

  ngOnInit(): void {
    this.player1Name = this.gameInfo.username;
    this.player2Name = '';
    this.gameName = this.gameInfo.gameName;
    this.gameClosed = false;
    this.destroy$ = new Subject<any>();
    this.configSockets();
  }

  ngOnDestroy(): void {
    if (!this.gameClosed) {
      this.socketService.emit('leaveGame', null);
    };
    this.destroy$.next('destroy');
    this.destroy$.complete();
  }

  configSockets(): void {
    this.socketService.listen('newPlayer').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.player2Name = data.username;
      },
    });

    this.socketService.listen('playerLeft').pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.player2Name = '';
      }
    });

    this.socketService.listen('abortGame').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        if (data.message) {
          this.gameClosed = true;
          this.openDialogNotify(data.message);
          this.socketService.emit('leaveGame', null);
          this.router.navigate(['/selecto']);
        }
      }
    });
  }

  startGame(): void {
    if (this.player2Name && this.player1Name) {
      this.socketService.emit('startGame', { gameName: this.gameName });

      this.gameInfo.username2 = this.player2Name;

      this.gameClosed = true;
      this.router.navigate(['/game1v1']);
    }
  }

  rejectPlayer() {
    this.socketService.emit('rejectPlayer', null);
    this.player2Name = '';
  }

  setName(event: Event) {
    const target = event.target as HTMLInputElement;
    this.gameName = target.value;
  }

  openDialogNotify(message: string) {
    PopupTextComponent.openDialog(this.dialogRef, {
      message,
    } as DialogData);
  }
}
