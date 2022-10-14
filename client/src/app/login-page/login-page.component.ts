import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { Subscription } from 'rxjs/index';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MaterialService } from '../shared/classes/material.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  form: any;
  aSub: any;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this.route.queryParams.subscribe((params: Params) => {
      if (params['registered']) {
        MaterialService.toast(
          'Теперь вы можете зайти в систему используя свои данные'
        );
      } else if (params['accessDenied']) {
        MaterialService.toast('Для начала авторизируйтесь в системе');
      } else if (params['sessionFailed']) {
        MaterialService.toast('Пожалуйста войдите в систему заного');
      }
    });
  }

  ngOnDestroy() {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
  }

  onSubmit() {
    // const user = {
    //   email: this.form.value.email,
    //   password: this.form.value.password,
    // };
    // console.log(this.auth.login(user));

    this.form.disable();

    this.aSub = this.auth.login(this.form.value).subscribe(
      () => {
        this.router.navigate(['/overview']);
      },
      (error) => {
        MaterialService.toast(error.error.message);
        // console.warn('Error');
        this.form.enable();
      }
    );
  }
}
