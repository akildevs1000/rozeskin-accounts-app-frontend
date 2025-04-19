<template>
  <v-dialog v-model="dialog" width="700">
    <AssetsIconClose left="690" @click="close" />
    <template v-slot:activator="{ on, attrs }">
      <div v-bind="attrs" v-on="on">
        <v-icon color="primary" small> mdi-cash </v-icon>
        Record Payment
      </div>
    </template>

    <v-card>
      <v-alert flat class="grey lighten-3" dense>
        <span>Payment For {{ item.invoice_reference_id }}</span>
      </v-alert>

      <v-card-text v-if="payload && payload.id">
        <v-row>
          <v-col cols="3">Customer</v-col>
          <v-col cols="9">
            <v-text-field
              outlined
              dense
              hide-details
              v-model="payload.customer.full_name"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3">Total</v-col>
          <v-col cols="9">
            <v-text-field
              readonly
              outlined
              dense
              hide-details
              v-model="payload.total"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3">Amount Paid</v-col>
          <v-col cols="9">
            <v-text-field
              readonly
              outlined
              dense
              hide-details
              v-model="previously_paid"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3">Amount Receiveable</v-col>
          <v-col cols="9">
            <v-text-field
              outlined
              dense
              hide-details
              v-model="payload.paid_amount"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3">Payment Mode</v-col>
          <v-col cols="9">
            <v-autocomplete
              v-model="payload.payment_mode_id"
              :items="payment_modes"
              item-text="name"
              item-value="id"
              outlined
              dense
              hide-details
            ></v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3">Payment Reference</v-col>
          <v-col cols="9">
            <v-text-field
              outlined
              dense
              hide-details
              v-model="payload.payment_reference"
            ></v-text-field>
          </v-col>
          <v-col cols="12" v-if="errorResponse">
            <span class="red--text">{{ errorResponse }}</span>
          </v-col>
          <v-col v-if="payload.paid_amount > 0" cols="12" class="text-right">
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
  props: ["item", "endpoint", "model"],
  data() {
    return {
      payload: {
        status: "Unpaid",
        order_id: 0,
        total: 0,
        payment_mode_id: 1,
        payment_reference: null,
      },
      dialog: false,
      loading: false,
      successResponse: null,
      errorResponse: null,
      payment_modes: [],
      business_sources: [],
      delivery_services: [],
      products: [],
      previously_paid: 0,
      remaing_amount_to_pay: 0,
    };
  },
  async created() {
    let { data: products } = await this.$axios.get(`product-list`);
    this.products = products;

    let { data } = await this.$axios.get(`payment-mode-list`);

    this.payment_modes = data;

    let { order } = this.item;

    this.payload = order;

    let total_paid_amount = parseFloat(order.total_paid_amount);

    this.previously_paid = total_paid_amount;

    let total = parseFloat(order.total);

    this.payload.paid_amount = parseFloat(
      (total - total_paid_amount).toFixed(2)
    );

    this.remaing_amount_to_pay = parseFloat(total - total_paid_amount);
  },
  methods: {
    getProductDetails(item) {
      item.quantity = item.item.qty;
      item.rate = parseFloat(item.item.price);
      item.subtotal = item.quantity * item.rate;
    },
    doCalculate(item) {
      item.subtotal = item.quantity * item.rate;
    },
    addTaxOnSubtotal(item) {
      item.total = item.subtotal + parseFloat(item.tax);

      this.payload.total = this.payload.items.reduce(
        (cur, acc) => cur + acc.total,
        0
      );
    },
    addItem() {
      this.payload.items.push({
        item: "Rice Moisturizing Facial Cleanser",
        quantity: 1,
        rate: 1,
        subtotal: 1,
        tax: 1,
        total: 1,
      });
    },
    deleteItem() {
      if (this.payload.items.length < 2) return;
      this.payload.items.pop();
    },

    close() {
      this.dialog = false;
      this.loading = false;
      this.errorResponse = null;
    },
    async submit() {
      this.errorResponse = null;

      let order = this.payload;

      let paid_amount = parseFloat(order.paid_amount);

      let status = "Unpaid";

      if (paid_amount > this.remaing_amount_to_pay) {
        this.errorResponse = "Cannot pay more than receiveable amount";
        return;
      } else if (parseFloat(order.paid_amount) == this.remaing_amount_to_pay) {
        status = "Paid";
      }

      this.loading = true;
      let payload = {
        invoice_id: this.item.id,
        order_id: this.item.order_id,
        customer_id: this.item.customer_id,
        payment_mode_id: order.payment_mode_id,
        payment_reference: order.payment_reference,
        paid_amount: paid_amount,
        status: status,
      };

      try {
        await this.$axios.post(`payments`, payload);
        this.close();
        this.$emit("response", "Record has been inserted");
      } catch (error) {
        this.errorResponse = error?.response?.data?.message || "Unknown error";
        this.loading = false;
      }
    },
  },
};
</script>
