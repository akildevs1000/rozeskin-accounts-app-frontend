<template>
  <v-dialog v-model="dialog" width="800">
    <AssetsIconClose left="790" @click="close" />
    <template v-slot:activator="{ on, attrs }">
      <div v-bind="attrs" v-on="on">
        <v-icon color="primary" small> mdi-pencil </v-icon>
        Edit
      </div>
    </template>

    <v-card>
      <v-alert flat class="grey lighten-3" dense>
        <span>Edit</span>
      </v-alert>

      <v-card-text>
        <v-row>
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
                      label="Deliver Service"
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
                  <v-col cols="6">
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
                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      hide-details
                      v-model="payload.payment_method_title"
                      label="Payment Mode Title"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      rows="2"
                      outlined
                      dense
                      hide-details
                      v-model="payload.special_instructions"
                      label="Special Instructions"
                    ></v-textarea>
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
              .rzbundle__qty-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 3px 0;
              }
              .rzbundle__qty-name {
                font-size: 12px;
                color: #333;
              }
              .rzbundle__qty-input {
                max-width: 70px;
                flex: 0 0 auto;
              }
              .rzbundle__qty-input input {
                text-align: center;
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
              <tr cols="12" :key="'row-' + index">
                <td>
                  <!-- v-combobox, not v-autocomplete: real orders carry product names
                       from the full website catalog, which is larger than this app's
                       local products list. v-autocomplete only ever displays a value
                       it can find in :items, so any name outside the local list rendered
                       blank even though item.item held the correct value. v-combobox
                       always shows the current v-model text and still offers the local
                       list as suggestions/autofill via @change.

                       :items is a plain array of strings (productNames), not the raw
                       product objects: Vuetify 2's v-combobox does not reliably honour
                       item-value when items are objects — picking a suggestion from the
                       list set v-model to the whole raw object instead of its name string,
                       which then showed as "[object Object]" everywhere this line's name
                       was displayed, and broke the price-lookup match in
                       getProductDetails() (a string can never equal an object). Plain
                       strings sidestep that entirely: typed or picked, v-model is always
                       the text itself. -->
                  <v-combobox
                    flat
                    append-icon=""
                    v-model="item.item"
                    :items="productNames"
                    dense
                    hide-details
                    placeholder="Product"
                    @change="getProductDetails(item)"
                  ></v-combobox>
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
                      <template v-if="bundleTotalQty(item)"
                        >({{ bundleTotalQty(item) }} of
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
                    <!-- Same product picked more than once (e.g. 2x Rice Facial
                         Cleanser) needs its own qty control - a multi-select
                         can't represent "this option twice". -->
                    <div
                      v-for="name in item.bundle_choices"
                      :key="name"
                      class="rzbundle__qty-row"
                    >
                      <span class="rzbundle__qty-name">{{ name }}</span>
                      <v-text-field
                        type="number"
                        min="1"
                        dense
                        hide-details
                        outlined
                        class="rzbundle__qty-input"
                        v-model.number="item.bundle_qty[name]"
                      ></v-text-field>
                    </div>
                    <div
                      v-if="
                        bundleTotalQty(item) &&
                        bundleTotalQty(item) !== bundleConfig(item.item).pick
                      "
                      class="rzbundle__warn"
                    >
                      This bundle needs exactly
                      {{ bundleConfig(item.item).pick }} products selected
                      (currently {{ bundleTotalQty(item) }}).
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
                          v-model="payload.shipping_charges"
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
      menu: false,
      payload: {
        status: "Unpaid",
        user_id: 1,
        username: "admin_rozeskin",
        email: "rozeskincaredubai@gmail.com",
        order_id: 0,
        order_date: "2025-01-27 16:13:44",
        order_status: "Processing",
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
      // The two pick-your-own bundles, keyed on the exact catalog name so a
      // row's own product selection tells us whether to show the picker.
      // Options are the real catalog names (products table), not invented.
      // Kept in sync with the same map in Create.vue.
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
  },
  computed: {
    // Plain strings for v-combobox — see the note on the Product field above.
    productNames() {
      return this.products.map((p) => p.product_with_item_name);
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
      // Prefer this order's own frozen address; fall back to the customer's current one.
      shipping_address:
        this.item.shipping_address || this.item.customer.shipping_address,
      billing_address:
        this.item.billing_address || this.item.customer.billing_address,
    };

    // A bundle line saved earlier only carries bundle_note - bundle_choices
    // and bundle_qty (the full catalog names + per-product count the picker
    // needs) are rebuilt from it here so reopening an order for edit shows
    // the same selection rather than an empty picker. Current format is a
    // JSON [{name, qty}, ...] string (full catalog names); older orders may
    // still have the flat short-label comma list from before that change
    // (with a name repeated once per pick), so fall back to reversing and
    // counting that too. $set because bundle_qty is a fresh key on an
    // already-reactive item - plain assignment wouldn't track it.
    (this.payload.items || []).forEach((it) => {
      if (it.bundle_note && !it.bundle_choices) {
        let names = [];
        let qtyMap = {};
        try {
          const grouped = JSON.parse(it.bundle_note);
          grouped.forEach((g) => {
            qtyMap[g.name] = g.qty;
          });
          names = grouped.map((g) => g.name);
        } catch (e) {
          const shortNames = it.bundle_note.split(",").map((s) => s.trim());
          shortNames.forEach((s) => {
            const full = this.fullBundleLabel(s);
            if (!full) return;
            qtyMap[full] = (qtyMap[full] || 0) + 1;
          });
          names = Object.keys(qtyMap);
        }
        it.bundle_choices = names;
        this.$set(it, "bundle_qty", qtyMap);
      } else if (!it.bundle_qty) {
        this.$set(it, "bundle_qty", {});
      }
    });
  },
  methods: {
    getProductDetails(payload) {
      let item = this.products.find(
        (e) => e.product_with_item_name == payload.item
      );
      if (!item) return;
      let qty = parseFloat(item?.qty || 0);
      let rate = parseFloat(item?.price || 0);
      payload.product_id = item.id;
      payload.quantity = qty;
      payload.rate = rate;
      payload.tax = 0;
      payload.total = qty * rate + payload.tax;
      // Switching the product away from a bundle (or to a different one)
      // clears any earlier bundle selection so a stale choice from the
      // previous product never lingers.
      payload.bundle_choices = [];
      payload.bundle_qty = {};
      payload.bundle_note = null;
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
      // Keep bundle_qty in sync with which products are currently selected -
      // default a freshly-picked product to qty 1, drop qty for anything
      // deselected. $set/$delete because bundle_qty starts as a plain {}
      // and Vue 2 can't track new/removed keys on its own.
      if (!item.bundle_qty) item.bundle_qty = {};
      const selected = item.bundle_choices || [];
      selected.forEach((name) => {
        if (!item.bundle_qty[name]) this.$set(item.bundle_qty, name, 1);
      });
      Object.keys(item.bundle_qty).forEach((name) => {
        if (!selected.includes(name)) this.$delete(item.bundle_qty, name);
      });
    },
    // Total pieces picked across all distinct products in this bundle line -
    // the sum of each product's quantity, not the count of distinct products
    // (a customer can pick 2x of one product instead of 4 different ones).
    bundleTotalQty(item) {
      return Object.values(item.bundle_qty || {}).reduce(
        (sum, q) => sum + (parseInt(q, 10) || 0),
        0
      );
    },
    // Short, printable form of a catalog name, for the note under a bundle
    // line - "Rice Facial Cleanser" rather than the full pipe-separated
    // marketing title. Falls back to the full name if nothing shorter is set.
    shortBundleLabel(fullName) {
      return this.bundleLabelMap()[fullName] || fullName;
    },
    // The reverse of shortBundleLabel, used when reopening a saved order for
    // edit to turn its printed note back into the full catalog names the
    // multi-select needs.
    fullBundleLabel(shortName) {
      const map = this.bundleLabelMap();
      const found = Object.keys(map).find((full) => map[full] === shortName);
      return found || null;
    },
    bundleLabelMap() {
      return {
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
        bundle_choices: [],
        bundle_qty: {},
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
        (cur, acc) => parseFloat(cur) + parseFloat(acc.total),
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
    // Bundle picks are stored as a JSON string of {name, qty} pairs (full
    // catalog names, each with how many of that product were picked) so the
    // AWB PDF/invoice can print each chosen product as its own line item
    // rather than one flat comma list. Stays a plain string field either
    // way, so the existing "bundle_note is nullable|string" validation
    // still holds.
    groupBundleChoices(qtyMap) {
      if (!qtyMap) return null;
      let grouped = Object.keys(qtyMap)
        .filter((name) => (parseInt(qtyMap[name], 10) || 0) > 0)
        .map((name) => ({ name, qty: parseInt(qtyMap[name], 10) }));
      return grouped.length ? JSON.stringify(grouped) : null;
    },
    async submit() {
      this.loading = true;
      // The bundle choice only needs to travel as far as the printed note -
      // item.item stays the exact catalog name so it still matches on future
      // edits. Composed here, at submit time, rather than earlier, so the
      // note always reflects whatever is currently picked.
      let items = (this.payload.items || []).map((item) => {
        return {
          ...item,
          bundle_note: this.groupBundleChoices(item.bundle_qty),
        };
      });
      try {
        await this.$axios.put(`${this.endpoint}/${this.item.id}`, {
          ...this.payload,
          items,
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
