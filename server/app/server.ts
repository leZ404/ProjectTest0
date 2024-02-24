import { Application } from '@app/app';
import { Game, Status } from '@common/game';
import { GameCardTemplate } from '@common/game-card-template';
import { Message } from '@common/message';
import { Player } from '@common/player';
import { Vec2 } from '@common/vec2';
import { randomUUID } from 'crypto';
import * as http from 'http';
import { AddressInfo } from 'net';

import { Chat } from '@common/chat';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { DatabaseService } from './services/database.service';
import { FileSystemService } from './services/file-system.service';
import { GamesManagerService } from './services/games-manager.service';
import { MessengerService } from './services/messenger.service';
import { OrderGeneratorService } from './services/orderGenerator.service';
import { ValidationService } from './services/validation.service';

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly baseDix: number = 10;
    private server: http.Server;

    private io: any;

    private liveGamesService;

    constructor(
        private readonly application: Application,
        private readonly validationService: ValidationService,
        private readonly gamesManager: GamesManagerService,
        private messengerService: MessengerService,
        private orderGenerator: OrderGeneratorService,
        private fileService: FileSystemService,
        private databaseService: DatabaseService
    ) {
        this.liveGamesService = this.gamesManager.getLiveGamesService();
    }

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }
    init(): void {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);

        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());

        /// SOCKET
        console.log('init socket 1');
        this.io = new io.Server(this.server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        console.log('init socket 2');
        this.messengerService.init(this.io);

        console.log('init socket 3');

        this.handleSockets();
        console.log('init socket 4');

        this.server.listen(Server.appPort);
        console.log('init socket 5');

    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                // eslint-disable-next-line no-console
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                // eslint-disable-next-line no-console
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        // eslint-disable-next-line no-console
        console.log(`Listening on ${bind}`);
    }

    handleSockets(): void {
        this.io.on('connection', (socket: io.Socket) => {
            console.log('connected io');
            socket.emit('connected', { message: socket.id });

            socket.on('disconnect', () => {
                // logout
            });

            socket.on('updateChatHistory', (data) => {
                const message = {
                    body: data.body,
                    sender: data.sender,
                    senderType: data.senderType,
                    time: data.time

                } as Message;
                const chatName = data.chatName as string;
                if (message) {
                    console.log('message', message.sender);
                    console.log('message :', message);
                    console.log('channelName from server:', chatName);
                    this.databaseService.updateChatHistory(message, chatName).then(() => {
                        this.databaseService.getSingleChat(chatName).then((chat) => {
                            this.io.emit('updatedHistory', chat.history); //here change msg qdded history
                        });
                    });
                }
            });

            socket.on('getChatList', () => {
                console.log('getChatList from server');
                this.sendUpdatedChatList(socket);
            });

            socket.on('createChat', (data) => {
                const chat = data as Chat;
                if (chat) {
                    console.log('chat added', chat);

                    this.databaseService.createChat(chat).then(() => {
                        this.sendUpdatedChatList(socket);
                    });

                }
            });

            socket.on('getChatHistory', (chatName) => {
                this.databaseService.getSingleChat(chatName).then((chat) => {
                    this.io.emit('updatedHistory', chat.history);
                    console.log('getChatHisory server:', chat);
                });
            });
            //Old server
            socket.on('askGameCardStatus', (id) => {
                const isWaiting = id !== undefined && this.gamesManager.isWaitingGameCard(id);
                const isFull = id !== undefined && this.gamesManager.isFullGameCard(id);
                socket.emit('gameCardStatus', { cardId: id, isWaiting, isFull });
            });

            socket.on('click', (data) => {
                const gameId = this.getSocketRoom(socket);
                const players = this.liveGamesService.getPlayers(gameId);
                const player = players?.find((p: Player) => p.id === socket.id);
                const result = this.validationService.validate(data);
                socket.emit('validation', result);
                if (result.validation) {
                    socket.to(gameId).emit('validation', result);
                    this.liveGamesService.incrementCounter(gameId, socket.id);
                    if (players) {
                        const coords = data.pos as Vec2;
                        this.io.to(players[0].id).emit("diffFound", { other: socket.id !== players[0].id, coords });
                        this.io.to(players[1].id).emit("diffFound", { other: socket.id === players[0].id, coords });
                    }

                    let message = `Différence trouvée` + (player?.name ? ` par ${player.name}` : '') + '.';
                    this.io.to(gameId).emit("newMessage", new Message(message));

                    const stat = this.liveGamesService.updateStatus(gameId);
                    if (stat.status === Status.ENDED) {

                        this.io.in(gameId).emit("End", stat.winner);
                    }
                } else {
                    let message = `Erreur` + (player?.name ? ` par ${player.name}` : '') + '.';
                    this.io.to(gameId).emit("newMessage", new Message(message));
                }
            });

            socket.on('joinGameSolo', (data: any) => {
                socket.join(randomUUID());
            });

            /**
             * @param data { gameCardId, username }
             */
            socket.on('joinGameClassic1v1', async (data) => {

                if (data.gameCardId && data.username) {
                    if (!this.gamesManager.isFullGameCard(data.gameCardId)) {
                        const player = new Player(socket.id, data.username); // init new player

                        const gameRes = await this.gamesManager.joinGameClassic1v1(data.gameCardId, player) as { id: string, status: Status };   // join or create game

                        socket.join(gameRes.id);    // player join room

                        if (gameRes.status === Status.WAITING_PLAYER) {
                            socket.emit('createdNewRoom', { cardId: data.gameCardId }); // inform player that he created a room
                        } else {
                            socket.to(gameRes.id).emit('newPlayer', { username: player.name });   // inform creator that a new player joined
                        }

                        this.updateButtonStatus(gameRes.id);    // update all buttons creer/joindre
                    } else {
                        socket.emit('gameFull', { cardId: data.gameCardId }); // inform player that no game is available
                    }
                }
            });

            socket.on('joinGameCoop', async (data: any) => {

                if (data.username) {
                    const gameId = this.getSocketRoom(socket);


                    if (gameId) {

                        socket.leave(gameId);
                    }
                    const player = new Player(socket.id, data.username); // init new player
                    const gameRes = await this.gamesManager.joinGameCoop(player) as { id: string, status: Status };   // join or create game

                    socket.join(gameRes.id);    // player join room

                    if (gameRes.status === Status.ACTIVE) {
                        const players = this.gamesManager.getCoopById(gameRes.id)?.getPlayers() as Player[];
                        const length = await this.fileService.getGameCardsLength();

                        const cardOrder = this.orderGenerator.generateOrder(length);

                        this.io.to(gameRes.id).emit('startGameCoop', { username1: players[0].name, username2: players[1].name, order: cardOrder, id: gameRes.id }); // start game
                    }
                }
            });

            socket.on('startGameSolo', async (data: any) => {

                const length = await this.fileService.getGameCardsLength();

                const cardOrder = this.orderGenerator.generateOrder(length);

                this.io.to(socket.id).emit('orderSent', { order: cardOrder });

            });

            socket.on('rejectPlayer', () => {
                const gameId = this.getSocketRoom(socket);


                const game = this.gamesManager.get1v1ById(gameId);

                const message = 'Vous avez été refusé';

                socket.to(gameId).emit('abortGame', { cardId: game?.gameCard?.id, message });    // inform the rejected player

                this.updateButtonStatus(gameId);    // update all buttons creer/joindre
            });

            socket.on('startGame', (data: any) => {

                const gameId = this.getSocketRoom(socket);
                const game = this.gamesManager.get1v1ById(gameId);

                this.gamesManager.startGame(gameId);
                socket.to(gameId).emit('startGame');

                socket.to(gameId).emit('startGame',
                    { cardId: game?.gameCard?.id, gameName: data.gameName, username: game?.getPlayers()[0].name });    // inform the other player to start

                if (game) {

                    this.io.to(game.getPlayer(0).id).emit("leader"); //inform game leader
                }

                this.updateButtonStatus(gameId);    // update all buttons creer/joindre
            });

            socket.on('leaveGame', () => {

                const gameId = this.getSocketRoom(socket);


                if (gameId) {

                    socket.leave(gameId);
                    const game = this.gamesManager.get1v1ById(gameId);
                    const gameCard = game?.gameCard;
                    const isCreator = this.gamesManager.isCreator(gameId, socket.id);

                    const coopGame = this.gamesManager.getCoopById(gameId);

                    if (isCreator && !coopGame) {
                        const message = 'L\'hôte a quitté la partie';
                        socket.to(gameId).emit('abortGame', { cardId: gameCard?.id, message }); // notify player that creator left
                    } else {
                        socket.to(gameId).emit('playerLeft', { id: gameId }); // notify creator that player left

                    }

                    this.gamesManager.leaveGame(gameId, socket.id);


                    this.updateButtonStatus(gameId);    // update all buttons creer/joindre
                }
            });

            socket.on('gameEnded', (data: any) => {
                const gameId = this.getSocketRoom(socket);
                if (gameId) {
                    if (data.quit) {
                        const player = this.liveGamesService.getPlayers(gameId)?.find((p: Player) => p.id === socket.id);
                        const message = `${player?.name} a abandonné la partie.`;
                        socket.to(gameId).emit("newMessage", new Message(message));
                        socket.to(gameId).emit('otherPlayerQuit');
                    }
                    socket.leave(gameId);
                    this.gamesManager.leaveGame(gameId, socket.id);
                    this.gamesManager.endGame(gameId);
                }
            });

            socket.on('gameCardsModified', () => {
                this.io.emit('gameCardsModified');
            });

            socket.on('gameCardDeleted', (data: any) => {
                if (data.cardId) {
                    const message = 'La fiche de jeu a été supprimée';
                    const games = this.gamesManager.getGamesByGameCardId(data.cardId);
                    games?.forEach((game: Game) => {
                        if (game.status === Status.WAITING_PLAYER || game.status === Status.FULL)
                            this.io.to(game.gameId).emit('abortGame', { cardId: data.cardId, message });
                    });
                    this.io.emit('gameCardsModified');
                }
            });

            socket.on('gameCardsDeleted', () => {
                const games = this.gamesManager.getAllGames();
                const message = 'Les fiches de jeu ont été supprimées';
                games.forEach((game: Game) => {
                    if (game.status === Status.WAITING_PLAYER || game.status === Status.FULL)
                        this.io.to(game.gameId).emit('abortGame', { cardId: (game.gameCard as GameCardTemplate).id, message });
                });
                this.io.emit('gameCardsModified');
            });

            socket.on('bestTimesUpdate', (data: any) => {
                this.io.emit('gameCardsModified');
            });

            socket.on('localMessage', (data) => {
                const message = data as Message;
                const gameId = this.getSocketRoom(socket);
                if (message) {
                    this.io.to(gameId).emit('newMessage', message);
                }
            });

        });
    }

    private sendUpdatedChatList(socket: io.Socket) {
        this.databaseService.getChatList().then((chatList) => {

            socket.emit('updatedChatList', chatList);
        });
    }

    updateButtonStatus(gameId: string): boolean {
        const cardId = this.gamesManager.getGameById(gameId)?.gameCard?.id;
        const isWaiting = cardId !== undefined && this.gamesManager.isWaitingGameCard(cardId);
        const isFull = cardId !== undefined && this.gamesManager.isFullGameCard(cardId);
        this.io.emit('gameCardStatus', { cardId, isWaiting, isFull });
        return isWaiting;
    }

    getSocketRoom(socket: io.Socket): string {
        const rooms = socket.rooms.values();

        for (const room of rooms)
            if (room !== socket.id)
                return room;
        return '';
    }
}
