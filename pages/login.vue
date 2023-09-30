<template>
  <div style="background-color: #6946dd; height: 100%">
    <v-dialog persistent v-model="dialogWhatsapp" width="600px">
      <v-card>
        <v-card-title
          dense
          class="white--text"
          style="background-color: #6946dd"
        >
          Whatsapp Verification
          <v-spacer></v-spacer>
          <v-icon @click="dialogWhatsapp = false" outlined dark color="white">
            mdi mdi-close-circle
          </v-icon>
        </v-card-title>
        <v-card-text>
          <div class="row g-0">
            <div class="col-lg-12">
              <div class="card-body p-md-5 mx-md-4">
                <v-row class="pb-5">
                  <v-col md="12" cols="12" class="text-center">
                    <h2>EzTime</h2>
                  </v-col>
                </v-row>

                <h5>
                  Two Step Whatsapp OTP Verification
                  <v-icon dark color="green" fill>mdi-whatsapp</v-icon>
                </h5>
                <p>
                  We sent a verification code to your mobile number. Enter the
                  Code from the mobile in the filed below
                </p>
                <h4>
                  {{ maskMobileNumber }}
                </h4>
                <!-- <v-form ref="form" method="post" v-model="whatsappFormValid" lazy-validation> -->
                <label
                  for=""
                  class="pb-5"
                  style="font-weight: bold; font-size: 20px"
                  >Type your 6 Digit Security Code</label
                >
                <div class="form-outline mb-4">
                  <v-otp-input
                    v-model="otp"
                    length="6"
                    :rules="requiredRules"
                  ></v-otp-input>
                </div>

                <div class="text-center pt-1 mb-5 pb-1">
                  <span v-if="msg" class="error--text">
                    {{ msg }}
                  </span>
                  <v-btn
                    :loading="loading"
                    @click="checkOTP(otp)"
                    class="btn btn-block fa-lg mt-1 mb-3"
                    style="background-color: #6946dd; color: #fff"
                  >
                    Verify OTP
                  </v-btn>
                  <!-- <v-btn :loading="loading" @click="checkOTP(otp)"
                      class="btn btn-primary btn-block text-white fa-lg primary mt-1 mb-3 btntext">
                      Verify OTP
                    </v-btn> -->
                </div>

                <div
                  class="d-flex align-items-center justify-content-center pb-4"
                ></div>
                <!-- </v-form> -->
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div
      class="col-lg-6 col-md-12 col-sm-12 col-lg-6"
      style="background-color: #6946dd; height: 100%"
    >
      <div class="text-center" style="height: 100px">
        <!-- <img width="35%" :src="logo" alt="logo" /> -->
      </div>
      <div class="card-body p-md-5 mx-md-4" style="color: #fff">
        <h2 class="pb-7">Welcome To EzTime</h2>

        <v-form
          ref="form"
          method="post"
          v-model="valid"
          lazy-validation
          autocomplete="off"
        >
          <div class="form-outline">
            <v-text-field
              dark
              color="white--text"
              rounded
              v-model="email"
              :rules="emailRules"
              :hide-details="false"
              id="form2Example11"
              placeholder="username"
              autofill="false"
              required
              dense
              outlined
              type="email"
              prepend-inner-icon="mdi-account"
              autocomplete="false"
              aria-autocomplete="none"
            ></v-text-field>
          </div>

          <div class="form-outline">
            <v-text-field
              dark
              color="white--text"
              rounded
              dense
              outlined
              :rules="passwordRules"
              autocomplete="off"
              placeholder="Password"
              prepend-inner-icon="mdi-lock  "
              :append-icon="show_password ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show_password ? 'text' : 'password'"
              v-model="password"
              class="input-group--focused text-white"
              @click:append="show_password = !show_password"
            ></v-text-field>
          </div>

          <v-row>
            <v-col md="6">
              <v-checkbox color="white--text" value="red" dark>
                <template v-slot:label>
                  <label style="color: #fff">Remember Password</label>
                </template>
              </v-checkbox>
            </v-col>
            <v-col md="6" class="text-right pt-8">
              <!-- <nuxt-link class="text-white" to="/reset-password"
                >Forgot password?</nuxt-link
              > -->
            </v-col>
          </v-row>

          <div class="text-center pt-1 mb-5 pb-1">
            <span v-if="msg" class="error--text">
              {{ msg }}
            </span>
            <v-btn
              :loading="loading"
              @click="login"
              class="btn btn-black btn-block white mt-1 mb-3 p-4 btntext"
            >
              Login
            </v-btn>
          </div>
        </v-form>
        <div class="text-center white--text text-white">
          Don't Have an Account?. Contact Admin
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // components: { VueRecaptcha },

  layout: "login",
  data: () => ({
    // sitekey: "6Lf1wYwhAAAAAOMJYvI73SgjCSrS_OSS2kDJbVvs", // i am not robot
    // reCaptcha: null,
    // showGRC: false,
    maskMobileNumber: "",
    whatsappFormValid: true,
    logo: "/ideaHRMS-final-blue.svg",
    valid: true,
    loading: false,
    snackbar: false,
    email: "francisgill1002@gmail.com",
    password: "1@Ab56ab56",
    show_password: false,
    msg: "",
    requiredRules: [(v) => !!v || "Required"],
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],

    passwordRules: [(v) => !!v || "Password is required"],

    dialogWhatsapp: false,
    otp: "",
    userId: "",
  }),
  created() {},
  methods: {
    hideMobileNumber(inputString) {
      // Check if the input is a valid string
      if (typeof inputString !== "string" || inputString.length < 4) {
        return inputString; // Return input as is if it's not a valid string
      }

      // Use a regular expression to match all but the last 3 digits
      var regex = /^(.*)(\d{3})$/;
      var matches = inputString.match(regex);

      if (matches) {
        var prefix = matches[1]; // Text before the last 3 digits
        var lastDigits = matches[2]; // Last 3 digits
        var maskedPrefix = "*".repeat(prefix.length); // Create a string of asterisks of the same length as the prefix
        return maskedPrefix + lastDigits;
      } else {
        return inputString; // Return input as is if there are fewer than 3 digits
      }
    },

    handleInputChange() {},
    // mxVerify(res) {
    //   this.reCaptcha = res;
    //   this.showGRC = this.reCaptcha ? false : true;
    // },
    checkOTP(otp) {
      if (otp == "") {
        alert("Enter OTP");
        return;
      }
      let payload = {
        userId: this.userId,
      };
      this.$axios
        .post(`check_otp/${otp}`, payload)
        .then(({ data }) => {
          if (!data.status) {
            alert("Invalid OTP. Please try again");
          } else {
            this.login();
          }
        })
        .catch((err) => console.log(err));
    },

    loginWithOTP() {
      this.loading = true;
      console.log(this.$refs.form.validate());
      //if (this.$refs.form.validate())
      {
        let credentials = {
          email: this.email,
          password: this.password,
        };

        let payload = credentials;

        //geenrate OTP
        this.$axios
          .post("loginwith_otp", payload)
          .then(({ data }) => {
            if (!data.status) {
              alert("OTP Verification: " + data.message);
            } else if (data.user_id) {
              if (data.enable_whatsapp_otp == 1) {
                this.dialogWhatsapp = true;
                this.userId = data.user_id;
                if (data.mobile_number) {
                  this.maskMobileNumber = this.hideMobileNumber(
                    data.mobile_number
                  );
                }

                this.loading = false;
              } else {
                this.login();
              }
            } else {
              alert("OTP Verification: " + "Invalid Deails");
            }
          })
          .catch((err) => console.log(err));
      }

      this.loading = false;
    },
    login() {
      // this.showGRC = this.reCaptcha ? false : true;

      // if (this.$refs.form.validate() && this.reCaptcha) {
      if (this.$refs.form.validate()) {
        this.msg = "";
        this.loading = true;
        // const token = await this.$recaptcha.getResponse();
        let credentials = {
          email: this.email,
          password: this.password,
        };

        this.$auth
          .loginWith("local", { data: credentials })
          .then(({ data }) => {
          
            this.$router.push(`/`);
          })
          .catch(({ response }) => {
            if (!response) {
              return false;
            }
            let { status, data, statusText } = response;
            this.msg = status == 422 ? data.message : statusText;
            setTimeout(() => (this.loading = false), 2000);
          });
      }
    },
  },
};
</script>
<style scoped>
.v-text-field--outlined >>> fieldset {
  border-color: #fff;
}

.v-list__group__header__prepend-icon .v-icon {
  color: red;
}

.v-input__icon {
  color: #fff !important;
}

.hidden-sm-and-down .v-icon {
  color: white !important;
}

.v-text-field--rounded {
  border-radius: 10px;
}

.text-white {
  color: #fff;
}

.v-label {
  color: #fff !important;
}

.v-btn {
  text-transform: inherit !important;
}

.v-input__control .v-label {
  color: red;
}

.btntext {
  color: #6946dd;
  font-weight: bold;
  font-size: 22px;
}

/* fieldset {
  border-radius: 10px;
  ;
} */
/*
i {
  color: #FFF;
} */

@media (min-width: 768px) {
  .gradient-form {
    height: 100vh !important;
  }
}
@media screen and (max-width: 480px) {
  body {
    background-color: #6946dd !important;
  }
}
@media (min-width: 769px) {
  .primary {
    background: #5fafa3 !important;
    /* #5fafa3 */
    border-top-right-radius: 0.3rem;
    border-bottom-right-radius: 0.3rem;
  }
}
input:-webkit-autofill::webkit-input-placeholder {
  background-color: red;
}
input:-webkit-autofill {
  -webkit-text-fill-color: red !important;
  background-color: red !important;
}
/*
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: #6946dd;
  background-color: #6946dd;
}

input:-internal-autofill-selected {
  appearance: menulist-button;
  background-image: none !important;
  background-color: -internal-light-dark(#6946dd, #6946dd) !important;
  color: fieldtext !important;
}
input:-webkit-autofill,
input:-webkit-autofill:focus {
  transition: background-color 0s 600000s, color 0s 600000s;
}
input.my-input {
  background-color: #6946dd !important;
  background-image: none !important;
  color: rgb(0, 0, 0) !important;
}

input.my-input:-internal-autofill-selected {
  background-color: #6946dd !important;
  background-image: none !important;
  color: rgb(0, 0, 0) !important;
} */
</style>
