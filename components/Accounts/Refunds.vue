<template>
  <div>
    <v-row dense class="align-center mb-2">
      <v-col cols="12" sm="4">
        <v-menu
          v-model="monthMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              :value="month"
              label="Month"
              prepend-inner-icon="mdi-calendar"
              readonly
              outlined
              dense
              hide-details
              v-bind="attrs"
              v-on="on"
            />
          </template>
          <v-date-picker
            v-model="month"
            type="month"
            no-title
            @input="
              monthMenu = false;
              load();
            "
          />
        </v-menu>
      </v-col>
      <v-col cols="12" sm="4">
        <div class="subtitle-1">
          Total refunded:
          <b class="red--text">AED {{ money(total) }}</b>
        </div>
      </v-col>
      <v-col cols="12" sm="4" class="text-right">
        <v-btn color="primary" small @click="dialog = true">
          <v-icon left small>mdi-plus</v-icon> Add refund
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      dense
      :items-per-page="25"
    >
      <template v-slot:item.order_value="{ item }">
        {{ money(item.order_value) }}
      </template>
      <template v-slot:item.refund_value="{ item }">
        <span class="red--text font-weight-bold">
          {{ money(item.refund_value) }}
        </span>
      </template>
      <template v-slot:item.restocked="{ item }">
        <v-chip x-small :color="item.restocked ? 'green' : 'grey'" dark>
          {{ item.restocked ? "Yes" : "No" }}
        </v-chip>
      </template>
      <template v-slot:item.created_at="{ item }">
        {{ (item.created_at || "").substring(0, 10) }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small color="red" @click="remove(item)">mdi-delete</v-icon>
      </template>
    </v-data-table>

    <!-- add refund -->
    <v-dialog v-model="dialog" width="620" persistent>
      <v-card>
        <v-alert flat class="grey lighten-3" dense>
          <span>Record a refund</span>
        </v-alert>

        <v-card-text>
          <v-row dense class="align-center">
            <v-col cols="8">
              <v-text-field
                v-model="orderRef"
                label="Order Ref"
                placeholder="e.g. 61211"
                outlined
                dense
                hide-details
                @keyup.enter="lookup"
              />
            </v-col>
            <v-col cols="4">
              <v-btn color="primary" small :loading="looking" @click="lookup">
                Find order
              </v-btn>
            </v-col>
          </v-row>

          <div v-if="lookupError" class="red--text caption mt-2">
            {{ lookupError }}
          </div>

          <!-- the order fills these in: they are what makes stock work -->
          <div v-if="found">
            <v-divider class="my-4" />
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  :value="found.customer_id"
                  label="Customer ID"
                  readonly
                  outlined
                  dense
                  hide-details
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  :value="found.customer_name"
                  label="Customer name"
                  readonly
                  outlined
                  dense
                  hide-details
                />
              </v-col>
              <v-col cols="6" class="mt-2">
                <v-text-field
                  :value="found.phone"
                  label="Phone"
                  readonly
                  outlined
                  dense
                  hide-details
                />
              </v-col>
              <v-col cols="6" class="mt-2">
                <v-text-field
                  :value="money(found.order_value)"
                  label="Order value (AED)"
                  readonly
                  outlined
                  dense
                  hide-details
                />
              </v-col>
            </v-row>

            <div class="caption grey--text mt-2">
              Status: <b>{{ found.order_status }}</b> &nbsp;|&nbsp; Payment:
              <b>{{ found.payment_method }}</b>
              <span v-if="found.already_refunded > 0" class="red--text">
                &nbsp;|&nbsp; already refunded:
                <b>AED {{ money(found.already_refunded) }}</b>
              </span>
            </div>

            <v-divider class="my-4" />

            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="refundValue"
                  label="Refund value (AED)"
                  type="number"
                  outlined
                  dense
                  hide-details
                  autofocus
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="reason"
                  label="Reason"
                  outlined
                  dense
                  hide-details
                />
              </v-col>
            </v-row>

            <v-checkbox
              v-model="restock"
              class="mt-3"
              hide-details
              label="Goods came back - add them to stock"
            />
            <div class="caption grey--text ml-8">
              Leave this off for a goodwill or partial refund where the customer
              keeps the products, otherwise stock would be overstated.
            </div>
          </div>

          <div v-if="error" class="red--text caption mt-3">{{ error }}</div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text small @click="close">Cancel</v-btn>
          <v-btn
            color="green"
            dark
            small
            :disabled="!found || !refundValue"
            :loading="saving"
            @click="submit"
          >
            Save refund
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackColor" timeout="7000" top>
      {{ snackText }}
    </v-snackbar>
  </div>
</template>

<script>
export default {
  data() {
    const now = new Date();
    return {
      month:
        now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0"),
      monthMenu: false,
      loading: false,
      items: [],
      total: 0,
      dialog: false,
      orderRef: "",
      found: null,
      looking: false,
      lookupError: "",
      refundValue: "",
      reason: "",
      restock: false,
      saving: false,
      error: "",
      snackbar: false,
      snackText: "",
      snackColor: "success",
      headers: [
        { text: "Date", value: "created_at" },
        { text: "Order", value: "order_id" },
        { text: "Customer ID", value: "customer_id" },
        { text: "Name", value: "customer_name" },
        { text: "Phone", value: "phone" },
        { text: "Order value", value: "order_value", align: "end" },
        { text: "Refund value", value: "refund_value", align: "end" },
        { text: "Reason", value: "reason" },
        { text: "Restocked", value: "restocked", align: "center" },
        { text: "", value: "actions", sortable: false, align: "center" },
      ],
    };
  },
  created() {
    this.load();
  },
  methods: {
    money(n) {
      return Number(n || 0).toLocaleString("en-AE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    notify(text, color) {
      this.snackText = text;
      this.snackColor = color || "success";
      this.snackbar = true;
    },
    async load() {
      this.loading = true;
      try {
        const { data } = await this.$axios.get("refunds", {
          params: { month: this.month },
        });
        this.items = data.data || [];
        this.total = data.total || 0;
      } catch (e) {
        this.notify("Could not load refunds.", "error");
      } finally {
        this.loading = false;
      }
    },
    async lookup() {
      if (!this.orderRef) return;
      this.looking = true;
      this.lookupError = "";
      this.found = null;
      try {
        const { data } = await this.$axios.get("refunds/lookup", {
          params: { order_id: this.orderRef },
        });
        this.found = data;
        if (!this.refundValue) this.refundValue = data.order_value;
      } catch (e) {
        this.lookupError =
          e?.response?.data?.message || "No order found with that reference.";
      } finally {
        this.looking = false;
      }
    },
    close() {
      this.dialog = false;
      this.orderRef = "";
      this.found = null;
      this.refundValue = "";
      this.reason = "";
      this.restock = false;
      this.error = "";
      this.lookupError = "";
    },
    async submit() {
      this.saving = true;
      this.error = "";
      try {
        const { data } = await this.$axios.post("refunds", {
          order_id: this.found.order_pk,
          refund_value: Number(this.refundValue),
          reason: this.reason || null,
          restock: this.restock,
        });
        this.close();
        await this.load();
        this.notify(data.message || "Refund recorded.");
      } catch (e) {
        this.error =
          e?.response?.data?.message || "Could not save the refund.";
      } finally {
        this.saving = false;
      }
    },
    async remove(item) {
      if (!confirm(`Remove the refund of AED ${this.money(item.refund_value)}?`))
        return;
      try {
        const { data } = await this.$axios.delete(`refunds/${item.id}`);
        await this.load();
        this.notify(data.message || "Refund removed.");
      } catch (e) {
        this.notify("Could not remove the refund.", "error");
      }
    },
  },
};
</script>
