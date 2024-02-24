import { Component, OnInit } from '@angular/core';
import { AuthentificationService } from '@app/services/authentification.service';
import { ChannelService } from '@app/services/channel.service';
import { SocketService } from '@app/services/socket.service';
import { Chat } from '@common/chat';

@Component({
  selector: 'app-channel-widget',
  templateUrl: './channel-widget.component.html',
  styleUrls: ['./channel-widget.component.scss']
})
export class ChannelWidgetComponent implements OnInit {

  channelList: Chat[] = [];
  showCreateChannelInput: boolean = false;
  selectedChannel: string = '';


  constructor(public socketService: SocketService, public channelService: ChannelService, public authentificationService: AuthentificationService) {
    // this.socketService.listen('updatedChatList').subscribe((message: any) => {
    // })
  }


  ngOnInit(): void {
    console.log("channels on init ", this.channelService.channelList)
    this.channelService.getChannelList().subscribe((chatList: Chat[]) => {
      this.channelList = chatList;
    });

    this.channelService.getChannelList();
    this.channelList = this.channelService.channelList;
    console.log('channels after init :', this.channelList);
  }

  createChannel(channelName: string) {
    this.channelService.createChannel(channelName, this.authentificationService.username);
  }

  selectChannel(channelName: string) {
    this.channelService.selectChannel(channelName);
    console.log('channel from widget:', channelName);
    this.selectedChannel = channelName;
  }


  deleteChannel(channelName: string) {
    this.channelService.deleteChannel(channelName);
  }



}


