import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
})
export class CounterComponent {
    @Input() name: string = 'player';
    count: number = 0;

    reset() {
        this.count = 0;
    }

    increase = () => {
        this.count++;
    };
}
