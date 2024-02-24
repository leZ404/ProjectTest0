import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DrawingZoneComponent } from '@app/components/drawing-zone/drawing-zone.component';
import { CreatePageService } from '@app/services/create-page.service';
import { DialogService } from '@app/services/dialog.service';
import { GameCreationToolsService } from '@app/services/game-creation-tools.service';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
    providers: [CreatePageService, GameCreationToolsService, DrawingZoneComponent, DialogService],
})
export class CreatePageComponent {
    @ViewChild('leftChild', { static: true }) childLeftCanvas: DrawingZoneComponent;
    @ViewChild('rightChild', { static: true }) childRightCanvas: DrawingZoneComponent;
    constructor(
        public createPageService: CreatePageService,
        readonly dialogService: DialogService,
        readonly gameCreationToolsService: GameCreationToolsService,
        readonly router: Router,
    ) {
        console.log('create page constructor');
        localStorage.clear();
        console.log('create page constructor 1');
        this.gameCreationToolsService.dialogService = this.dialogService;
        console.log('create page constructor 2');
        this.dialogService.router = this.router;
        console.log('create page constructor 3');
    }

    ngAfterViewInit() {
        this.createPageService.childLeftCanvas = this.childLeftCanvas;
        this.createPageService.childRightCanvas = this.childRightCanvas;
    }

    @HostListener('document:keydown.control.z', ['$event'])
    undo() {
        this.createPageService.undo();
    }

    @HostListener('document:keydown.control.shift.z', ['$event'])
    redo() {
        this.createPageService.redo();
    }
}
