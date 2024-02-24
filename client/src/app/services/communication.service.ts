import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { consts } from '@common/consts';
import { GameCardTemplate } from '@common/game-card-template';
import { Constants, GameEnded, NewTime } from '@common/game-classes';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = 'http://ec2-18-116-81-58.us-east-2.compute.amazonaws.com:3000';
    private readonly fileSystem: string = consts.FILE_SYSTEM;

    constructor(private readonly http: HttpClient) {

        console.log('communication service constructor');

    }

    uploadImage(img: string): Observable<HttpResponse<string>> {
        return this.http.post(
            `${this.baseUrl}/${this.fileSystem}/image`,
            { img },
            {
                observe: 'response',
                responseType: 'text',
            },
        );
    }

    downloadImage(id: string): Observable<HttpResponse<string>> {
        return this.http.get(`${this.baseUrl}/${this.fileSystem}/image?id=${id}`, { observe: 'response', responseType: 'text' });
    }

    uploadGameCard(gameCard: GameCardTemplate): Observable<HttpResponse<string>> {
        return this.http.post(
            `${this.baseUrl}/${this.fileSystem}/gameCard`,
            { gameCard },
            {
                observe: 'response',
                responseType: 'text',
            },
        );
    }

    downloadGameCards(): Observable<HttpResponse<object>> {
        return this.http.get(`${this.baseUrl}/${this.fileSystem}/gameCards`, { observe: 'response' });
    }

    deleteGameCard(id: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/${this.fileSystem}/gameCard?id=${id}`, { observe: 'response', responseType: 'text' });
    }

    deleteAllCards(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/${this.fileSystem}/gameCards`, { observe: 'response', responseType: 'text' });
    }

    addGameToHistory(gameEnded: GameEnded): Observable<HttpResponse<string>> {
        return this.http.post(
            `${this.baseUrl}/${this.fileSystem}/gameEnded`,
            { gameEnded },
            {
                observe: 'response',
                responseType: 'text',
            },
        );
    }

    getHistory(): Observable<HttpResponse<object>> {
        return this.http.get(`${this.baseUrl}/${this.fileSystem}/history`, { observe: 'response' });
    }

    deleteHistory(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/${this.fileSystem}/history`, { observe: 'response', responseType: 'text' });
    }

    setNewTime(newTime: NewTime): Observable<HttpResponse<string>> {
        return this.http.post(
            `${this.baseUrl}/${this.fileSystem}/newTime`,
            { newTime },
            {
                observe: 'response',
                responseType: 'text',
            },
        );
    }

    getBestTimes(gameCardId: string): Observable<HttpResponse<object>> {
        return this.http.get(`${this.baseUrl}/${this.fileSystem}/bestTimes?gameCardId=${gameCardId}`, { observe: 'response' });
    }

    resetBestTimes(gameCardId: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/${this.fileSystem}/bestTimes?gameCardId=${gameCardId}`, { observe: 'response', responseType: 'text' });
    }

    resetAllBestTimes(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/${this.fileSystem}/bestTimes/all`, { observe: 'response', responseType: 'text' });
    }

    getConstants(): Observable<HttpResponse<object>> {
        return this.http.get(`${this.baseUrl}/${this.fileSystem}/constants`, { observe: 'response' });
    }

    setConstants(constants: Constants): Observable<HttpResponse<string>> {
        return this.http.post(
            `${this.baseUrl}/${this.fileSystem}/constants`,
            { constants },
            {
                observe: 'response',
                responseType: 'text',
            },
        );
    }
}
