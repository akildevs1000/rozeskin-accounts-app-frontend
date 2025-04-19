<template>
  <v-app style="background-color: #333959fc;">
    <v-container fluid fill-height>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="3">
          <v-card class="pa-6" elevation="3">
            <v-card-title class="text-h5 justify-center">
              Invoice App
            </v-card-title>
            <v-form ref="form" method="post" v-model="valid">
              <v-text-field
                label="Email"
                v-model="email"
                :rules="emailRules"
                hide-details
                required
                dense
                outlined
                class="mb-4"
              ></v-text-field>
              <v-text-field
                hide-details
                dense
                outlined
                :rules="passwordRules"
                :append-icon="show_password ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show_password ? 'text' : 'password'"
                v-model="password"
                @click:append="show_password = !show_password"
                class="mb-2"
              ></v-text-field>
              <span
                v-if="msg"
                class="error--text"
                style="font-size: 12px; display: inline-block; margin-bottom: 10px"
              >
                {{ msg }}
              </span>
              <v-btn
                block
                small
                :loading="loading"
                @click="login"
                class="mt-2"
                color="primary"
              >
                Log in
              </v-btn>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  // components: { VueRecaptcha },

  layout: "login",
  data: () => ({
    // sitekey: "6Lf1wYwhAAAAAOMJYvI73SgjCSrS_OSS2kDJbVvs", // i am not robot
    // reCaptcha: null,
    // showGRC: false,
    logo: "/logo1.png",
    valid: true,
    loading: false,
    snackbar: false,
    email: "demo@gmail.com",
    password: "demo",
    show_password: false,
    msg: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],

    passwordRules: [(v) => !!v || "Password is required"],
  }),
  created() {
    console.log("Login Created");

    try {
      const userType = this.$auth.user?.user_type;

      if (userType) {
        this.$router.push("/");
      }
    } catch (error) {}
  },
  methods: {
    // mxVerify(res) {
    //   this.reCaptcha = res;
    //   this.showGRC = this.reCaptcha ? false : true;
    // },

    set_otp(useId) {
      let payload = {
        cancel_by: this.$auth.user.id,
      };
      this.$axios
        .post(`generate_otp/${useId}`, payload)
        .then(({ data }) => {
          if (!data.status) {
            return;
          }
        })
        .catch((err) => console.log(err));
    },

    set_otp_new(userId) {
      this.$axios
        .post(`whatsapp-otp/`, { userId })
        .then(({ data }) => {
          if (!data.status) {
            return;
          }
        })
        .catch((err) => console.log(err));
    },

    login() {
      if (this.$refs.form.validate()) {
        this.msg = "";
        this.loading = true;
        let credentials = {
          email: this.email,
          password: this.password,
        };
        this.$auth
          .loginWith(
            "local",
            { data: credentials },
            {
              "Access-Control-Allow-Origin": "*",
            }
          )
          .then(({ data }) => {
            let LoginUser = this.$auth.user;

            if (
              LoginUser.employee_role_id != 0 &&
              LoginUser.enable_whatsapp_otp == 1
            ) {
              this.set_otp_new(this.$auth.user.id);
              this.$auth.user_verified_mobileotp = false;
              this.$router.push(`/otp`);
              return;
            } else if (data.user.user_type != "master") {
              this.$auth.user_verified_mobileotp = true;
              const updatedUser = Object.assign({}, this.$auth.user, {
                is_verified: 1,
              });
              this.$auth.setUser(updatedUser);
              // setTimeout(() => {
              //   this.$router.push(`/`);
              // }, 1000);
              this.$router.push(`/`);
              // return;
            }

            if (data.user && data.user.user_type == "master") {
              this.$router.push(`/master/companies`);
              id = data.user?.id;
              name = data.user?.name;
            }

            if (LoginUser.employee_role_id > 0) {
              this.set_otp(this.$auth.user.id);
              this.$auth.user_verified_mobileotp = false;
              this.$router.push(`/otp`);
              return;
            }
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
