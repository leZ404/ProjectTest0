import { Injectable } from '@angular/core';
import { Difference } from '@app/interfaces/difference';
import { GameCardTemplate } from '@common/game-card-template';
import { BehaviorSubject } from 'rxjs';
import { CommunicationService } from './communication.service';
import { GameInfoService } from './game-info.service';

@Injectable({
  providedIn: 'root'
})
export class CardQueueService {
  current: number;
  leftImageURL: BehaviorSubject<string>;
  rightImageURL: BehaviorSubject<string>;
  leftImage: BehaviorSubject<string>;
  rightImage: BehaviorSubject<string>;
  differences: BehaviorSubject<Difference[]>;
  gameEnded: BehaviorSubject<boolean>;
  cardOrder: number[];
  nGameCards: number;
  gameCards: GameCardTemplate[];

  constructor(private readonly communication: CommunicationService, private gameInfo: GameInfoService) {
    this.current = 0;
    this.leftImageURL = new BehaviorSubject<string>("");
    this.rightImageURL = new BehaviorSubject<string>("");
    this.leftImage = new BehaviorSubject<string>("");
    this.rightImage = new BehaviorSubject<string>("");
    this.differences = new BehaviorSubject<Difference[]>([]);
    this.gameEnded = new BehaviorSubject<boolean>(false);
    this.cardOrder = this.gameInfo.cardOrder;
    this.nGameCards = this.gameInfo.nGameCards;
    this.gameCards = this.gameInfo.gameCards;
  }

  async getNext(): Promise<void> {

    if (this.current >= this.nGameCards) {
      this.gameEnded.next(true);
      return;
    }

    const index = this.cardOrder[this.current];

    let next = this.gameCards[index];

    this.current++;

    await this.pullUrl(next.img1ID, next.img2ID);
    this.differences.next(next.differences);
    return;
  }

  async pullUrl(img1ID: string, img2ID: string): Promise<void> {
    const response1 = this.communication.downloadImage(img1ID);
    response1.subscribe((res: any) => {
      if (res.body) {
        this.leftImageURL.next(`url(data:image/bmp;base64,${res.body})`);
        this.leftImage.next(`data:image/bmp;base64,${res.body}`);
      }
    });

    const response2 = this.communication.downloadImage(img2ID);
    response2.subscribe((res: any) => {
      if (res.body) {
        this.rightImageURL.next(`url(data:image/bmp;base64,${res.body})`);
        this.rightImage.next(`data:image/bmp;base64,${res.body}`);
      }
    });
  }
};
