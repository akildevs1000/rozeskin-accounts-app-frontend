<template>
  <v-card>
      <v-alert flat class="grey lighten-3" dense>
        <span>Orders</span>
      </v-alert>
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              class=""
              label="Search..."
              dense
              outlined
              flat
              v-model="filters.search"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col>
            <v-autocomplete
              :items="[
                { id: null, name: 'Select All' },
                { id: 'Pending', name: 'Pending' },
                { id: 'Paid', name: 'Paid' },
                { id: 'Unpaid', name: 'Unpaid' },
                { id: 'Cancelled', name: 'Cancelled' },
              ]"
              item-text="name"
              item-value="id"
              label="Status"
              dense
              outlined
              flat
              v-model="filters.status"
              hide-details
            ></v-autocomplete>
          </v-col>
          <v-col>
            <v-autocomplete
              v-model="filters.business_source_id"
              :items="business_sources"
              item-text="name"
              item-value="id"
              label="Business Source"
              outlined
              dense
              hide-details
            ></v-autocomplete>
          </v-col>
          <v-col>
            <v-autocomplete
              v-model="filters.delivery_service_id"
              :items="delivery_services"
              item-text="name"
              item-value="id"
              label="Deliver Service"
              outlined
              dense
              hide-details
            ></v-autocomplete>
          </v-col>
          <v-col>
            <v-autocomplete
              v-model="filters.payment_method"
              :items="payment_modes"
              item-text="name"
              item-value="id"
              label="Payment Mode"
              outlined
              dense
              hide-details
            ></v-autocomplete>
          </v-col>
          <v-col cols="2">
            <FiltersDateRange
              @filter-attr="
                ({ from, to }) => {
                  filters['from'] = from;
                  filters['to'] = to;
                }
              "
            />
          </v-col>
          <v-col
            ><v-btn
              :loading="loading"
              block
              small
              class="primary"
              @click="getDataFromApi"
              >Submit</v-btn
            ></v-col
          >
          <v-col cols="12">
            <v-data-table
              dense
              :headers="headers"
              :items="items"
              :loading="loading"
              :options.sync="options"
              :footer-props="{
                itemsPerPageOptions: [100, 500, 1000],
              }"
              class="pa-3"
            >
              <template v-slot:item.payment="{ item }">
                <small>
                  {{ item.payment_method }}
                </small>
                <br />
                <small>
                  {{ item.payment_method_title }}
                </small>
              </template>

              <template v-slot:item.invoice="{ item }">
                <small>
                  {{ item?.invoice?.reference_id || "Pending" }}
                </small>
                <br />
                <small v-if="item?.invoice?.reference_id">
                  {{ item?.invoice?.date_time }}
                </small>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
</template>

<script>
export default {
  props: ["customer_id"],
  data: () => ({
    invoiceCompKey: 1,
    Model: "Orders",
    endpoint: "orders",
    filters: {
      search: null,
      status: null,
      business_source_id: null,
      delivery_service_id: null,
      payment_method: null,
      from: null,
      to: null,
    },
    options: {},
    loading: false,
    response: "",
    items: [],
    errors: [],
    headers: [
      {
        text: "Order id",
        value: "reference_id",
      },
      {
        text: "Order Ref",
        value: "order_id",
      },
      {
        text: "Tracking Id",
        value: "tracking_number",
      },
    
      {
        text: "Date Time",
        value: "date_time",
      },

      {
        text: "Payment",
        value: "payment",
      },

      {
        text: "Business Source",
        value: "business_source.name",
      },
      {
        text: "Delivery Service",
        value: "delivery_service.name",
      },
      {
        text: "Shipping Charges",
        value: "shipping_charges",
      },
      {
        text: "Total",
        value: "total",
      },
      {
        text: "Shipping Method",
        value: "shipping_method",
      },
      {
        text: "Invoice",
        value: "invoice",
      },
    ],
    componentKey: 1,
    payment_modes: [],
    business_sources: [],
    delivery_services: [],
  }),

  async created() {
    let { data: payment_modes } = await this.$axios.get(`payment-mode-list`);

    let result = payment_modes.map((e) => ({
      id: e.name,
      name: e.name,
    }));
    this.payment_modes = [{ id: null, name: "Select All" }, ...result];

    let { data: business_sources } = await this.$axios.get(
      `business-source-list`
    );
    this.business_sources = [
      { id: null, name: "Select All" },
      ...business_sources,
    ];

    let { data: delivery_services } = await this.$axios.get(
      `delivery-service-list`
    );

    this.delivery_services = [
      { id: null, name: "Select All" },
      ...delivery_services,
    ];
  },
  mounted() {},
  watch: {
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
  },
  methods: {
    async getDataFromApi() {
      this.loading = true;
      try {
        const { sortBy = [], sortDesc = [], page, itemsPerPage } = this.options;

        const params = {
          page,
          sortBy: sortBy[0] || "",
          sortDesc: sortDesc[0] || "",
          per_page: itemsPerPage,
          ...this.filters,
          customer_id:this.customer_id
        };

        const { data } = await this.$axios.get(this.endpoint, { params });
        this.items = data?.data || [];
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Optionally handle user notification or fallback
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
