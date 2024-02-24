import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppComponent } from '@app/pages/app/app.component';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { LimitedTimePageComponent } from '@app/pages/limited-time-page/limited-time-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ChannelWidgetComponent } from './components/channel-widget/channel-widget.component';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';
import { ChronometreComponent } from './components/chronometre/chronometre.component';
import { ClueComponent } from './components/clue/clue.component';
import { ControlVideoToolComponent } from './components/control-video-tool/control-video-tool.component';
import { ControlVideoComponent } from './components/control-video/control-video.component';
import { CounterComponent } from './components/counter/counter.component';
import { CustomButtonComponent } from './components/custom-button/custom-button.component';
import { DrawingZoneComponent } from './components/drawing-zone/drawing-zone.component';
import { GameCardListComponent } from './components/game-card-list/game-card-list.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { GameConstantsComponent } from './components/game-constants/game-constants.component';
import { GameHistoryComponent } from './components/game-history/game-history.component';
import { GameInfoComponent } from './components/game-info/game-info.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { LogoComponent } from './components/logo/logo.component';
import { PopupErrorComponent } from './components/popup-error/popup-error.component';
import { PopupQuitComponent } from './components/popup-quit/popup-quit.component';
import { PopupTextComponent } from './components/popup-text/popup-text.component';
import { SignupFormComponent } from './components/signup/signup.component';
import { ToolBarComponent } from './components/tool-bar/tool-bar.component';
import { ToolbarColorsComponent } from './components/toolbar-colors/toolbar-colors.component';
import { ToolbarToolsComponent } from './components/toolbar-tools/toolbar-tools.component';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';
import { CreatePageComponent } from './pages/create-page/create-page.component';
import { GamePageClassic1v1Component } from './pages/game-page-classic1v1/game-page-classic1v1.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { LimitedSelectoComponent } from './pages/limited-selecto/limited-selecto.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ReplayPageComponent } from './pages/replay-page/replay-page.component';
import { SelectoPageComponent } from './pages/selecto-page/selecto-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { WaitingPageComponent } from './pages/waiting-page/waiting-page.component';
import { DifferencesDetectionService } from './services/differences-detection.service';
import { LobbyCommunicationService } from './services/lobby-communication.service';
import { PersistentMessengerService } from './services/persistent-messenger.service';
import { SocketService } from './services/socket.service';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        ConfigPageComponent,
        LimitedTimePageComponent,
        SelectoPageComponent,
        CreatePageComponent,
        DrawingZoneComponent,
        ToolBarComponent,
        ToolbarToolsComponent,
        ToolbarColorsComponent,
        GameConstantsComponent,
        GameHistoryComponent,
        ChronometreComponent,
        CounterComponent,
        LogoComponent,
        CustomButtonComponent,
        GameCardComponent,
        GameCardListComponent,
        PopupErrorComponent,
        PopupQuitComponent,
        GameInfoComponent,
        WaitingPageComponent,
        GamePageClassic1v1Component,
        PopupTextComponent,
        ReplayPageComponent,
        ControlVideoComponent,
        ControlVideoToolComponent,
        ClueComponent,
        LimitedSelectoComponent,
        ChatPageComponent,
        ChatWidgetComponent,
        ChannelWidgetComponent,
        LoginPageComponent,
        LoginFormComponent,
        SignupPageComponent,
        SignupFormComponent,
    ],
    imports: [AppRoutingModule, BrowserAnimationsModule, BrowserModule, MatCardModule, FormsModule, HttpClientModule, MatDialogModule, ReactiveFormsModule, MatSidenavModule, MatListModule, MatFormFieldModule, MatInputModule, MatButtonModule],
    providers: [SocketService, DifferencesDetectionService, LobbyCommunicationService, PersistentMessengerService],
    bootstrap: [AppComponent],
})
export class AppModule {}
