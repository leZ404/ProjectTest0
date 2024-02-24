import { Game, Status } from '@common/game';
import { Game1v1 } from '@common/game-1v1';
import { GameCoop } from '@common/game-coop';
import { GameSolo } from '@common/game-solo';
import { Player } from '@common/player';
import { Service } from 'typedi';
import { FileSystemService } from './file-system.service';
import { LiveGamesService } from './liveGames.service';

@Service()
export class GamesManagerService {

    private gamesSolo: Game[];
    private games1v1: Game[];
    private gamesCoop: Game[];

    constructor(private liveGamesService: LiveGamesService, private fileSystemService: FileSystemService) {
        this.gamesSolo = [];
        this.games1v1 = [];
        this.gamesCoop = [];
    }

    getLiveGamesService() {
        return this.liveGamesService;
    }

    async createNewGame(player: Player, game: Game, gameCardId?: string): Promise<Game> {
        game.addPlayer(player);
        if (gameCardId) game.gameCard = await this.fileSystemService.getGameCardById(gameCardId);
        game.status = Status.WAITING_PLAYER;
        return game;
    }

    async joinGameSolo(gameCardId: string, player: Player): Promise<string> {
        const game = await this.createNewGame(player, new GameSolo(), gameCardId);
        game.status = Status.ACTIVE;
        this.gamesSolo.push(game);
        return game.gameId;
    }

    async joinGameClassic1v1(gameCardId: string, player: Player): Promise<object> {
        let game = this.getWaitingByGameCardId(gameCardId);
        if (game) {
            game.addPlayer(player);
            game.status = Status.FULL;
        } else {
            game = await this.createNewGame(player, new Game1v1(), gameCardId);
            this.games1v1.push(game);
        }
        return { id: game.gameId, status: game.status };
    }

    async joinGameCoop(player: Player): Promise<object> {
        let game = this.getWaitingCoop();
        if (game) {
            game.addPlayer(player);
            game.status = Status.ACTIVE;
        } else {
            game = await this.createNewGame(player, new GameCoop());
            this.gamesCoop.push(game);
        }
        return { id: game.gameId, status: game.status };
    }

    deleteGameById(gameId: string) {
        this.gamesSolo = this.gamesSolo.filter((e) => { e.gameId != gameId });
        this.games1v1 = this.games1v1.filter((e) => { e.gameId != gameId });
        this.gamesCoop = this.gamesCoop.filter((e) => { e.gameId != gameId });
    }

    endGame(gameId: string) {
        let game = this.getGameById(gameId);
        if (game) {
            game.status = Status.ENDED;
            this.liveGamesService.removeGame(gameId);
            game.resetCounters();
        }
    }

    getSoloById(gameId: string): Game | undefined {
        return this.gamesSolo.find((game: Game) => game.gameId === gameId);
    }

    get1v1ById(gameId: string): Game | undefined {
        return this.games1v1.find((game: Game) => game.gameId === gameId);
    }

    getCoopById(gameId: string): Game | undefined {
        return this.gamesCoop.find((game: Game) => game.gameId === gameId);
    }

    getGameById(gameId: string): Game | undefined {
        let game = this.get1v1ById(gameId);
        if (!game) game = this.getCoopById(gameId);
        if (!game) game = this.getSoloById(gameId);

        return game;
    }

    getAllGames(): Game[] {
        return [...this.gamesSolo, ...this.games1v1, ...this.gamesCoop];
    }

    getWaitingCoop(): Game | undefined {
        return this.gamesCoop.find((game) => game.status === Status.WAITING_PLAYER);
    }

    getGamesByGameCardId(gameCardId: string): Game[] {
        return this.games1v1.filter((game: Game) => game.gameCard && game.gameCard.id === gameCardId);
    }

    getAllWaitingByGameCardId(gameCardId: string): Game[] {
        return this.games1v1.filter((game) => game.gameCard && game.gameCard.id === gameCardId && game.status === Status.WAITING_PLAYER);
    }

    getAllFullByGameCardId(gameCardId: string): Game[] {
        return this.games1v1.filter((game) => game.gameCard && game.gameCard.id === gameCardId && game.status === Status.FULL);
    }

    getWaitingByGameCardId(gameCardId: string): Game | undefined {
        const game = this.getAllWaitingByGameCardId(gameCardId);
        return game ? game[0] : undefined;
    }

    getFullByGameCardId(gameCardId: string): Game | undefined {
        const game = this.getAllFullByGameCardId(gameCardId);
        return game ? game[0] : undefined;
    }

    getWaitingById(gameId: string): Game | undefined {
        const game = this.getGameById(gameId);
        return game && game.status === Status.WAITING_PLAYER ? game : undefined;
    }

    getFullById(gameId: string): Game | undefined {
        const game = this.get1v1ById(gameId);
        return game && game.status === Status.FULL ? game : undefined;
    }

    getStartedById(gameId: string): Game | undefined {
        const game = this.get1v1ById(gameId);
        return game && game.status === Status.ACTIVE ? game : undefined;
    }

    isWaitingGameCard(gameCardId: string): boolean {
        const game = this.getWaitingByGameCardId(gameCardId);
        return game !== undefined;
    }

    isFullGameCard(gameCardId: string): boolean {
        const game = this.getFullByGameCardId(gameCardId);
        return game !== undefined;
    }

    isWaitingGame(gameId: string): boolean {
        const game = this.getWaitingById(gameId);
        return game !== undefined;
    }

    isCreator(gameId: string, playerId: string): boolean {
        const game = this.getGameById(gameId);
        return game !== undefined && game.getPlayers()[0].id === playerId;
    }

    leaveGame(gameId: string, playerId: string) {

        const game = this.getGameById(gameId);
        if (game) {
            if (this.isCreator(gameId, playerId)) {
                this.endGame(gameId);
            } else {
                this.rejectPlayer(gameId);
            }
        }
    }

    rejectPlayer(gameId: string) {
        const game = this.getFullById(gameId);
        if (game) {
            game.popPlayer();
            game.status = Status.WAITING_PLAYER;
        }
    }

    startGame(gameId: string) {

        const game = this.getGameById(gameId);

        if (game) {
            game.status = Status.ACTIVE;
            this.liveGamesService.add(game);

        }
    }
}