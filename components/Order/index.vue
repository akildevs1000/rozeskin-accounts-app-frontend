<template>
  <span>
    <!-- <v-row>
      <v-col cols="3" v-for="(stat, index) in stats" :key="index">
        <v-card outlined>
          <v-card-text>
            <div class="d-flex justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-medium mb-2">
                  {{ stat.label }}
                </div>
                <div
                  class="font-weight"
                  :class="`${stat.color}--text`"
                  style="font-size: 18px"
                >
                  {{ stat.value }}
                </div>
              </div>
              <div>
                <v-btn fab :class="stat.color" text small
                  ><v-icon color="white">{{ stat.icon }}</v-icon></v-btn
                >
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row> -->
    <v-row>
      <v-col>
        <v-card>
          <v-container fluid>
            <v-row>
              <v-col cols="1">Orders</v-col>
              <v-col>
                <v-text-field class="" label="Search..." dense outlined flat v-model="filters.search"
                  hide-details></v-text-field>
              </v-col>
              <v-col>
                <v-autocomplete v-model="filters.customer_id" :items="customer_list" item-text="customer_with_phone"
                  item-value="id" label="Customers" outlined dense hide-details></v-autocomplete>
              </v-col>
              <v-col>
                <v-autocomplete :items="statusList" item-text="name" item-value="id" label="Status" dense outlined flat
                  v-model="filters.order_status" hide-details></v-autocomplete>
              </v-col>
              <v-col>
                <v-autocomplete v-model="filters.business_source_id" :items="business_sources" item-text="name"
                  item-value="id" label="Business Source" outlined dense hide-details></v-autocomplete>
              </v-col>
              <v-col>
                <v-autocomplete v-model="filters.delivery_service_id" :items="delivery_services" item-text="name"
                  item-value="id" label="Deliver Service" outlined dense hide-details></v-autocomplete>
              </v-col>
              <v-col>
                <v-autocomplete v-model="filters.payment_method" :items="payment_modes" item-text="name" item-value="id"
                  label="Payment Mode" outlined dense hide-details></v-autocomplete>
              </v-col>
              <v-col cols="2">
                <FiltersDateRange @filter-attr="
                    ({ from, to }) => {
                      filters['from'] = from;
                      filters['to'] = to;
                    }
                  " />
              </v-col>
              <v-col><v-btn :loading="loading" block small class="primary"
                  @click="getDataFromApi">Submit</v-btn></v-col>
            </v-row>
          </v-container>
        </v-card>
        <v-card class="mt-5">
          <v-data-table dense :headers="headers" :items="items" :loading="loading" :options.sync="options"
            :footer-props="{
              itemsPerPageOptions: [10, 30, 50, 100],
              showFirstLastPage: true,
              itemsPerPageText: 'Rows per page',
              pageText: `{0}-{1} of {2}`,
            }" :server-items-length="totalItems" class="elevation-1 pa-3">
            <template v-slot:top>
              <v-toolbar flat dense class="mb-5">
                <v-spacer></v-spacer>
                <OrderCreate :model="Model" :endpoint="endpoint" @response="getDataFromApi" />
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
              <v-btn v-if="item?.invoice?.reference_id && item?.order_status === 'processing'" dark text
                :class="`green lighten-1`" x-small class="ma-1">
                Complete
              </v-btn>
              <v-btn v-else dark text :class="item?.status_class" x-small class="ma-1">
                {{ item?.order_status }}
              </v-btn>
            </template>

            <template v-slot:item.options="{ item }">
              <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list dense>
                  <!-- <v-list-item>
                    <v-list-item-title>
                      <OrderBillSlip :key="invoiceCompKey" :model="Model" :item="item" />
                    </v-list-item-title>
                  </v-list-item> -->
                  <v-list-item>
                    <v-list-item-title>
                      <OrderEdit :model="Model" :endpoint="endpoint" :item="item" @response="
                          () => {
                            invoiceCompKey++;
                            getDataFromApi();
                          }
                        " />
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-title>
                      <OrderInvoice :key="invoiceCompKey" :model="Model" :endpoint="endpoint" :item="item"
                        @response="getDataFromApi" />
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <OrderCancel :model="Model" :endpoint="endpoint" :order_id="item.order_id" @response="
                          () => {
                            invoiceCompKey++;
                            getDataFromApi();
                          }
                        " />
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <OrderDelete :id="item.id" :endpoint="endpoint" @response="getDataFromApi" />
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
      {
        text: "Action",
        align: "center",
        sortable: false,
        value: "options",
      },
    ],
    componentKey: 1,
    customer_list: [],
    payment_modes: [],
    business_sources: [],
    delivery_services: [],
    totalItems:0
  }),

  async created() {
    // await this.getStats();

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
  methods: {
    async getDataFromApi() {
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
    async getStats() {
      try {
        const { data } = await this.$axios.get(this.endpoint + "-stats");

        console.log("🚀 ~ getStats ~ data:", data);
        this.stats = data;
      } catch (error) {
        this.items = [];
      }
    },
  },
};
</script>
