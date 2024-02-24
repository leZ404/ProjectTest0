import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthentificationService } from '@app/services/authentification.service';
import { User } from '@common/user';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})
export class SignupFormComponent implements OnInit {
    signupFormGroup: FormGroup;
    passwordMatch: boolean = false;
    constructor(private readonly authService: AuthentificationService, private router: Router) {}

    ngOnInit(): void {
        this.initForm();
    }

    initForm() {
        this.signupFormGroup = new FormGroup(
            {
                username: new FormControl('', [Validators.required, Validators.maxLength(10)]),
                email: new FormControl('', [
                    Validators.required,
                    Validators.email,
                    Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'),
                ]),
                password: new FormControl('', [Validators.required, Validators.minLength(4)]),
                confirmPassword: new FormControl('', [Validators.required, Validators.minLength(4)]),
                avatar: new FormControl(null),
            },
            { validators: this.checkPasswords },
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkPasswords: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
        const group = control as FormGroup;
        const pass = group.get('password')?.value;
        const confirmPass = group.get('confirmPassword')?.value;

        return pass === confirmPass ? null : { notSame: true };
    };

    signupProcess() {
        if (this.signupFormGroup.valid) {
            const newUser: User = {
                // socketId: null,
                username: this.signupFormGroup.value.username,
                email: this.signupFormGroup.value.email,
                password: this.signupFormGroup.value.password,
                chatNameList: []
            };
            this.authService.validateUserSignUp(newUser).subscribe((res: any) => {
                this.authService.login().subscribe(() => {
                    this.authService.setUsername(newUser.username);
                    this.router.navigate(['/home']);
                });
            });
        } else {
            alert('Remplir les champs obligatoires');
        }
    }
}
