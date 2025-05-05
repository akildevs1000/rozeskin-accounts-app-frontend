<template>
  <span>
    <v-row>
      <v-col cols="3" v-for="(stat, index) in stats" :key="index">
        <v-card outlined>
          <v-card-text>
            <div class="d-flex justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-medium mb-2">
                  {{ stat.label }}
                </div>
                <div class="font-weight">{{ stat.value }}</div>
              </div>
              <div>
                <v-btn fab :class="stat.color" text small><v-icon color="white">{{ stat.icon }}</v-icon></v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-container fluid>
            <v-row>
              <v-col cols="1">Orders</v-col>
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
            </v-row>
          </v-container>
        </v-card>
        <v-card class="mt-5">
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
            <template v-slot:top>
              <v-toolbar flat dense class="mb-5">
                <v-spacer></v-spacer>
                <OrderCreate
                  :model="Model"
                  :endpoint="endpoint"
                  @response="getDataFromApi"
                />
              </v-toolbar>
            </template>

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

            <template v-slot:item.options="{ item }">
              <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list dense>
                  <v-list-item>
                    <v-list-item-title>
                      <OrderBillSlip
                        :key="invoiceCompKey"
                        :model="Model"
                        :item="item"
                      />
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <OrderEdit
                        :model="Model"
                        :endpoint="endpoint"
                        :item="item"
                        @response="
                          () => {
                            invoiceCompKey++;
                            getDataFromApi();
                          }
                        "
                      />
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <OrderInvoice
                        :key="invoiceCompKey"
                        :model="Model"
                        :endpoint="endpoint"
                        :item="item"
                        @response="getDataFromApi"
                      />
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <OrderDelete
                        :id="item.id"
                        :endpoint="endpoint"
                        @response="getDataFromApi"
                      />
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </span>
</template>

<script>
export default {
  data: () => ({
    stats: [],
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
      // {
      //   text: "Order #",
      //   value: "id",
      // },
      {
        text: "Order Ref",
        value: "order_id",
      },
      {
        text: "Tracking Id",
        value: "tracking_number",
      },
      {
        text: "Customer",
        value: "customer.full_name",
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

      {
        text: "Action",
        align: "center",
        sortable: false,
        value: "options",
      },
    ],
    componentKey: 1,
    payment_modes: [],
    business_sources: [],
    delivery_services: [],
  }),

  async created() {

    await this.getStats();


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
    statusColor(status) {
      switch (status.toLowerCase()) {
        case "Pending":
          return "orange--text";
        case "Paid":
          return "green--text";
        case "Dispatched":
          return "blue--text";
        case "Unpaid":
          return "red--text";
        case "Cancelled":
          return "red--text";
        default:
          return "grey--text"; // fallback
      }
    },
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
    async getStats() {
      try {
        const { data } = await this.$axios.get(this.endpoint + "-stats");

        console.log("🚀 ~ getStats ~ data:", data)
        this.stats = data;
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Optionally handle user notification or fallback
      }
    },
  },
};
</script>
