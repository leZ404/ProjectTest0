import { Chat } from '@common/chat';
import { Constants, GameEnded, GameMode, NewTime } from '@common/game-classes';
import { Message } from '@common/message';
import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';
import { MessengerService } from './messenger.service';

@Service()
export class DatabaseService {
    private uri = 'mongodb+srv://logdeuxneufneufzeroequipedeuxc:LC3EwlaWUaFVuPZ2@cluster0.p9aptjl.mongodb.net/?retryWrites=true&w=majority';
    private client = new MongoClient(this.uri);
    private DATABASE_NAME = '7Differences';
    private database: Db = this.client.db(this.DATABASE_NAME);
    private HISTORY_COLLECTION = 'history';
    private BEST_TIME_COLLECTION = 'bestTime';
    private CONSTANTS_COLLECTION = 'constant';
    private CHAT_COLLECTION = 'chat';

    constructor(private messengerService: MessengerService) {}

    async start(): Promise<void> {

        try {
            await this.client.connect();
        } catch {
            throw new Error("Database connection error");
        }

    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    async getChatList(): Promise<Chat[]> {
        const collection = this.database.collection(this.CHAT_COLLECTION);
        const chatList = await collection.find({}).toArray();
        return chatList.map((chat) => ({
            name: chat.name,
            history: chat.history,
            creatorName: chat.creatorName,
        }));
    }

    async createChat(chat: Chat): Promise<void> {
        const collection = this.database.collection(this.CHAT_COLLECTION);
        await collection.insertOne({
            name: chat.name,
            history: chat.history,
            creatorName: chat.creatorName,
        });
    }

    async updateChatHistory(message: Message, chatName: string): Promise<void> {
        const collection = this.database.collection(this.CHAT_COLLECTION);
        console.log('calling from updatedhistory db', chatName);
        const chat = await collection.find({ name: chatName }).toArray();
        console.log('chat before', chat[0]);

        if (!chat[0].history) {
            chat[0].history = [];
        }
        console.log('chat history db', chat[0].history);

        chat[0].history.push(message);
        console.log('chat', chat[0]);
        await collection.replaceOne({ name: chatName }, chat[0]);
    }


    async getSingleChat(chatName: string): Promise<Chat> {
        const collection = this.database.collection(this.CHAT_COLLECTION);
        const chat = await collection.find({ name: chatName }).toArray();
        return chat.map((chat) => ({
            name: chat.name,
            history: chat.history,
            creatorName: chat.creatorName,
        }))[0];
    }
    //OLD Server
    async saveGameToHistory(gameEnded: GameEnded) {
        const collection = this.database.collection(this.HISTORY_COLLECTION);
        await collection.insertOne({
            startDate: gameEnded.startDate,
            duration: gameEnded.duration,
            gameMode: gameEnded.gameMode,
            player1: gameEnded.player1,
            player2: gameEnded.player2,
            quit: gameEnded.quit,
            quitCoop: gameEnded.quitCoop,
        });
    }

    async getHistory(): Promise<GameEnded[]> {
        const collection = this.database.collection(this.HISTORY_COLLECTION);
        const games = await collection.find({}).toArray();
        return games.map((game) => ({
            startDate: game.startDate,
            duration: game.duration,
            gameMode: game.gameMode,
            player1: game.player1,
            player2: game.player2,
            quit: game.quit,
            quitCoop: game.quitCoop,
        }));
    }

    async deleteHistory(): Promise<void> {
        const collection = this.database.collection(this.HISTORY_COLLECTION);
        await collection.deleteMany({});
    }

    async setNewTime(newTime: NewTime): Promise<boolean> {
        const bestTimesAll = await this.getBestTimes(newTime.gameCardId);
        if (bestTimesAll.length != 6) {
            return false;
        }
        const bestTimes = bestTimesAll.filter((time) => time.gameMode === newTime.gameMode).sort((a, b) => b.duration - a.duration);
        const isBestTime = bestTimes && bestTimes[0] && newTime.duration < bestTimes[0].duration;
        if (isBestTime && bestTimes.length === 3) {
            await this.database.collection(this.BEST_TIME_COLLECTION).replaceOne(
                { gameCardId: newTime.gameCardId, duration: bestTimes[0].duration, gameMode: newTime.gameMode },
                {
                    duration: newTime.duration,
                    gameMode: newTime.gameMode,
                    player: newTime.player,
                    gameCardId: newTime.gameCardId,
                },
            );
            let pos = 3;
            while (pos > 0 && newTime.duration > bestTimes[--pos].duration);
            this.messengerService.sendGlobalMessage(newTime, pos);
        }
        return isBestTime;
    }

    async getBestTimes(gameCardId: string): Promise<NewTime[]> {
        const collection = this.database.collection(this.BEST_TIME_COLLECTION);
        const games = await collection.find({ gameCardId: gameCardId }).toArray();
        return games.map((game) => ({
            gameMode: game.gameMode,
            duration: game.duration,
            player: game.player,
            gameCardId: game.gameCardId,
        })) as NewTime[];
    }

    async setMockData(gameCardId: string, gameMode: GameMode) {
        const collection = this.database.collection(this.BEST_TIME_COLLECTION);
        await collection.insertMany([
            {
                duration: 30000,
                gameMode,
                player: 'Booba',
                gameCardId,
            },
            {
                duration: 40000,
                gameMode,
                player: 'Kaaris',
                gameCardId,
            },
            {
                duration: 50000,
                gameMode,
                player: 'Jul',
                gameCardId,
            },
        ]);
    }

    async deleteBestTimes(gameCardId: string) {
        const collection = this.database.collection(this.BEST_TIME_COLLECTION);
        await collection.deleteMany({ gameCardId });
    }

    async deleteAllBestTimes() {
        const collection = this.database.collection(this.BEST_TIME_COLLECTION);
        await collection.deleteMany({});
    }

    async resetBestTimes(gameCardId: string) {
        // à améliorer
        await this.deleteBestTimes(gameCardId);
        await this.setMockData(gameCardId, GameMode.CLASSIQUE_SOLO);
        await this.setMockData(gameCardId, GameMode.CLASSIQUE_1V1);
    }

    async resetAllBestTimes(gamesId: string[]) {
        // à améliorer
        for (const gameCardId of gamesId) {
            await this.resetBestTimes(gameCardId);
        }
    }

    async getConstants(): Promise<Constants> {
        const collection = this.database.collection(this.CONSTANTS_COLLECTION);
        const constants = await collection.findOne({});
        if (constants) {
            return {
                initialTime: constants.initialTime,
                penalty: constants.penalty,
                timeWon: constants.timeWon,
            } as Constants;
        } else {
            return {} as Constants;
        }
    }

    async setConstants(constants: Constants): Promise<void> {
        console.log(constants);
        const collection = this.database.collection(this.CONSTANTS_COLLECTION);
        await collection.replaceOne({}, constants, { upsert: true });
    }
}
