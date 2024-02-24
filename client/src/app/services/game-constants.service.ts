import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { DialogData } from '@app/interfaces/dialog-data';
import { DialogFeedback } from '@app/interfaces/dialog-feedback';
import { consts } from '@common/consts';
import { Constants } from '@common/game-classes';
import { Subject, takeUntil } from 'rxjs';
import { CommunicationService } from './communication.service';

@Injectable({
  providedIn: 'root'
})
export class GameConstantsService {
  destroy$ = new Subject<any>();
  constructor(private communication: CommunicationService, readonly dialogRef: MatDialog) {}

  async getConstants(): Promise<Constants> {
    return new Promise<Constants>((resolve, reject) => {
      const res = this.communication.getConstants();
      res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response.status === consts.HTTP_STATUS_OK) {
          const constants = response.body as Constants;
          resolve(constants);
        } else {
          resolve(this.defaultConstants());
        }
      }, reject);
    });
  }

  defaultConstants(): Constants {
    return {
      initialTime: consts.DEFAULT_INITIAL_TIME,
      penalty: consts.DEFAULT_PENALTY,
      timeWon: consts.DEFAULT_TIME_WON,
    }
  }

  async setConstants(constants: Constants) {
    const res = this.communication.setConstants(constants);
    res.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response.status === consts.HTTP_STATUS_CREATED) {
        PopupTextComponent.openDialog(this.dialogRef, {
          message: 'Constantes mises à jour',
          btnText: 'OK',
        } as DialogData,
          this.confirmSaveConstantsCallback,
        )
      } else {
        PopupTextComponent.openDialog(this.dialogRef, {
          message: 'Erreur lors de la mise à jour des constantes',
          btnText: 'OK',
        } as DialogData,
          this.confirmSaveConstantsCallback,
        );
      }
    });
  }
  confirmSaveConstantsCallback = (feedback: DialogFeedback) => {
    this.dialogRef.closeAll();
  }

  ngOnDestroy() {
    this.destroy$.next('destroy');
    this.destroy$.complete();
  }
}
