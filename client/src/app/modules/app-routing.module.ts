import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameConstantsComponent } from '@app/components/game-constants/game-constants.component';
import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { AuthGuard } from '@app/guard/auth.guard';
import { ChatPageComponent } from '@app/pages/chat-page/chat-page.component';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { GamePageClassic1v1Component } from '@app/pages/game-page-classic1v1/game-page-classic1v1.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LimitedSelectoComponent } from '@app/pages/limited-selecto/limited-selecto.component';
import { LimitedTimePageComponent } from '@app/pages/limited-time-page/limited-time-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ReplayPageComponent } from '@app/pages/replay-page/replay-page.component';
import { SelectoPageComponent } from '@app/pages/selecto-page/selecto-page.component';
import { SignupPageComponent } from '@app/pages/signup-page/signup-page.component';
import { WaitingPageComponent } from '@app/pages/waiting-page/waiting-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent, canActivate: [AuthGuard] },
    { path: 'game', component: GamePageComponent, canActivate: [AuthGuard] },
    { path: 'game1v1', component: GamePageClassic1v1Component, canActivate: [AuthGuard] },
    { path: 'login', component: LoginPageComponent },
    { path: 'signup', component: SignupPageComponent },
    {
        path: 'config',
        component: ConfigPageComponent,
        children: [
            { path: '', component: SelectoPageComponent },
            { path: 'create-sheet', component: CreatePageComponent },
            { path: 'game-constants', component: GameConstantsComponent },
            { path: 'game-history', component: GameHistoryComponent },
        ],
    },
    { path: 'selecto', component: SelectoPageComponent, canActivate: [AuthGuard] },
    { path: 'limited-time', component: LimitedTimePageComponent, canActivate: [AuthGuard] },
    { path: 'limited-selecto', component: LimitedSelectoComponent, canActivate: [AuthGuard] },
    { path: 'lobby', component: WaitingPageComponent, canActivate: [AuthGuard] },
    { path: 'replay', component: ReplayPageComponent, canActivate: [AuthGuard] },
    { path: 'chat', component: ChatPageComponent },
    { path: '**', redirectTo: '/home' },

];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
