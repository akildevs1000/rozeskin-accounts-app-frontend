<template>
  <v-dialog v-model="dialog" width="800">
    <AssetsIconClose left="790" @click="close" />
    <template v-slot:activator="{ on, attrs }">
      <div v-bind="attrs" v-on="on">
        <v-icon color="primary" small> mdi-cash </v-icon>
        Convert to Invoice
      </div>
    </template>

    <v-card>
      <v-alert flat class="grey lighten-3" dense>
        <span>Invoice</span>
      </v-alert>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-card outlined>
              <v-container>
                <v-row>
                  <v-col cols="12">Customer Info</v-col>
                  <v-col cols="6">
                    <v-text-field
                      readonly
                      outlined
                      dense
                      hide-details
                      v-model="payload.customer.first_name"
                      label="First Name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      readonly
                      outlined
                      dense
                      hide-details
                      v-model="payload.customer.last_name"
                      label="Last Name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      readonly
                      outlined
                      dense
                      hide-details
                      v-model="payload.customer.email"
                      label="Email"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="payload.customer.dob"
                      label="Date of Birth"
                      readonly
                      outlined
                      dense
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.customer.phone"
                      label="Phone"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.customer.whatsapp"
                      label="Whatsapp"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>

          <v-col cols="6">
            <v-card outlined>
              <v-container>
                <v-row>
                  <v-col cols="12">Shipping Address</v-col>
                  <v-col cols="12">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.shipping_address.address_1"
                      label="Address 1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.shipping_address.address_2"
                      label="Address 1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-autocomplete
                      outlined
                      dense
                      hide-details
                      v-model="payload.shipping_address.city"
                      :items="cities"
                      item-text="label"
                      item-value="value"
                      label="City"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.shipping_address.state"
                      label="State"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.shipping_address.postcode"
                      label="Post Code"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.shipping_address.country"
                      label="Country"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card outlined>
              <v-container>
                <v-row>
                  <v-col cols="12">Billing Address</v-col>
                  <v-col cols="12">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.billing_address.address_1"
                      label="Address 1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.billing_address.address_2"
                      label="Address 2"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-autocomplete
                      outlined
                      dense
                      hide-details
                      v-model="payload.billing_address.city"
                      :items="cities"
                      item-text="label"
                      item-value="value"
                      label="City"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.billing_address.state"
                      label="State"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.billing_address.postcode"
                      label="Post Code"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.billing_address.country"
                      label="Country"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card outlined>
              <v-container>
                <v-row>
                  <v-col cols="12">Other Info</v-col>
                  <v-col cols="4">
                    <v-text-field
                      type="number"
                      outlined
                      dense
                      hide-details
                      v-model="payload.order_id"
                      label="Order Id"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-autocomplete
                      v-model="payload.delivery_service_id"
                      :items="delivery_services"
                      item-text="name"
                      item-value="id"
                      label="Delivery Service"
                      outlined
                      dense
                      hide-details
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.tracking_number"
                      label="Tracking Number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="payload.business_source_id"
                      :items="business_sources"
                      item-text="name"
                      item-value="id"
                      label="Business Source"
                      outlined
                      dense
                      hide-details
                    ></v-autocomplete>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.shipping_method"
                      label="Shipping Method"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.payment_method"
                      label="Payment Mode"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.payment_method_title"
                      label="Payment Mode Title"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-autocomplete
                      v-model="payload.status"
                      :items="['Paid', 'Unpaid', 'Cancelled']"
                      label="Status"
                      outlined
                      dense
                      hide-details
                    ></v-autocomplete>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
          <v-col>
            <style scoped>
              .order-table {
                font-family: arial, sans-serif;
                border-collapse: collapse;
                width: 100%;
              }

              .order-table td,
              .order-table th {
                border: 1px solid #dddddd;
                text-align: left;
                padding: 8px;
              }
              .right-align-input .v-text-field__slot > input {
                text-align: right !important;
              }
            </style>
            <table class="order-table">
              <tr class="grey lighten-3">
                <td width="200px">Product</td>
                <td class="text-right">Qty</td>
                <td class="text-right">Rate</td>
                <td class="text-right">Tax</td>
                <td class="text-right">Total</td>
              </tr>

              <tr cols="12" v-for="(item, index) in payload.items" :key="index">
                <td>
                  <v-text-field
                    flat
                    v-model="item.item"
                    dense
                    hide-details
                    placeholder="Product"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    class="right-align-input"
                    type="number"
                    dense
                    hide-details
                    v-model="item.quantity"
                    @input="doCalculate(item)"
                  >
                  </v-text-field>
                </td>
                <td>
                  <v-text-field
                    class="right-align-input"
                    type="number"
                    dense
                    hide-details
                    v-model="item.rate"
                    @input="doCalculate(item)"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    class="right-align-input"
                    type="number"
                    dense
                    hide-details
                    v-model="item.tax"
                    @input="doCalculate(item)"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    readonly
                    class="right-align-input"
                    type="number"
                    dense
                    hide-details
                    v-model="item.total"
                  ></v-text-field>
                </td>
              </tr>
            </table>
          </v-col>
          <v-col cols="12" class="">
            <v-row>
              <v-col cols="8"> </v-col>
              <v-col cols="4">
                <div>
                  <div class="d-flex justify-end justify-space-between">
                    <div>
                      <small style="font-size: 11px !important"
                        >Shipping Chargres</small
                      >
                    </div>
                    <div>
                      <small>
                        <input
                          style="
                            font-size: 11px !important;
                            color: #868686;
                            border: none;
                            border-bottom: 1px solid #ccc;
                            outline: none;
                            box-shadow: none;
                            text-align: right;
                            width: 100px;
                          "
                          type="number"
                          v-model="payload.shipping_charges"
                          @input="getGrandTotal"
                        />
                      </small>
                    </div>
                  </div>
                  <div class="d-flex justify-end justify-space-between">
                    <div>
                      <small style="font-size: 11px !important">Discount</small>
                    </div>
                    <div>
                      <small>
                        <input
                          style="
                            font-size: 11px !important;
                            color: #868686;
                            border: none;
                            border-bottom: 1px solid #ccc;
                            outline: none;
                            box-shadow: none;
                            text-align: right;
                            width: 100px;
                          "
                          type="number"
                          v-model="payload.discount"
                          @input="getGrandTotal"
                        />
                      </small>
                    </div>
                  </div>
                  <div class="d-flex justify-end justify-space-between">
                    <div><small>Total</small></div>
                    <div>
                      <small>{{ payload.total }}</small>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
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
      payload: {
        status: "Unpaid",
        user_id: 1,
        username: "admin_rozeskin",
        email: "rozeskincaredubai@gmail.com",
        order_id: 0,
        order_date: "2025-01-27 16:13:44",
        order_status: "pending",
        currency: "AED",
        total: null,
        payment_method: null,
        payment_method_title: null,
        shipping_method: "Free shipping",
        shipping_charges: 0,
        discount: 0,

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
      business_source_id: business_sources[0]?.id || 0,
      delivery_service_id: delivery_services[0]?.id || 0,
      shipping_address: this.item.customer.shipping_address,
      billing_address: this.item.customer.billing_address,
    };

    const method = this.payload.payment_method?.toLowerCase();
    this.payload.status = method === "cod" ? "Unpaid" : "Paid";
  },
  methods: {
    getProductDetails(item) {
      if (!item.item) return;
      item.quantity = item.item.qty;
      item.rate = parseFloat(item.item.price);
      let sub_total = item.quantity * item.rate;
      item.tax = 0;
      item.total = sub_total + item.tax;
      this.getGrandTotal();
    },
    doCalculate(item) {
      let sub_total = parseFloat(item.quantity) * parseFloat(item.rate);
      item.total = sub_total;
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
      this.payload.total =
        this.payload.items.reduce((cur, acc) => cur + acc.total, 0) -
        parseFloat(this.payload.discount || 0);
    },

    close() {
      this.dialog = false;
      this.loading = false;
      this.errorResponse = null;
    },
    async submit() {
      let payload = {
        order_id: this.item.id,
        customer_id: this.payload.customer.id,
        business_source_id: this.payload.business_source_id || null,
        delivery_service_id: this.payload.delivery_service_id || null,
        tracking_number: this.payload.tracking_number || null,
        status: this.payload.status,

        discount: this.payload.discount,
        total : this.payload.total,
      };

      this.loading = true;
      try {
        await this.$axios.post(`invoices`, payload);
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
