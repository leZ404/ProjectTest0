import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthentificationService } from '@app/services/authentification.service';
import { LoginResponse } from '@common/login-response';
import { User } from '@common/user';
//import { CurrentUser } from '../../../../user.js';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
    @Input() socketId: string;
    formGroup: FormGroup;
    user: User;
    constructor(private authService: AuthentificationService, private readonly router: Router) {}

    ngOnInit(): void {
        this.initForm();
    }

    initForm() {
        this.formGroup = new FormGroup({
            username: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required, Validators.minLength(4)]),
        });
    }

    loginProcess() {
        console.log(this.formGroup.valid);
        if (this.formGroup.valid) {
            this.authService.validateUserLogin(this.formGroup.value).subscribe({
                next: (res) => {
                    const loginResponse = res.body as LoginResponse;
                    if (loginResponse?.token) {
                        localStorage.setItem('token', loginResponse.token);
                        this.authService.login().subscribe(() => {
                            // CurrentUser.username = this.formGroup.value.username;
                            this.authService.setUsername(this.formGroup.value.username);
                            this.router.navigate(['home']);
                        });
                    }
                },
                error: (err) => {
                    alert(err.error?.message + ' : La connexion a échoué, veuillez réessayer');
                },
            });
        } else {
            alert('Remplir les champs obligatoires');
        }
    }
}
