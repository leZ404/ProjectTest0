import { ReplayPageComponent } from "@app/pages/replay-page/replay-page.component";
import { EventDescription } from "./event-description";

export class CounterEventDescription extends EventDescription {
    private isAdversary: boolean;

    constructor(time: number, isAdversary: boolean) {
        super(time);
        this.isAdversary = isAdversary;
    }

    play(replayPage: ReplayPageComponent) {
        if (this.isAdversary)
            replayPage.gamePage1v1.counter2.increase();
        else
            replayPage.gamePageElem.counter.increase();
    }
}