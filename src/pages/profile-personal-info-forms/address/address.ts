import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';
import {TabsPage} from "../../tabs/tabs";
import {Validators, FormBuilder, FormGroup} from "@angular/forms";
import {ProfilePage} from "../../profile/profile";
import {ProfileService} from "../../../services/profile.service";
import {LoadingService} from "../../../services/loading.service";
import {ToastService} from "../../../services/toast.service";
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'page-profile-personal-address-form',
  templateUrl: 'address.html',
  providers: [ProfileService, LoadingService, AuthService, ToastService]
})
export class ProfilePersonalAddressForm {
  private addressForm: FormGroup;

  private zipCodeIsValid: boolean;
  private formFieldsMissing: boolean;

  constructor(public navCtrl: NavController, private formBuilder: FormBuilder,
              private profileService: ProfileService, private loadingService: LoadingService,
              private authService: AuthService, private toastService: ToastService) {
    this.zipCodeIsValid = true;

    this.addressForm = formBuilder.group({
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      state: ['', Validators.required],
      city: ['', Validators.required],
      zipCode: ['', Validators.compose([Validators.minLength(5), Validators.maxLength(5),
        Validators.pattern('[0-9]*'), Validators.required]), null]
    });
  }

  finishForm() {
    if (this.addressForm.valid) {
      this.loadingService.presentLoading();
      this.formFieldsMissing = false;
      this.postData()
        .then(() => {
          this.loadingService.hideLoading();
          this.navCtrl.setRoot(ProfilePage);
        })
        .catch((err) => {
          console.log(err);
          this.loadingService.hideLoading();
          this.navCtrl.setRoot(ProfilePage);
          this.toastService.presentToast("Could not reach PIYP servers. Check your data connection and try again.")
        });
    }
    else {
      this.formFieldsMissing = true;
    }
  }

  checkZip(zip) {
    if (zip != undefined && zip.length != 5) {
      this.zipCodeIsValid = false;
    }
    else {
      this.zipCodeIsValid = true;
    }
  }

  saveAndQuit() {
    this.postData()
      .then(() => {
        this.navCtrl.setRoot(ProfilePage);
      });
  }

  postData(): Promise<any> {
    let profileId = JSON.parse(localStorage.getItem('current_profile'))._id;
    let address = {
      "line1": this.addressForm.value.addressLine1,
      "line2": this.addressForm.value.addressLine2,
      "city": this.addressForm.value.city,
      "state": this.addressForm.value.state,
      "postalCode": this.addressForm.value.zipCode
    };
    return this.profileService.updateUserProfile(profileId, {personalAddress: address});
  }

  ionViewCanEnter(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authService.loggedIn()
        .then((data) => {
          if (data) {
            resolve(true);
          }
          else {
            resolve(false);
          }
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }

}
