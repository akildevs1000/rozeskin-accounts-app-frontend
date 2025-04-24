<template>
  <v-dialog v-model="dialog" width="800">
    <AssetsIconClose left="790" @click="close" />
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
        Edit <v-icon x-small class="ml-1 mr-3">mdi-pencil</v-icon>
      </span>
    </template>

    <v-card>
      <v-alert flat class="grey lighten-3" dense>
        <span>Edit</span>
      </v-alert>

      <v-card-text v-if="payload && payload.id">
        <v-row>
          <v-col cols="12">
            <v-card outlined>
              <v-container>
                <v-row>
                  <v-col cols="12">Customer Info</v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
                      v-model="payload.customer.first_name"
                      label="First Name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
                      v-model="payload.customer.last_name"
                      label="Last Name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
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
                      readonly
                      v-model="payload.customer.phone"
                      label="Phone"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
                      v-model="payload.customer.whatsapp"
                      label="Phone"
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
                      readonly
                      v-model="payload.shipping_address.address_1"
                      label="Address 1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
                      v-model="payload.shipping_address.address_2"
                      label="Address 1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
                      v-model="payload.shipping_address.city"
                      label="City"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
                      v-model="payload.shipping_address.state"
                      label="State"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
                      v-model="payload.shipping_address.postcode"
                      label="Post Code"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
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
                      readonly
                      v-model="payload.billing_address.address_1"
                      label="Address 1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
                      v-model="payload.billing_address.address_2"
                      label="Address 2"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
                      v-model="payload.billing_address.city"
                      label="City"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
                      v-model="payload.billing_address.state"
                      label="State"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
                      v-model="payload.billing_address.postcode"
                      label="Post Code"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      readonly
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
                      readonly
                      type="number"
                      outlined
                      dense
                      hide-details
                      v-model="payload.order.order_id"
                      label="Order Ref"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-autocomplete
                      v-model="payload.order.delivery_service_id"
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
                      v-model="payload.order.tracking_number"
                      label="Tracking Number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="payload.order.business_source_id"
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
                      v-model="payload.order.shipping_method"
                      label="Shipping Method"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="payload.order.payment_method"
                      :items="payment_modes"
                      item-text="name"
                      item-value="name"
                      label="Payment Mode"
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
                      v-model="payload.order.payment_method_title"
                      label="Payment Mode Title"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="payload.status"
                      :items="['Paid', 'Unpaid','Cancelled']"
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

              <tr
                cols="12"
                v-for="(item, index) in payload.order.items"
                :key="index"
              >
                <td>
                  <v-autocomplete
                    flat
                    append-icon=""
                    v-model="item.item"
                    :items="products"
                    item-text="product_with_item_name"
                    item-value="product_with_item_name"
                    dense
                    hide-details
                    placeholder="Product"
                    return-object
                  ></v-autocomplete>
                </td>
                <td>
                  <v-text-field
                    class="right-align-input"
                    type="number"
                    dense
                    hide-details
                    v-model="item.quantity"
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
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    class="right-align-input"
                    type="number"
                    dense
                    hide-details
                    v-model="item.tax"
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
                    <div><small>Shipping Chargress</small></div>
                    <div>
                      <small>
                        <input
                          style="
                            font-size: 11px !important;
                            color: #868686;
                            border: none;
                            outline: none;
                            box-shadow: none;
                            text-align: right;
                            width: 100px;
                          "
                          type="number"
                          v-model="payload.order.shipping_charges"
                        />
                      </small>
                    </div>
                  </div>
                  <div class="d-flex justify-end justify-space-between">
                    <div><small>Total</small></div>
                    <div>
                      <small>{{ payload?.order?.total }}</small>
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
        order_id: 52868,
        order_date: "2025-01-27 16:13:44",
        order_status: "pending",
        currency: "AED",
        total: "10.00",
        payment_method: "stripe_cc",
        payment_method_title: "Visa ending in 4242",
        shipping_method: "Free shipping",

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
            product_id: 49542,
            sku: "",
            name: "Rice Moisturizing Facial Cleanser",
            quantity: 1,
            subtotal: "10",
            total: "10",
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
    };
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
    addItem() {
      this.payload.items.push({
        product_id: 49542,
        sku: "",
        name: "Rice Moisturizing Facial Cleanser",
        quantity: 1,
        subtotal: "10",
        total: "10",
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
      this.loading = true;
      let payload = {
        id: this.item.id,
        order_id: this.item.order_id,
        business_source_id: this.payload.order.business_source_id,
        delivery_service_id: this.payload.order.delivery_service_id,
        tracking_number: this.payload.order.tracking_number,
        payment_method: this.payload.order.payment_method,
        payment_method_title: this.payload.order.payment_method_title,
        paid_amount: this.payload.order.paid_amount,
        status: this.payload.status,
      };
      try {
        await this.$axios.put(`${this.endpoint}/${this.item.id}`, payload);
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
