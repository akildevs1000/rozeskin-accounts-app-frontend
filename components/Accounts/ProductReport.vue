div
<template>
  <v-data-table
    dense
    :headers="customerHeaders"
    :items="sourceItems"
    :loading="loading"
    :options.sync="options"
    :footer-props="{
      itemsPerPageOptions: [10, 30, 50, 100],
      showFirstLastPage: true,
      itemsPerPageText: 'Rows per page',
      pageText: `{0}-{1} of {2}`,
    }"
    :server-items-length="sourceItemsTotal"
    class="elevation-0 pa-3"
  >
    <template v-slot:top>
      <v-row>
        <v-col cols="1">
          <div>Product Report</div>
        </v-col>
        <v-col cols="1">
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
        <v-col cols="2">
          <div style="">
            <FiltersDateRange
              @filter-attr="
                ({ from, to }) => {
                  filters['from'] = from;
                  filters['to'] = to;
                }
              "
            />
          </div>
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
    <template v-slot:item.display_image="{ item }">
      <v-avatar class="my-3" tile size="50" style="cursor: pointer">
        <img :src="item.display_image" alt="Image thumbnail" />
      </v-avatar>
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
        text: "Product Id",
        value: "item_number",
      },
      {
        text: "Description",
        value: "description",
      },
      {
        text: "Image",
        value: "display_image",
      },
      {
        text: "Product Category",
        value: "product_category.name",
      },
      {
        text: "Orders",
        value: "orders_count",
      },

      {
        text: "Total Amount",
        value: "orders_sum_total",
      },
    ],
    sourceItems: [],
    componentKey: 1,
    customer_list: [],
    payment_modes: [],
    business_sources: [],
    delivery_services: [],

    ordersByDate: [],
    ordersSumByDate: [],
    sourceItemsTotal: 0,
    totalItems: 0,
  }),

  async created() {
    let { data: business_sources } = await this.$axios.get(
      `business-source-list`
    );
    this.business_sources = [
      { id: null, name: "Select All" },
      ...business_sources,
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
        let data = await this.$axios.$get(`product-report`, { params });
        this.sourceItems = data;
        this.sourceItemsTotal =
          data.total || data.meta?.total || this.sourceItems.length;
      } catch (e) {
        this.items = [];
      }
      this.loading = false;
    },
  },
};
</script>
