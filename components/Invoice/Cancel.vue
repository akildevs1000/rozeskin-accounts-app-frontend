<template>
  <v-dialog v-model="dialog" width="400">
    <AssetsIconClose left="390" @click="close" />

    <template v-slot:activator="{ on, attrs }">
      <span
        v-bind="attrs"
        v-on="on"
        class="hover-bold"
        text
        style="
          background: none;
          border: none !important;
          font-size: 13px;
          cursor: pointer;
        "
        small
      >
        Cancel <v-icon x-small class="ml-1 mr-3">mdi-cancel</v-icon>
      </span>
    </template>

    <v-card>
      <v-alert flat class="grey lighten-3" dense>
        <span v-if="!loading">Canceling Invoice # {{ invoice_id }}</span>
      </v-alert>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-textarea
              rows="3"
              outlined
              dense
              hide-details
              v-model="cancel_reason"
              label="Reason"
            ></v-textarea>
          </v-col>
          <v-col cols="12" v-if="errorResponse">
            <span class="red--text">{{ errorResponse }}</span>
          </v-col>
          <v-col cols="12" class="text-right">
            <AssetsButton
              :options="{
                label: `Cancel`,
                color: `red`,
              }"
              @click="close"
            />
            &nbsp;
            <AssetsButton
              :options="{
                label: `Submit`,
                color: `green`,
              }"
              @click="submit"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: ["order_id","invoice_id", "endpoint", "model"],
  data() {
    return {
      cancel_reason: null,
      dialog: false,
      loading: false,
      successResponse: null,
      errorResponse: null,
    };
  },
  methods: {
    close() {
      this.dialog = false;
      this.loading = false;
      this.errorResponse = null;
    },
    async submit() {
      this.loading = true;
      let payload = {
        cancel_reason: this.cancel_reason,
        order_id: this.order_id,
        invoice_id: this.invoice_id,
      };
      try {
        await this.$axios.post(`cancel-order`, payload);
        this.close();
        this.$emit("response", "Order Has been cancelled.");
      } catch (error) {
        this.errorResponse = error?.response?.data?.message || "Unknown error";
        this.loading = false;
      }
    },
  },
};
</script>
