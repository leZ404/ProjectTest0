import { Component } from '@angular/core';
import { AuthentificationService } from '@app/services/authentification.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    isChatVisible: boolean = false;

    constructor(private readonly authService: AuthentificationService) {}
    readonly title: string = 'Jeu de différences';
    logout() {
        this.authService.logout();
    }


    toggleChat(): void {
        this.isChatVisible = !this.isChatVisible;
    }
}
