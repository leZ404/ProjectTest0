import { Injectable, OnDestroy } from '@angular/core';
import { Difference } from '@app/interfaces/difference';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ReplayService } from './replay.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentGameService implements OnDestroy {
  currentPlayerCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  currentPlayerName: string = '';
  otherPlayerCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  otherPlayerName: string = '';
  diffArray: BehaviorSubject<Difference[] | undefined> = new BehaviorSubject<Difference[] | undefined>([]);
  endGame: BehaviorSubject<boolean[]> = new BehaviorSubject<boolean[]>([false, false]);
  winner: BehaviorSubject<string> = new BehaviorSubject<string>('');
  leader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  destroy$ = new Subject<any>();

  constructor(private socketService: SocketService, private replayService: ReplayService) {
    this.socketService.listen("leader").pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.leader.next(true);
    });
    this.socketService.listen("diffFound").pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        if (!res.other) {
          this.increment();
        } else {
          this.incrementOther();
          this.replayService.addClickEventReplay({ x: res.coords.x, y: res.coords.y });
        }
        this.replayService.addCounterEventReplay(res.other);
      }
    });
    this.socketService.listen("End").pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.winner.next(res);
        this.endGame.next([true, false]);
      }
    });

    this.socketService.listen("otherPlayerQuit").pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.winner.next(this.currentPlayerName);
      this.endGame.next([true, true]);
    });
  }

  ngOnDestroy() {
    this.destroy$.next('destroy');
    this.destroy$.complete();
  }

  init(currentPlayerName: string, otherPlayerName: string): void {
    this.currentPlayerName = currentPlayerName;
    this.otherPlayerName = otherPlayerName;
  }

  increment() {
    this.currentPlayerCount.next(this.currentPlayerCount.value + 1);
  }
  incrementOther() {
    this.otherPlayerCount.next(this.otherPlayerCount.value + 1);
  }

  resetCount(): void {
    this.currentPlayerCount.next(0);
    this.otherPlayerCount.next(0);
  }

  gameEnded(quit: boolean): void {
    this.replayService.addEndGameEventReplay();
    this.socketService.emit("gameEnded", { quit });
  }

}
