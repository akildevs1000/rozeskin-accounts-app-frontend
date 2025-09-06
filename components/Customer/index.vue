<template>
  <v-card style="background: none">
    <v-dialog persistent v-model="myDialog" width="1300">
      <AssetsIconClose left="1290" @click="myDialog = false" />
      <CustomerOrders :key="customer_id" :customer_id="customer_id" />
    </v-dialog>
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
              v-model="filters.customer_id"
              :items="customer_list"
              item-text="customer_with_phone"
              item-value="id"
              label="Customers"
              outlined
              dense
              hide-details
            ></v-autocomplete>
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
    <v-card class="mt-5">
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
            {{ Model }}
            <v-icon color="primary" right class="mt-1" @click="getDataFromApi()"
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
  </v-card>
</template>

<script>
export default {
  data: () => ({
    customer_id: 0,
    myDialog: false,
    Model: "Customer",
    endpoint: "customers",
    filters: {},
    options: {
      page: 1,
      itemsPerPage: 100,
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
    customer_list: [],
    errors: [],
    headers: [
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
    componentKey: 1,
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
  methods: {
    async getDataFromApi() {
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
        let { data } = await this.$axios.get(this.endpoint, { params });
        this.items = data.data;
        this.totalItems = data.total || data.meta?.total || this.items.length;
      } catch (e) {
        this.items = [];
      }
      this.loading = false;
    },
  },
};
</script>
