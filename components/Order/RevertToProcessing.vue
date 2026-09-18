<template>
  <v-dialog v-model="dialog" width="480">
    <AssetsIconClose left="470" @click="close" />

    <template v-slot:activator="{ on, attrs }">
      <div v-bind="attrs" v-on="on">
        <v-icon color="primary" small> mdi-undo-variant </v-icon>
        Revert to Processing
      </div>
    </template>

    <v-card>
      <v-alert flat class="grey lighten-3" dense>
        <span>Move order back to Processing</span>
      </v-alert>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <p class="mb-2">
              This undoes the convert-to-invoice for order
              <b>{{ item.order_id }}</b
              >.
            </p>
            <ul class="caption mb-0">
              <li>The order goes back to <b>processing</b>.</li>
              <li v-if="item.invoice">
                Invoice <b>{{ item.invoice.reference_id || item.invoice.id }}</b>
                is removed, so converting again raises a fresh one.
              </li>
              <li>Any stock deducted for it is added back.</li>
              <li v-if="item.tracking_number">
                The courier booking
                <b>{{ item.tracking_number }}</b> stays as it is — cancel that
                with the courier if the parcel should not ship.
              </li>
            </ul>
          </v-col>
          <v-col cols="12" v-if="errorResponse">
            <span class="red--text">{{ errorResponse }}</span>
          </v-col>
          <v-col cols="12" class="text-right">
            <AssetsButton
              :options="{
                label: `Close`,
                color: `red`,
              }"
              @click="close"
            />
            &nbsp;
            <AssetsButton
              :options="{
                label: loading ? `Working...` : `Revert`,
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
  props: ["item", "endpoint", "model"],
  data() {
    return {
      dialog: false,
      loading: false,
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
      if (this.loading) return;
      this.loading = true;

      let payload = {
        order_id: this.item.order_id,
        invoice_id: this.item?.invoice?.id || null,
      };

      try {
        await this.$axios.post(`revert-order-to-processing`, payload);
        this.close();
        this.$emit("response", "Order has been moved back to processing.");
      } catch (error) {
        this.errorResponse =
          error?.response?.data?.message || error?.message || "Unknown error";
        this.loading = false;
      }
    },
  },
};
</script>
