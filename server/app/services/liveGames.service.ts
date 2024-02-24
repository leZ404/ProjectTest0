import { Game, Status } from '@common/game';
import { Service } from 'typedi';

@Service()
export class LiveGamesService {

    LiveGamesService() {};
    current: Game[] = [];

    add(game: Game) {
        this.current.push(game);
    }

    getPlayers(gameId: string) {
        const game = this.getGameById(gameId);
        return game?.getPlayers();
    }
    removeGame(gameId: string) {
        this.current = this.current.filter((e) => { e.gameId != gameId });
    }

    updateStatus(gameId: string) {
        const game = this.getGameById(gameId) as Game;
        if (game) return game.updateStatus();

        return { status: Status.ACTIVE, winner: "" };
    }

    incrementCounter(gameId: string, playerId: string) {

        const game = this.getGameById(gameId);

        if (game) {


            if (game.getPlayer(0).id === playerId) {
                game.counter1++;

            } else if (game.getPlayer(1).id === playerId) {
                game.counter2++;

            } else {
                console.log("player not found");
            }
        }
    }
    getGameById(gameId: string): Game | undefined {
        return this.current.find((game: Game) => game.gameId === gameId);
    }


}
