import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AuthentificationService } from '@app/services/authentification.service';
import { Messenger } from '@app/services/messenger';
import { PersistentMessengerService } from '@app/services/persistent-messenger.service';
import { SocketService } from '@app/services/socket.service';
import { Message, SenderType } from '@common/message';

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
  providers: [Messenger, PersistentMessengerService],
  encapsulation: ViewEncapsulation.None // Ceci appliquera les styles globalement


})
export class ChatWidgetComponent implements OnInit {

  @Input() channel: string;

  @Input() username: string;
  @Input() canSend: boolean;
  @Output() clicked = new EventEmitter();
  @Output() unclicked = new EventEmitter();


  messages: Message[] = [];
  messageContent: string;
  senderType: typeof SenderType;

  constructor(public messenger: Messenger, public persistentMessenger: PersistentMessengerService, public socketService: SocketService, public authService: AuthentificationService
  ) {
    this.messageContent = '';
    this.clicked = new EventEmitter();
    this.unclicked = new EventEmitter();
    this.senderType = SenderType;
    this.socketService.listen('updatedHistory').subscribe((message: any) => { //TODO: changer nom du socket pour le chat problem here for display in server updatedhistory ( chat insetead of history in the emit socket need to add one)
      console.log('history from widget:', message);
      console.log('all chat:', message);
      console.log('concenrned chat from widget', message);
      //  this.messages = chat.history;
      this.messages = message;
      console.log('history from widget:', this.messages);

    })
  }

  ngOnInit(): void {
    // this.messages = this.persistentMessenger.getMessages();
    console.log("messenger messages", this.messenger.messages)
    this.messenger.getMessages(this.channel).subscribe((messages: Message[]) => {
      this.messages = messages;
    });

    this.messenger.onMessageReceived((message: Message) => {
      this.messages.push(message);
    });

  }



  setContent(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.messageContent = textarea.value;

    textarea.style.height = 'auto';

    const maxHeight = 150;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }


  send() {
    if (this.messageContent.trim()) {
      this.messenger.send(this.authService.username, this.messageContent, this.channel);
      console.log(this.channel);


      this.messageContent = '';
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.focus();
      }
    }
    this.scrollToBottom();
  }


  sendMessage(username: string, body: string) {
    // this.messenger.send(username, body);
  }

  clickChat() {
    this.clicked.emit();
  }

  closeChat() {
    this.unclicked.emit();
  }

  handleEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }


  scrollToBottom(): void {
    setTimeout(() => {
      const scrollBox = document.getElementById('scrollBox');
      if (scrollBox) {
        scrollBox.scrollTop = scrollBox.scrollHeight;
      }
    }, 100);
  }




}
