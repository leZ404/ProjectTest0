import { Injectable } from '@angular/core';
import { GameCardTemplate } from '@common/game-card-template';

@Injectable({
    providedIn: 'root',
})
export class GameInfoService {
    username = '';
    username2 = '';
    gameName: string | undefined = '';
    gameCardId: string | undefined = '';
    difficulty: string | undefined = '';
    nDiff: number | undefined = 0;
    isSolo: boolean | undefined = true;
    isLeader: boolean = false;
    time: number | undefined = 0;
    CoopUsername: string[] = [];
    gameCards: GameCardTemplate[] = [];
    nGameCards: number = 0;
    cardOrder: number[] = [];
    CoopId: string = '';
    initialTime: number = 0;
    timeAddedDifference: number = 0;

}
