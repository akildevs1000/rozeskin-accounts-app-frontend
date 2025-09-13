<template>
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
    class="elevation-0 pa-3"
  >
    <template v-slot:top>
      <v-row>
        <v-col cols="1">City Report</v-col>
        <v-col cols="2">
          <v-autocomplete
            v-model="filters.city"
            :items="[{ label: 'Select All', value: null }, ...cities]"
            item-text="label"
            item-value="label"
            label="City"
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
            small
            class="primary"
            @click="getDataFromApi"
            >Submit</v-btn
          ></v-col
        >
      </v-row>
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
    customerHeaders: [
      {
        text: "city",
        value: "city",
      },
      {
        text: "Total Orders",
        value: "orders_count",
      },
      {
        text: "Orders Amount",
        value: "orders_sum_total",
      },
    ],
    customerItems: [],
    componentKey: 1,
    customerItemsTotal: 0,
    totalItems: 0,

    cities: require(`../../json/cities.json`),
  }),
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
        let { data } = await this.$axios.get(`city-report`, { params });
        this.customerItems = data;
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
