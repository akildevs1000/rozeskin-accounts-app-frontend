<template>
  <div>
    <v-dialog v-model="dialog" width="500">
      <AssetsIconClose left="490" @click="close" />
      <template v-slot:activator="{ on, attrs }">
        <v-icon v-bind="attrs" v-on="on" icon color="primary">
          mdi-magnify
        </v-icon>
      </template>

      <v-card>
        <v-alert flat class="grey lighten-3" dense>
          <span>Search Customer By Phone</span>
        </v-alert>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                outlined
                dense
                hide-details
                v-model="phone"
                label="Phone"
              >
                <template v-slot:append>
                  <v-icon
                    style="
                      border-radius: 5px;
                      padding: 4px;
                      top: 0px;
                      position: absolute;
                      right: 1px;
                    "
                    class="primary white--text"
                    @click="submit"
                    >mdi-magnify</v-icon
                  >
                </template></v-text-field
              >
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      phone: "",
      dialog: false,
      loading: false,
      successResponse: null,
      errorResponse: null,
    };
  },
  created() {},
  methods: {
    close() {
      this.dialog = false;
      this.loading = false;
      this.errorResponse = null;
      this.phone = null;
    },
    async submit() {
      let config = {
        params: {
          phone: this.phone,
        },
      };
      try {
        let { data } = await this.$axios.get("get-customer", config);
        this.$emit("customer", data ?? null);
        this.close();
      } catch (error) {
        this.errorResponse = error?.response?.data?.message || "Unknown error";
        this.loading = false;
      }
    },
  },
};
</script>
