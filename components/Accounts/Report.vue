<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card outlined>
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
                  :items="statusList"
                  item-text="name"
                  item-value="id"
                  label="Status"
                  dense
                  outlined
                  flat
                  v-model="filters.order_status"
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
      </v-col>
    </v-row>
     <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            dense
            :headers="customerHeaders"
            :items="customerItems"
            :loading="loading"
            :options.sync="options"
            :footer-props="{
              itemsPerPageOptions: [10, 30, 50, 100],
              showFirstLastPage: true,
              itemsPerPageText: 'Rows per page',
              pageText: `{0}-{1} of {2}`,
            }"
            :server-items-length="customerItemsTotal"
            class="elevation-1 pa-3"
          >
            <template v-slot:top>
              <v-toolbar flat dense class="mb-5">
                {{ Model }}
                <v-icon
                  color="primary"
                  right
                  class="mt-1"
                  @click="getDataFromApi()"
                  >mdi-reload</v-icon
                >
                <v-spacer></v-spacer>
                <CustomerCreate
                  :model="Model"
                  :endpoint="endpoint"
                  @response="getDataFromApi"
                />
              </v-toolbar>
            </template>
            <template v-slot:item.full_name="{ item }">
              <div>{{ item?.full_name }}</div>
              <div>
                {{ item?.phone }}
              </div>
            </template>

            <template v-slot:item.shipping_address="{ item }">
              <div v-if="item.shipping_address">
                <small>
                  {{ item?.shipping_address?.address_1 }},{{
                    item?.shipping_address?.state
                  }},{{ item?.shipping_address?.postcode }}
                </small>
              </div>
            </template>

            <template v-slot:item.options="{ item }">
              <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list width="120" dense>
                  <v-list-item
                    @click="
                      () => {
                        customer_id = item.id;
                        myDialog = true;
                      }
                    "
                  >
                    <v-list-item-title>
                      <div>
                        <v-icon color="primary" small> mdi-cart </v-icon>
                        Orders
                      </div>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <CustomerEdit
                        :model="Model"
                        :endpoint="endpoint"
                        :item="item"
                        @response="getDataFromApi"
                      />
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <CustomerDelete
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
      <!-- <v-col cols="12">
        <v-card>
          <v-data-table
            dense
            :headers="headers"
            :items="items"
            :loading="loading"
            :options.sync="options"
            :footer-props="{
              itemsPerPageOptions: [10, 30, 50, 100],
              showFirstLastPage: true,
              itemsPerPageText: 'Rows per page',
              pageText: `{0}-{1} of {2}`,
            }"
            :server-items-length="totalItems"
            class="elevation-1 pa-3"
          >
            <template v-slot:top>
              <v-toolbar flat dense class="mb-5">
                Orders
                <v-spacer></v-spacer>
              </v-toolbar>
            </template>

            <template v-slot:item.payment="{ item }">
              <div>
                {{ item.payment_method }}
              </div>
              <div>
                {{ item.payment_method_title }}
              </div>
            </template>

            <template v-slot:item.invoice="{ item }">
              <div>
                {{ item?.invoice?.reference_id || "Pending" }}
              </div>
              <div v-if="item?.invoice?.reference_id">
                {{ item?.invoice?.date_time }}
              </div>
            </template>

            <template v-slot:item.special_instructions="{ item }">
              <div>
                {{
                  item?.special_instructions &&
                  item.special_instructions.length > 30
                    ? item.special_instructions.slice(0, 30) + "..."
                    : item?.special_instructions
                }}
              </div>
            </template>

            <template v-slot:item.order_status="{ item }">
              <v-btn
                v-if="
                  item?.invoice?.reference_id &&
                  item?.order_status === 'processing'
                "
                dark
                text
                :class="`green lighten-1`"
                x-small
                class="ma-1"
              >
                Complete
              </v-btn>
              <v-btn
                v-else
                dark
                text
                :class="item?.status_class"
                x-small
                class="ma-1"
              >
                {{ item?.order_status }}
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col> -->
      
    </v-row>
  </v-container>
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
      customer_id: null,
      payment_method: null,
      from: null,
      to: null,
    },
    options: {
      page: 1,
      itemsPerPage: 10,
      sortBy: [],
      sortDesc: [],
      groupBy: [],
      groupDesc: [],
      multiSort: false,
      mustSort: false,
    },
    loading: false,
    response: "",
    items: [],
    statusList: [],
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
        text: "Discount",
        value: "discount",
      },
      {
        text: "Total",
        value: "total",
      },
      {
        text: "Invoice",
        value: "invoice",
      },
      {
        text: "Status",
        value: "order_status",
      },
    ],
    customerHeaders: [
      {
        text: "Ref #",
        value: "reference_id",
      },
      {
        text: "Full Name",
        value: "full_name",
      },
      {
        text: "City",
        value: "shipping_address.city",
      },

      {
        text: "Orders",
        value: "orders_count",
      },

      {
        text: "Total Amount",
        value: "orders_sum_total",
      },
      {
        text: "Profile Created At",
        value: "date_time",
      },
      {
        text: "Action",
        align: "center",
        sortable: false,
        value: "options",
      },
    ],
    customerItems:[],
    componentKey: 1,
    customer_list: [],
    payment_modes: [],
    business_sources: [],
    delivery_services: [],

    ordersByDate: [],
    ordersSumByDate: [],
    customerItemsTotal:0,
    totalItems: 0,
  }),

  async created() {
    let { data: payment_modes } = await this.$axios.get(`payment-mode-list`);

    this.customer_list = await this.$axios.$get(`customer-list`);

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

    let { data: statusList } = await this.$axios.get(`status-list`);

    this.statusList = [{ id: null, name: "Select All" }, ...statusList];
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
  computed: {
    chartData() {
      const rows = Array.isArray(this.ordersByDate) ? this.ordersByDate : [];
      return {
        labels: rows.map((o) => o.date),
        datasets: [
          {
            label: "Total Orders Quantity",
            backgroundColor: "#42A5F5",
            data: rows.map((o) => o.total),
          },
        ],
      };
    },
    chartDataForSum() {
      const rows = Array.isArray(this.ordersSumByDate)
        ? this.ordersSumByDate
        : [];
      return {
        labels: rows.map((o) => o.date),
        datasets: [
          {
            label: "Total Orders Earning",
            backgroundColor: "#42A5F5",
            data: rows.map((o) => parseFloat(o.total)),
          },
        ],
      };
    },
  },
  methods: {
    statusColor(status) {
      switch (status.toLowerCase()) {
        case "Processing":
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
        // Run in parallel if independent
        await Promise.all([
          this.getStats(),
          this.fetchData(),
          this.getOrderList(),
          this.getCustomerData(),
        ]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        this.$toast?.error("Error loading data"); // optional user feedback
      } finally {
        this.loading = false; // ensure loading is reset
      }
    },
    async fetchData() {
      try {
        const res = await this.$axios.$get("/order-qty-by-date", {
          params: {
            from_date: this.filters.from,
            to_date: this.filters.to,
          },
        });
        this.ordersByDate = Array.isArray(res) ? res : []; // ✅ safety
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        this.ordersByDate = [];
      }

      try {
        const res = await this.$axios.$get("/order-sum-by-date", {
          params: {
            from_date: this.filters.from,
            to_date: this.filters.to,
          },
        });
        this.ordersSumByDate = Array.isArray(res) ? res : []; // ✅ safety
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    },
    async getStats() {
      try {
        const { data } = await this.$axios.get("orders-stats-by-date", {
          params: {
            from_date: this.filters.from,
            to_date: this.filters.to,
          },
        });

        console.log("🚀 ~ getStats ~ data:", data);
        this.stats = data;
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    },
    async getOrderList() {
      this.loading = true;
      try {
        const { sortBy = [], sortDesc = [], page, itemsPerPage } = this.options;

        let params = {
          page,
          per_page: itemsPerPage,
          ...this.filters,
        };

        // Optionally add sorting
        if (sortBy && sortBy.length) {
          params.sort_by = sortBy[0];
          params.sort_desc = sortDesc[0] || false;
        }

        const { data } = await this.$axios.get(this.endpoint, { params });
        this.items = data?.data || [];
        this.totalItems = data.total || data.meta?.total || this.items.length;
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Optionally handle user notification or fallback
      } finally {
        this.loading = false;
      }
    },
    async getCustomerData() {
      this.loading = true;
      // Use options for pagination
      const { page, itemsPerPage, sortBy, sortDesc } = this.options;
      let params = {
        page,
        per_page: itemsPerPage,
        ...this.filters,
      };
      // Optionally add sorting
      if (sortBy && sortBy.length) {
        params.sort_by = sortBy[0];
        params.sort_desc = sortDesc[0] || false;
      }
      try {
        let { data } = await this.$axios.get(`customers`, { params });
        this.customerItems = data.data;
        this.customerItemsTotal = data.total || data.meta?.total || this.customerItems.length;
      } catch (e) {
        this.items = [];
      }
      this.loading = false;
    },
  },
};
</script>
