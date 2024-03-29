import {Component, ViewChild} from '@angular/core';

import {NavController, Slides, Checkbox, App} from 'ionic-angular';
import {FormBuilder, Validators, FormGroup, FormControl} from "@angular/forms";
import {SignUpValidator} from "./sign-up.validator";
import {AuthService} from "../../services/auth.service";
import {AccountCreationService} from "../../services/account-creation.service";
import {TabsPage} from "../tabs/tabs";
import {SelectProfilePage} from "../select-profile/select-profile";
import {UserService} from "../../services/user.service";
import {LoadingService} from "../../services/loading.service";
import {ToastService} from "../../services/toast.service";

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html',
  providers: [AuthService, AccountCreationService, SignUpValidator, UserService, LoadingService, ToastService]
})

export class SignUpPage {

  @ViewChild('signupSlider') slider: Slides;
  @ViewChild('individual') individual: Checkbox;
  @ViewChild('business') business: Checkbox;

  private formLoginInformation: FormGroup;

  private loginFieldsMissing: boolean;
  private invalidPassword: boolean;
  private noAccountTypeSelected: boolean;
  private passwordsMatch: boolean;

  private checkboxPro: string;
  private checkboxConsumer: string;
  private email: string;
  private password1: string;
  private password2: string;

  constructor(public navCtrl: NavController, private signUpValidator: SignUpValidator,
              public formBuilder: FormBuilder, private toastService: ToastService,
              private app: App, private accountCreationService: AccountCreationService,
              private userService: UserService, private loadingService: LoadingService) {
    this.loginFieldsMissing = false;
    this.noAccountTypeSelected = false;
    this.passwordsMatch = true;
    this.invalidPassword = false;

    let emailValidator = (control) => {
      return this.signUpValidator.validateEmail(control);
    };

    this.formLoginInformation = formBuilder.group({
      firstName: ['', Validators.compose([Validators.maxLength(60), Validators.pattern('[a-zA-Z ]*'), Validators.required]), null],
      lastName: ['', Validators.compose([Validators.maxLength(60), Validators.pattern('[a-zA-Z ]*'), Validators.required]), null],
      email: ['', Validators.compose([Validators.maxLength(45), Validators.pattern('[A-z0-9._%+-]+@[A-z0-9.-]+\.[A-z]{2,}')]), emailValidator],
      password1: ['', Validators.required],
      password2: ['', Validators.required],
      checkboxPro: [null],
      checkboxConsumer: [null]
    });
  }

  checkIfAccountTypeSelected(): boolean {
    if (!this.formLoginInformation.value.checkboxPro && !this.formLoginInformation.value.checkboxConsumer) {
      this.noAccountTypeSelected = true;
      return false;
    }
    else {
      this.noAccountTypeSelected = false;
      return true;
    }
  }

  checkPasswords() {
    if (this.formLoginInformation.value.password2.length > 0) {
      if (this.formLoginInformation.value.password1 === this.formLoginInformation.value.password2) {
        this.passwordsMatch = true;
      }
      else {
        this.passwordsMatch = false;
      }
    }
    else {
      this.passwordsMatch = true;
    }

    if (this.formLoginInformation.value.password1.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].{8,}$/.test(this.formLoginInformation.value.password1)) {
      this.invalidPassword = true;
    }
    else {
      this.invalidPassword = false;
    }
  }

  formIsSubmittable(): boolean {
    this.checkIfAccountTypeSelected();
    this.checkPasswords();
    if (this.formLoginInformation.valid && !this.noAccountTypeSelected && !this.invalidPassword && this.passwordsMatch) { //&& this.formPersonalInformation.valid && this.formCreditCardInformation.valid && !this.invalidPassword /*&& !this.invalidCvc && !this.invalidBillingZip && !this.showCreditCardError) {
      return true;
    }
    else {
      return false;
    }
  }

  signUp() {
    if (!this.formLoginInformation.valid) {
      this.loginFieldsMissing = true;
    }
    else if (this.formIsSubmittable()) {
      this.loginFieldsMissing = false;
      this.invalidPassword = false;
      this.noAccountTypeSelected = false;
      this.passwordsMatch = true;

      let accountInfo = {
        firstName: this.formLoginInformation.value.firstName,
        lastName: this.formLoginInformation.value.lastName,
        isPro: !!this.formLoginInformation.value.checkboxPro,
        isConsumer: !!this.formLoginInformation.value.checkboxConsumer,
        email: this.formLoginInformation.value.email,
        password: this.formLoginInformation.value.password1,
      };

      this.loadingService.presentLoading();
      this.accountCreationService.createAccount(accountInfo)
        .then((result) => {
          console.log("createAccount success");
          return this.userService.getUser();
        })
        .then((result) => {
          console.log("getUser success");
          if (result) {
            this.loadingService.hideLoading();
            if (this.userService.getNumberOfUserProfiles() === 1) {
              this.navCtrl.push(TabsPage)
            }
            else {
              this.navCtrl.push(SelectProfilePage);
            }
          }
        })
        .catch((err) => {
          this.loadingService.hideLoading();
          console.log(err);
          this.toastService.presentToast("Could not create account. Please try again later.");
        });
    }
  }

  dismiss() {
    this.navCtrl.pop();
  }
}
