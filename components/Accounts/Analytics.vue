<template>
  <v-container fluid>
    <v-row>
      <v-col cols="6">
        <v-card outlined>
          <v-card-text>
            <div class="d-flex justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-medium mb-2">
                  Total Orders Quantity
                </div>
                <div
                  class="font-weight"
                  :class="`primary--text`"
                  style="font-size: 18px"
                >
                  <b>{{ grandQtyTotal }}</b>
                </div>
              </div>
              <div>
                <v-btn fab :class="`primary`" text small
                  ><v-icon color="white">mdi-cart-outline</v-icon></v-btn
                >
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card outlined>
          <v-card-text>
            <div class="d-flex justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-medium mb-2">
                  Total Sales Value
                </div>
                <div
                  class="d-flex align-center font-weight teal--text"
                  style="font-size: 18px"
                >
                  <svg
                    viewBox="0 0 345 300"
                    style="
                      width: 15px;
                      height: auto;
                      margin-right: 4px;
                      fill: currentColor;
                    "
                  >
                    <path
                      d="M342 141l3 2v-8c0-17-12-31-27-31h-23C278 37 223 0 140 0H30s15 13 15 52v53H17c-5 0-10-2-14-6l-3-3v8c0 17 12 31 27 31h18v30H17c-5 0-10-2-14-6l-3-3v8c0 17 12 31 27 31h18v55s-15 11-15 50h110c86 0 140-37 155-105h33c5 0 10 2 14 6l3 3v-8c0-17-12-31-27-31h-19l1-15-1-15h28c5 0 10 2 14 6zm-252-126h46c62 0 97 27 108 90l-154 0V15zm46 270H90v-90l154 0c-10 57-42 88-108 90zm111-135H90v-30l157 0c0 10 0 20 0 30z"
                    />
                  </svg>
                  <b>{{ parseFloat(grandEarningTotal).toFixed(2) }}</b>
                </div>
              </div>
              <div>
                <v-btn fab :class="`teal`" text small
                  ><v-icon color="white">mdi-cash</v-icon></v-btn
                >
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-row>
          <v-col cols="1">Orders</v-col>
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
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-card flat>
          <v-container>
            <div style="height: 500px">
              <ChartsBar :chart-data="chartData" />
            </div>
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card flat>
          <v-container>
            <div style="height: 500px">
              <ChartsBar :chart-data="chartDataForSum" />
            </div>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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
      from: firstDay.toISOString().split("T")[0], // e.g. "2025-09-01"
      to: lastDay.toISOString().split("T")[0], // e.g. "2025-09-30"
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
    customerItems: [],
    componentKey: 1,
    customer_list: [],
    payment_modes: [],
    business_sources: [],
    delivery_services: [],

    ordersByDate: [],
    ordersSumByDate: [],
    customerItemsTotal: 0,
    totalItems: 0,
    grandQtyTotal: 0,
    grandEarningTotal: 0,
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
        this.ordersByDate = Array.isArray(res) ? res : [];

        this.grandQtyTotal = this.ordersByDate.reduce(
          (acc, cu) => acc + cu.total,
          0
        );
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
        this.ordersSumByDate = Array.isArray(res) ? res : [];

        console.log(this.ordersSumByDate);

        this.grandEarningTotal = this.ordersSumByDate.reduce(
          (acc, cu) => acc + parseFloat(cu.total),
          0
        );
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
        this.customerItemsTotal =
          data.total || data.meta?.total || this.customerItems.length;
      } catch (e) {
        this.items = [];
      }
      this.loading = false;
    },
  },
};
</script>
