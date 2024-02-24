import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { CommunicationService } from '@app/services/communication.service';
import { SocketService } from '@app/services/socket.service';
import { consts } from '@common/consts';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnDestroy {
    destroy$ = new Subject<any>();
    constructor(readonly communication: CommunicationService, readonly dialogRef: MatDialog, readonly socketService: SocketService, public router: Router) {}

    openDialogConfirmResetAllBestTimes() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: `Réinitialiser tous les meilleurs temps?`,
                btnText: 'Non',
                btnText2: 'Oui',
            } as DialogData,
            this.confirmResetAllBestTimesCallback,
        );
    }

    openDialogConfirmDeleteAllCards() {
        PopupTextComponent.openDialog(
            this.dialogRef,
            {
                message: `Supprimer toutes les fiches?`,
                btnText: 'Non',
                btnText2: 'Oui',
            } as DialogData,
            this.confirmDeleteAllCardsCallback,
        );
    }

    confirmResetAllBestTimesCallback = (feedback: DialogFeedback) => {
        const res = feedback.event.target as HTMLButtonElement;
        if (res.innerHTML === 'Oui') {
            this.resetAllBestTimes();
        }
        this.dialogRef.closeAll();
    }

    confirmDeleteAllCardsCallback = (feedback: DialogFeedback) => {
        const res = feedback.event.target as HTMLButtonElement;
        if (res.innerHTML === 'Oui') {
            this.deleteAllCards();
        }
        this.dialogRef.closeAll();
    }

    async resetAllBestTimes() {
        const res = this.communication.resetAllBestTimes();
        res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
            if (response.status === consts.HTTP_STATUS_OK) {
                this.socketService.emit('bestTimesUpdate', {});
            }
        });
    }

    deleteAllCards() {
        const res = this.communication.deleteAllCards();
        res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
            if (response.status === consts.HTTP_STATUS_OK)
                this.socketService.emit('gameCardsDeleted', null);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next('destroy');
        this.destroy$.complete();
    }
}
