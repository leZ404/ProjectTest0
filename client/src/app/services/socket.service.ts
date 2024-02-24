import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    socket: any;
    readonly uri: string;

    constructor() {
        console.log("service constructor");
        this.uri = environment.webSocketUrl;
        console.log(environment);

        console.log("service constructor 1");
        //this.socket = io(this.uri);
        this.socket = io('http://localhost:3000');
        console.log("service constructor 2");
    }

    emit(event: string, data: any) {
        this.socket.emit(event, data);
    }
    emitGeneralChat(message: any, channelName: string) {
        const data = {
            body: message.body,
            sender: message.sender,
            senderType: message.senderType,
            time: message.time,
            chatName: channelName
        };
        console.log('emitting message:', data);

        this.socket.emit('updateChatHistory', data);

    }


    listen(event: string) {
        return new Observable((sub) => {
            this.socket.on(event, (data: any) => {
                sub.next(data);
            });
        });
    }
}
