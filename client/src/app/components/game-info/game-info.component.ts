import { Component, OnInit } from '@angular/core';
import { GameInfoService } from '@app/services/game-info.service';

@Component({
    selector: 'app-game-info',
    templateUrl: './game-info.component.html',
    styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent implements OnInit {
    gameName: string | undefined;
    difficulty: string | undefined;
    nDiff: number | undefined;

    constructor(private gameInfo: GameInfoService) {}

    ngOnInit(): void {
        this.gameName = this.gameInfo.gameName;
        this.difficulty = this.gameInfo.difficulty;
        this.nDiff = this.gameInfo.nDiff;
    }
}
