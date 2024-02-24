import { Component, OnInit } from '@angular/core';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { GameConstantsService } from '@app/services/game-constants.service';
import { PopupTextComponent } from '../popup-text/popup-text.component';

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    initialTime: number;
    penalty: number;
    timeWon: number;


    constructor(private gameConstantsService: GameConstantsService) {}

    async ngOnInit() {
        const constants = await this.gameConstantsService.getConstants();
        this.initialTime = constants.initialTime;
        this.penalty = constants.penalty;
        this.timeWon = constants.timeWon;
    }

    openDialogConfirmResetConstants() {
        PopupTextComponent.openDialog(
            this.gameConstantsService.dialogRef,
            {
                message: `Réinitialiser les constantes?`,
                btnText: 'Non',
                btnText2: 'Oui',
            } as DialogData,
            this.confirmResetConstantsCallback,
        );
    }

    confirmResetConstantsCallback = (feedback: DialogFeedback) => {
        const res = feedback.event.target as HTMLButtonElement;
        if (res.innerHTML === 'Oui') {
            const constants = this.gameConstantsService.defaultConstants();
            this.gameConstantsService.setConstants(constants);
            this.initialTime = constants.initialTime;
            this.penalty = constants.penalty;
            this.timeWon = constants.timeWon;
        }
        this.gameConstantsService.dialogRef.closeAll();
    }

    setConstants() {
        this.gameConstantsService.setConstants({
            initialTime: this.initialTime,
            penalty: this.penalty,
            timeWon: this.timeWon,
        });
    }

}