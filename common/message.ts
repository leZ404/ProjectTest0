export enum SenderType {
    PLAYER,
    SYSTEM,
    EVENT
}

export class Message {
    time: string;
    senderType: SenderType;
    sender: string;
    body: string;
    // chatName?: string;


    constructor(body: string, sender?: string, senderType?: SenderType, chatName?: string) {
        if (sender) {
            this.senderType = SenderType.PLAYER;
            this.sender = sender;
        } else {
            this.senderType = senderType ? SenderType.EVENT : SenderType.SYSTEM;
            this.sender = senderType ? SenderType[2] : SenderType[1];
        }
        this.body = body;
        this.time = this.currentTime();
        // this.chatName = chatName;
    }

    currentTime(): string {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        }).format(Date.now());
    }
}

