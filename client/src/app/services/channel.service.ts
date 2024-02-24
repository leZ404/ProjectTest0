import { Injectable } from '@angular/core';
import { Chat } from '@common/chat';
import { Message } from '@common/message';
import { Observable, map } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})

export class ChannelService {


  readonly x: any[] = [];
  channelList: Chat[] = [];


  constructor(public socketService: SocketService) {
    this.getChannelList();
    console.log('x value:', this.x);
  }

  getChannelList(): Observable<Chat[]> {
    this.socketService.emit('getChatList', {});
    return this.socketService.listen('updatedChatList').pipe(
      map(data => data as Chat[])
    );

    // this.channelList = this.channelList;
  }



  // listenForChannels(): void {
  //   this.socketService.listen('updateChatList').subscribe((data: any) => {
  //     const channels: Chat[] = data as Chat[];
  //     this.channelList = channels;
  //   });
  // }

  createChannel(channelName: string, creator: string) {
    console.log('creating channel:', this.channelList);
    this.socketService.emit('createChat', { name: channelName, creatorName: creator });
    this.channelList.push({
      name: channelName, creatorName: creator,
      history: []
    });

  }

  selectChannel(channelName: string) {
    // this.socketService.emit('getSingleChat', channelName);
    this.socketService.emit('getChatHistory', channelName);
    console.log('channel from service:', channelName);

  }



  deleteChannel(channelName: string) {
    this.socketService.emit('deleteChannel', channelName);
  }


  sendMessage(channelName: string, sender: string, messageContent: string): void {
    const message = new Message(messageContent, sender);
    this.socketService.emitGeneralChat(message, channelName);
  }
}

