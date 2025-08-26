<template>
  <v-dialog v-model="dialog" width="400">
    <AssetsIconClose left="390" @click="close" />
    <template v-slot:activator="{ on, attrs }">
      <div v-bind="attrs" v-on="on">
        <v-icon color="primary" small> mdi-cancel </v-icon>
        Cancel Order
      </div>
    </template>

    <v-card>
      <v-alert flat class="grey lighten-3" dense>
        <span>Canceling Order # {{ payload.order_id }}</span>
      </v-alert>

      <v-card-text>
        <v-row>
          <v-col cols="12">
           <v-textarea rows="3"
                  outlined
                  dense
                  hide-details
                  v-model="reason"
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
  props: ["item", "endpoint", "model"],
  data() {
    return {
      menu: false,
      reason:null,
      payload: {
        status: "Unpaid",
        user_id: 1,
        username: "admin_rozeskin",
        email: "rozeskincaredubai@gmail.com",
        order_id: 0,
        order_date: "2025-01-27 16:13:44",
        order_status: "pending",
        currency: "AED",
        total: 1,
        payment_method: "",
        payment_method_title: "",
        shipping_method: "",
        shipping_charges: 0,

        business_source_id: null,
        delivery_service_id: null,
        tracking_number: null,

        customer: {
          first_name: null,
          last_name: null,
          email: null,
          phone: null,
        },
        shipping_address: {
          address_1: null,
          address_2: null,
          city: null,
          state: null,
          postcode: null,
          country: null,
        },
        billing_address: {
          address_1: null,
          address_2: null,
          city: null,
          state: null,
          postcode: null,
          country: null,
        },
        items: [
          {
            item: "",
            quantity: 1,
            rate: 1,
            tax: 1,
            total: 1,
          },
        ],
      },
      dialog: false,
      loading: false,
      successResponse: null,
      errorResponse: null,
      payment_modes: [],
      business_sources: [],
      delivery_services: [],
      products: [],
      useAsBillingAddress: false,
      default_address: {
        address_1: null,
        address_2: null,
        city: null,
        state: null,
        postcode: null,
        country: null,
      },
      cities: require(`../../json/cities.json`),
    };
  },

  watch: {
    "payload.shipping_address.city"(newCity) {
      const matched = this.cities.find(
        (city) => city.label.toLowerCase() === newCity.toLowerCase()
      );
      if (matched) {
        this.payload.shipping_address.city = matched.value; // Assign value like "SHJ"
      }
    },
    "payload.billing_address.city"(newCity) {
      const matched = this.cities.find(
        (city) => city.label.toLowerCase() === newCity.toLowerCase()
      );
      if (matched) {
        this.payload.billing_address.city = matched.value; // Assign value like "SHJ"
      }
    },
    useAsBillingAddress(val) {
      this.payload.billing_address =
        val == true
          ? { ...this.payload.shipping_address }
          : { ...this.default_address };
    },

    "payload.customer.phone"(newVal) {
      this.payload.customer.whatsapp = newVal;
    },
  },
  async created() {
    let { data: products } = await this.$axios.get(`product-list`);
    this.products = products;

    let { data } = await this.$axios.get(`payment-mode-list`);
    this.payment_modes = data;

    let { data: business_sources } = await this.$axios.get(
      `business-source-list`
    );
    this.business_sources = business_sources;

    let { data: delivery_services } = await this.$axios.get(
      `delivery-service-list`
    );
    this.delivery_services = delivery_services;

    this.payload = {
      ...this.item,
      shipping_address: this.item.customer.shipping_address,
      billing_address: this.item.customer.billing_address,
    };
  },
  methods: {
    getProductDetails(payload) {
      let item = this.products.find(
        (e) => e.product_with_item_name == payload.item
      );
      if (!item) return;
      let qty = parseFloat(item?.qty || 0);
      let rate = parseFloat(item?.price || 0);
      payload.quantity = qty;
      payload.rate = rate;
      payload.tax = 0;
      payload.total = qty * rate + payload.tax;
      this.getGrandTotal();
    },
    doCalculate(item) {
      if (!item.item) return;
      let qty = parseFloat(item?.quantity || 0);
      let rate = parseFloat(item?.rate || 0);
      item.tax = 0;
      item.total = qty * rate + item.tax;
      this.getGrandTotal();
    },
    doTaxCalculate(item) {
      let qty = parseFloat(item?.quantity || 0);
      let rate = parseFloat(item?.rate || 0);
      let tax = parseFloat(0);
      item.total = qty * rate + tax;
      this.getGrandTotal();
    },
    addItem() {
      this.payload.items.push({
        item: "",
        quantity: 1,
        rate: 1,
        tax: 1,
        total: 1,
      });

      this.getGrandTotal();
    },
    deleteItem() {
      if (this.payload.items.length < 2) return;
      this.payload.items.pop();
      this.getGrandTotal();
    },
    getGrandTotal() {
      let sub_total = this.payload.items.reduce(
        (cur, acc) => cur + acc.total,
        0
      );

      this.payload.total =
        parseFloat(this.payload.shipping_charges || 0) + sub_total;
    },

    close() {
      this.dialog = false;
      this.loading = false;
      this.errorResponse = null;
    },
    async submit() {
      this.loading = true;
      let payload = {
        reason:this.reason,
      };
      try {
        await this.$axios.post(`cancel-order/${this.payload.order_id}`, payload);
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
