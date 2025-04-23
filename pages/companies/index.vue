<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-tabs class="pt-3" color="primary">
            <v-tab> Password </v-tab>
            <v-tab> Whatsapp </v-tab>
            <v-tab-item>
              <v-card flat>
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        label="Password"
                        outlined
                        dense
                        hide-details
                        type="password"
                        v-model="user_payload.password"
                      >
                      </v-text-field>
                      <span
                        v-if="errors && errors.password"
                        class="error--text mt-2"
                        >{{ errors.password[0] }}</span
                      >
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        label="Confirm Password"
                        outlined
                        dense
                        hide-details
                        type="password"
                        v-model="user_payload.password_confirmation"
                      >
                      </v-text-field>
                      <span
                        v-if="errors && errors.password_confirmation"
                        class="error--text mt-2"
                        >{{ errors.password_confirmation[0] }}</span
                      >
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <div class="text-right">
                        <v-btn
                          small
                          :loading="loading"
                          color="primary"
                          @click="update_user"
                        >
                          Submit
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-tab-item>
            <v-tab-item>
              <Whatsapp />
            </v-tab-item>
          </v-tabs>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    loading: false,
    user_payload: {
      password: "",
      password_confirmation: "",
    },
    errors: [],
    data: {},
    response: "",
    snackbar: false,
  }),
  async created() {
    this.getDataFromApi();
  },
  methods: {
    getDataFromApi() {
      this.user_payload = this.$auth.user;
    },

    update_user() {
      this.start_process(
        `/company/${this.id}/update/user`,
        this.user_payload,
        `User`
      );
    },
    start_process(url, payload, model) {
      this.loading = true;

      this.$axios
        .post(url, payload)
        .then(({ data }) => {
          this.loading = false;

          if (!data.status) {
            this.errors = data.errors;
          } else {
            this.snackbar = true;
            this.response = model + " updated successfully";
          }
        })
        .catch((e) => console.log(e));
    },
  },
};
</script>
