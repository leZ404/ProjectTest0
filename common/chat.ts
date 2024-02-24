import { Message } from './message';
interface IChat {
    name: string;
    history: Message[];
    creatorName: string;

}

export type Chat = IChat;