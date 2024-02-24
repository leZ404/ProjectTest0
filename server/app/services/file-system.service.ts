import { consts } from '@common/consts';
import { GameCardTemplate } from '@common/game-card-template';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { Service } from 'typedi';

@Service()
export class FileSystemService {

    async saveImage(path: string, data: string): Promise<string> {
        const id: string = randomUUID();
        return fs.promises
            .writeFile(`${path}/${id}.bmp`, data, { encoding: 'base64' })
            .then(() => {
                return id;
            })
            .catch(() => {
                return consts.EMPTY_ID;
            });
    }

    async getImage(id: string): Promise<string> {
        return fs.promises.readFile(`../server/assets/img/${id}.bmp`, { encoding: 'base64' });
    }

    async saveGameCard(gameCard: GameCardTemplate): Promise<void> {
        gameCard.id = randomUUID();
        const gameCards = await this.getGameCards();
        gameCards.push(gameCard);

        const newContent = JSON.stringify({ gameCards });

        fs.promises.writeFile('../server/assets/gameCards.json', newContent);
    }

    async deleteGameCard(id: string): Promise<void> {
        const gameCards = await this.getGameCards();
        const index = gameCards.findIndex((gameCard) => gameCard.id === id);
        if (index !== -1) {
            await fs.promises.unlink(`../server/assets/img/${gameCards[index].img1ID}.bmp`);
            await fs.promises.unlink(`../server/assets/img/${gameCards[index].img2ID}.bmp`);

            gameCards.splice(index, 1);
            const newContent = JSON.stringify({ gameCards });

            return fs.promises.writeFile('../server/assets/gameCards.json', newContent);
        }

        return Promise.reject(`Game card with id ${id} not found`);
    }

    async deleteAllGameCards(): Promise<void> {
        const gameCards = await this.getGameCards();
        for (let i = 0; i < gameCards.length; i++) {
            await fs.promises.unlink(`../server/assets/img/${gameCards[i].img1ID}.bmp`);
            await fs.promises.unlink(`../server/assets/img/${gameCards[i].img2ID}.bmp`);
        }

        const newContent = JSON.stringify({ gameCards: [] });

        return fs.promises.writeFile('../server/assets/gameCards.json', newContent);
    }

    async getGameCards(): Promise<GameCardTemplate[]> {
        return new Promise((resolve, reject) => {
            fs.promises.readFile('../server/assets/gameCards.json')
                .then((gameCards) => {
                    resolve(JSON.parse(gameCards.toString()).gameCards);
                })
                .catch(() => {
                    reject([]);
                });
        });
    }

    async getGameCardById(id: string): Promise<GameCardTemplate | undefined> {
        const gameCards = await this.getGameCards()
        return gameCards.find((gameCard) => gameCard.id === id);
    }

    async getGameCardsLength(): Promise<number> {
        const gameCards = await this.getGameCards();
        return gameCards.length;
    }
}
