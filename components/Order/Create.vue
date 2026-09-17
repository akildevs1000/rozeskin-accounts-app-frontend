<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="800">
      <AssetsIconClose left="790" @click="close" />
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          small
          color="primary"
          class="white--text"
          dark
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="white" small> mdi-plus </v-icon> New
        </v-btn>
      </template>

      <v-card>
        <v-alert flat class="grey lighten-3" dense>
          <v-row>
            <v-col><span>Create Order</span></v-col>
            <v-col class="text-right"
              ><CustomerSearch @customer="getCustomerInfo"
            /></v-col>
          </v-row>
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
                        outlined
                        dense
                        hide-details
                        v-model="payload.customer.first_name"
                        label="First Name"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.customer.last_name"
                        label="Last Name"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.customer.email"
                        label="Email"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-menu
                        ref="menu"
                        v-model="menu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="payload.customer.dob"
                            label="Date of Birth"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            outlined
                            dense
                            hide-details
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="payload.customer.dob"
                          @input="menu = false"
                          :show-current="false"
                          no-title
                        ></v-date-picker>
                      </v-menu>
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
                    <v-col cols="6">Shipping Address</v-col>
                    <v-col cols="6" class="pa-0">
                      <v-checkbox
                        dense
                        hide-details
                        v-model="useAsBillingAddress"
                      >
                        <template v-slot:label>
                          <span style="font-size: 11px !important"
                            >Use as Billing Address</span
                          >
                        </template>
                      </v-checkbox></v-col
                    >
                    <v-col cols="12" v-if="shippingAddressItems.length">
                      <v-autocomplete
                        outlined
                        dense
                        hide-details
                        clearable
                        :items="shippingAddressItems"
                        item-text="label"
                        return-object
                        label="Use a saved address"
                        @change="applyShippingAddress"
                      ></v-autocomplete>
                    </v-col>
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
                        label="Address 2"
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
                        item-value="label"
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
                    <v-col cols="12" v-if="billingAddressItems.length">
                      <v-autocomplete
                        outlined
                        dense
                        hide-details
                        clearable
                        :items="billingAddressItems"
                        item-text="label"
                        return-object
                        label="Use a saved address"
                        @change="applyBillingAddress"
                      ></v-autocomplete>
                    </v-col>
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
                        item-value="label"
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
                      <v-menu
                        v-model="dateMenu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="payload.order_date"
                            label="Order Date"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            outlined
                            dense
                            hide-details
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="payload.order_date"
                          @input="dateMenu = false"
                          :show-current="false"
                          no-title
                        ></v-date-picker>
                      </v-menu>
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
                        v-model="payload.delivery_service_id"
                        :items="delivery_services"
                        item-text="name"
                        item-value="id"
                        label="Deliver Service"
                        outlined
                        dense
                        hide-details
                      ></v-autocomplete>
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

                    <v-col cols="4">
                      <v-autocomplete
                        v-model="payload.payment_method"
                        :items="payment_modes"
                        item-text="name"
                        item-value="name"
                        label="Payment Mode"
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
                        v-model="payload.payment_method_title"
                        label="Payment Mode Title"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="4">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.shipping_method"
                        label="Shipping Method"
                      ></v-text-field>
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
                .rzbundle-row td {
                  background: #fafafa;
                  border-top: none !important;
                }
                .rzbundle__label {
                  display: block;
                  font-size: 11px;
                  font-weight: 600;
                  color: #6b6b6b;
                  margin-bottom: 4px;
                }
                .rzbundle__warn {
                  font-size: 11px;
                  color: #c0392b;
                  margin-top: 4px;
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

                <template v-for="(item, index) in payload.items">
                <tr
                  cols="12"
                  :key="'row-' + index"
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
                      @change="getProductDetails(item)"
                    ></v-autocomplete>
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
                      @input="doTaxCalculate(item)"
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
                <!--
                  Any 3 / Any 4 are pick-your-own bundles: one priced line, but
                  the invoice never showed WHICH products the customer chose.
                  Staff have been working around this by adding 3-4 separate
                  0-rate lines by hand. This keeps it to the single priced line
                  the bundle actually is, and records the choice as a note
                  under it instead.
                -->
                <tr
                  v-if="isBundleItem(item.item)"
                  :key="'bundle-' + index"
                  class="rzbundle-row"
                >
                  <td colspan="5">
                    <div class="rzbundle">
                      <span class="rzbundle__label"
                        >Choose {{ bundleConfig(item.item).pick }} products
                        <template v-if="(item.bundle_choices || []).length"
                          >({{ (item.bundle_choices || []).length }} of
                          {{ bundleConfig(item.item).pick }} selected)</template
                        ></span
                      >
                      <v-autocomplete
                        v-model="item.bundle_choices"
                        :items="bundleConfig(item.item).options"
                        multiple
                        small-chips
                        deletable-chips
                        dense
                        hide-details
                        placeholder="Select the products the customer chose"
                        @change="applyBundleChoices(item)"
                      ></v-autocomplete>
                      <div
                        v-if="
                          (item.bundle_choices || []).length &&
                          (item.bundle_choices || []).length !==
                            bundleConfig(item.item).pick
                        "
                        class="rzbundle__warn"
                      >
                        This bundle needs exactly
                        {{ bundleConfig(item.item).pick }} products selected.
                      </div>
                    </div>
                  </td>
                </tr>
                </template>
              </table>
            </v-col>

            <v-col cols="12" class="">
              <v-row>
                <v-col cols="8">
                  <v-icon small @click="deleteItem" class="mr-1"
                    >mdi-delete</v-icon
                  ><v-icon small @click="addItem">mdi-plus-circle</v-icon>
                </v-col>
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
                        <small style="font-size: 11px !important"
                          >Discount</small
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
  </div>
</template>
<script>
export default {
  props: ["endpoint", "model"],

  data() {
    return {
      menu: false,
      dateMenu: false,
      payload: {
        user_id: 1,
        username: "admin_rozeskin",
        email: "rozeskincaredubai@gmail.com",
        order_id: 0,
        order_date: new Date().toISOString().slice(0, 10),
        order_status: "processing",
        currency: "AED",
        total: "10.00",
        payment_method: "COD",
        payment_method_title: "",
        shipping_method: "",
        shipping_charges: 0,
        discount: 0,
        business_source_id: 0,
        delivery_service_id: 0,
        tracking_number: 0,

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
            bundle_choices: [],
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
      // The two pick-your-own bundles, keyed on the exact catalog name so a
      // row's own product selection tells us whether to show the picker.
      // Options are the real catalog names (products table), not invented.
      bundleCatalog: {
        "Any 3 for 99 AED Bundle": {
          pick: 3,
          options: [
            "Rice Facial Cleanser with Gojiberries | Aloevera for Deep Cleanse | Radiant Glow - Single",
            "Roze Coconut Milk Keratin Shampoo | Anti-hairfall | Anti - Dandruff | Anti - Frizz",
            "Rice Moisturizing Cream with Retinol & SPF 50 | Centella for 10X glow | No Dark Spots",
            "Roze Acne Control cleanser | For Oily or Acne prone skin | Pore Minimizer.",
            "Roze Velvet Glow Moisturizing Body Lotion | Brightening | SPF 50 | All Skin types",
            "Roze Black Gold Luxury Body Wash | Men & Women | Normal to Dry skin",
            "Roze Moisturizing Sunscreen | Lightweight Formula  | Suitable for All Skin Types | No White Cast",
            "All Natural | Blooming Rose lip balm | Soft, Bright Lips for All Ages",
          ],
        },
        "Any 4 Roze Skincare Products for 120 AED": {
          pick: 4,
          options: [
            "Rice Facial Cleanser with Gojiberries | Aloevera for Deep Cleanse | Radiant Glow - Single",
            "Roze Coconut Milk Keratin Shampoo | Anti-hairfall | Anti - Dandruff | Anti - Frizz",
            "Rice Moisturizing Cream with Retinol & SPF 50 | Centella for 10X glow | No Dark Spots",
            "Roze Acne Control cleanser | For Oily or Acne prone skin | Pore Minimizer.",
            "Roze Velvet Glow Moisturizing Body Lotion | Brightening | SPF 50 | All Skin types",
            "Roze Black Gold Luxury Body Wash | Men & Women | Normal to Dry skin",
            "Roze Moisturizing Sunscreen | Lightweight Formula  | Suitable for All Skin Types | No White Cast",
            "All Natural | Blooming Rose lip balm | Soft, Bright Lips for All Ages",
            "Roze 7 Day Glow Serum | Plumper, Bouncier Radiant skin Powered by Plant Extracts",
            "Roze Botanical Hair Growth Serum | Stops Hair Fall | Promotes Hair growth | Increases Volume",
          ],
        },
      },
      shippingAddressOptions: [],
      billingAddressOptions: [],
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
  computed: {
    shippingAddressItems() {
      return this.labelAddresses(this.shippingAddressOptions);
    },
    billingAddressItems() {
      return this.labelAddresses(this.billingAddressOptions);
    },
  },
  watch: {
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
  },
  methods: {
    getProductDetails(payload) {
      let item = this.products.find(
        (e) => e.product_with_item_name == payload.item
      );
      if (!item) return;
      let qty = parseFloat(item?.qty || 0);
      let rate = parseFloat(item?.price || 0);
      payload.product_id = item.item_number;
      payload.quantity = qty;
      payload.rate = rate;
      payload.tax = qty * rate * 0;
      payload.total = qty * rate + payload.tax;
      // Switching the product away from a bundle (or to a different one)
      // clears any earlier bundle selection so a stale choice from the
      // previous product never lingers.
      payload.bundle_choices = [];
      this.getGrandTotal();
    },
    // Any 3 / Any 4 pick-your-own bundles: the extra picker row only shows
    // for these two exact catalog names.
    isBundleItem(itemName) {
      return !!this.bundleCatalog[itemName];
    },
    bundleConfig(itemName) {
      return this.bundleCatalog[itemName] || { pick: 0, options: [] };
    },
    applyBundleChoices(item) {
      // Deliberately does not touch item.item: that field still has to match
      // a real catalog name for getProductDetails()'s rate/product lookup.
      // The choice is carried as its own field and only turned into text
      // when the order is actually submitted (see submit()).
      let max = this.bundleConfig(item.item).pick;
      if ((item.bundle_choices || []).length > max) {
        item.bundle_choices = item.bundle_choices.slice(0, max);
      }
    },
    doCalculate(item) {
      if (!item.item) return;
      let qty = parseFloat(item?.quantity || 0);
      let rate = parseFloat(item?.rate || 0);
      item.tax = qty * rate * 0;
      item.total = qty * rate + item.tax;
      this.getGrandTotal();
    },
    doTaxCalculate(item) {
      let qty = parseFloat(item?.quantity || 0);
      let rate = parseFloat(item?.rate || 0);
      let tax = parseFloat(item?.tax || 0);
      item.total = qty * rate + tax;
      this.getGrandTotal();
    },
    addItem() {
      this.payload.items.push({
        item: "",
        product_id: 0,
        quantity: 1,
        rate: 1,
        tax: 1,
        total: 1,
        bundle_choices: [],
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
        parseFloat(this.payload.shipping_charges || 0) +
        sub_total -
        parseFloat(this.payload.discount || 0);
    },
    getCustomerInfo(payload) {
      if (!payload) return;
      // Pull the saved-address lists out into the picker options; merge the rest.
      const {
        shipping_addresses = [],
        billing_addresses = [],
        ...rest
      } = payload;
      this.shippingAddressOptions = shipping_addresses || [];
      this.billingAddressOptions = billing_addresses || [];
      this.payload = {
        ...this.payload,
        ...rest,
      };
    },
    // Build the complete address (incl. address 2) for each saved row and
    // collapse exact duplicates so the same address isn't listed twice.
    labelAddresses(list) {
      const seen = new Set();
      const out = [];
      for (const a of list || []) {
        const label = this.formatFullAddress(a);
        if (!label || seen.has(label)) continue;
        seen.add(label);
        out.push({ ...a, label });
      }
      return out;
    },
    formatFullAddress(a) {
      return [a.address_1, a.address_2, a.city, a.state, a.postcode, a.country]
        .filter((p) => p != null && String(p).trim() !== "")
        .join(", ");
    },
    applyShippingAddress(addr) {
      if (!addr) return;
      this.payload.shipping_address = this.pickAddressFields(addr);
    },
    applyBillingAddress(addr) {
      if (!addr) return;
      this.payload.billing_address = this.pickAddressFields(addr);
    },
    pickAddressFields(addr) {
      return {
        address_1: addr.address_1 ?? null,
        address_2: addr.address_2 ?? null,
        city: addr.city ?? null,
        state: addr.state ?? null,
        postcode: addr.postcode ?? null,
        country: addr.country ?? null,
      };
    },
    close() {
      this.dialog = false;
      this.loading = false;
      this.errorResponse = null;
      this.shippingAddressOptions = [];
      this.billingAddressOptions = [];

      this.payload = {
        user_id: 1,
        username: "admin_rozeskin",
        email: "rozeskincaredubai@gmail.com",
        order_id: 0,
        order_date: new Date().toISOString().slice(0, 10),
        order_status: "processing",
        currency: "AED",
        total: "10.00",
        payment_method: "COD",
        payment_method_title: "",
        shipping_method: "",
        shipping_charges: 0,

        business_source_id: 0,
        delivery_service_id: 0,
        tracking_number: 0,

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
      };
    },
    // Short, printable form of a catalog name, for the note under a bundle
    // line - "Rice Facial Cleanser" rather than the full pipe-separated
    // marketing title. Falls back to the full name if nothing shorter is set.
    shortBundleLabel(fullName) {
      const map = {
        "Rice Facial Cleanser with Gojiberries | Aloevera for Deep Cleanse | Radiant Glow - Single":
          "Rice Facial Cleanser",
        "Roze Coconut Milk Keratin Shampoo | Anti-hairfall | Anti - Dandruff | Anti - Frizz":
          "Coconut Milk Keratin Shampoo",
        "Rice Moisturizing Cream with Retinol & SPF 50 | Centella for 10X glow | No Dark Spots":
          "Rice Moisturizing Cream",
        "Roze Acne Control cleanser | For Oily or Acne prone skin | Pore Minimizer.":
          "Acne Control Cleanser",
        "Roze Velvet Glow Moisturizing Body Lotion | Brightening | SPF 50 | All Skin types":
          "Velvet Glow Body Lotion",
        "Roze Black Gold Luxury Body Wash | Men & Women | Normal to Dry skin":
          "Black Gold Body Wash",
        "Roze Moisturizing Sunscreen | Lightweight Formula  | Suitable for All Skin Types | No White Cast":
          "Moisturizing Sunscreen",
        "All Natural | Blooming Rose lip balm | Soft, Bright Lips for All Ages":
          "Blooming Rose Lip Balm",
        "Roze 7 Day Glow Serum | Plumper, Bouncier Radiant skin Powered by Plant Extracts":
          "7 Day Glow Serum",
        "Roze Botanical Hair Growth Serum | Stops Hair Fall | Promotes Hair growth | Increases Volume":
          "Botanical Hair Growth Serum",
      };
      return map[fullName] || fullName;
    },
    async submit() {
      this.loading = true;
      let payload = this.payload;
      let ts = new Date().toTimeString().split(" ")[0];
      // The bundle choice only needs to travel as far as the printed note -
      // item.item stays the exact catalog name so it still matches on future
      // edits. Composed here, at submit time, rather than earlier, so the
      // note always reflects whatever is currently picked.
      let items = (payload.items || []).map((item) => {
        let choices = item.bundle_choices || [];
        return {
          ...item,
          bundle_note: choices.length
            ? choices.map((c) => this.shortBundleLabel(c)).join(", ")
            : null,
        };
      });
      try {
        await this.$axios.post(this.endpoint, {
          ...payload,
          items,
          order_date: payload.order_date + " " + ts
        });
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
