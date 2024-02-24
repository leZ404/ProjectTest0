import { Injectable } from "@angular/core";
import { Message } from "@common/message";
import { Observable, Subject, map, takeUntil } from "rxjs";
import { ReplayService } from "./replay.service";
import { SocketService } from "./socket.service";
@Injectable()
export class Messenger {

    messages: Message[] = [];
    destroy$ = new Subject<any>();

    $destroy: Subject<void> = new Subject<void>();

    constructor(public socketService: SocketService, public replayService: ReplayService
    ) {
        this.messages = [];
        this.receive();
        this.onMessageReceived((message: Message) => {
        });

    }

    send(username: string, body: string, channelName: string) {
        const message = new Message(body, username);
        console.log('user', username);
        console.log('suspecious chayMsg', message);
        this.socketService.emitGeneralChat(message, channelName);//TODO: changer nom de la focntion pour le chat
        //this.persistentMessenger.addMessage(message);

    }

    receive() {
        this.socketService.listen('updatedHistory').pipe(takeUntil(this.$destroy)).subscribe({ //TODO: changer nom du socket pour le chat
            next: (data: any) => {
                const message = data as Message;
                if (message) {
                    console.log('Received message from msngr:', message);
                    this.addMessage(message);
                    //  this.replayService.addMessageEventReplay(message);
                    //this.persistentMessenger.addMessage(message);

                }
            }
        });
    }




    addMessage(message: Message) {
        this.messages.push(message);
        console.log('Updated messages:', this.messages);
    }


    onMessageReceived(callback: Function) {
        this.socketService.listen('updatedHistory').subscribe((message: any) => {
            callback(message);
            console.log('Message reçu from onreceived:', message);
        });
    }

    getMessages(chatName: string): Observable<Message[]> {
        console.log('chatname from messenger', chatName);
        this.socketService.emit('getChatHistory', chatName); // ajouter le nom du channel ici 
        return this.socketService.listen('updatedHistory').pipe(
            map((data) => data as Message[])
        );
    }





}