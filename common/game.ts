
import { randomUUID } from 'crypto';
import { GameCardTemplate } from "./game-card-template";
import { Player } from "./player";

export enum Status {
    WAITING_PLAYER,
    FULL,
    ACTIVE,
    ENDED,
}

export class Game {
    gameId: string; // = socket room id
    gameName: string;
    status: Status;
    gameCard: GameCardTemplate | undefined;
    counter1: number;
    counter2: number;
    private players: Player[];

    constructor() {
        this.gameId = randomUUID();
        this.status = Status.WAITING_PLAYER;
        this.counter1 = 0;
        this.counter2 = 0;
        this.players = [];
    }

    getPlayers() {
        return this.players;
    }

    addPlayer(player: Player) {
        if (this.players.length < 2) {
            this.players.push(player);
        } else {
            throw new Error(`Game is full, cannot add ${player.name} to game ${this.gameId}`);
        }
    }

    getPlayer(index: number) {
        return this.players[index];
    }

    popPlayer() {
        return this.players.pop();
    }

    resetCounters() {
        this.counter1 = 0;
        this.counter2 = 0;
    }

    updateStatus() {
        if (this.gameCard) {
            const threshold = Math.ceil(this.gameCard.differences.length / 2);

            if (this.counter1 >= threshold) {
                this.status = Status.ENDED;

                return { status: this.status, winner: this.getPlayer(0).name }


            } else if (this.counter2 >= threshold) {
                this.status = Status.ENDED;

                return { status: this.status, winner: this.getPlayer(1).name }

            }
        }

        return { status: Status.ACTIVE, winner: "" };
    }
}