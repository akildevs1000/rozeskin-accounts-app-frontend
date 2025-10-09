<template>
  <span>
    <v-row>
      <v-col>
        <v-card>
          <v-container fluid>
            <v-row>
              <v-col cols="1">Orders</v-col>
              <v-col cols="2">
                <v-autocomplete
                  :items="[
                    { id: null, name: `All` },
                    { id: `Mapped`, name: `Mapped` },
                    { id: `Not Mapped`, name: `Not Mapped` },
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
              <v-col cols="2">
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
              <v-col cols="1"
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
            <template v-slot:item.status="{ item }">
              <span :class="item?.product ? 'green--text' : 'red--text'">{{
                item?.product ? "Product Id Mapped" : "Product Id Not Mapped"
              }}</span>
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
    invoiceCompKey: 1,
    Model: "Order Items",
    endpoint: "order-items",
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
        text: "Order Date",
        value: "order_date",
      },
      {
        text: "Item",
        value: "name",
      },
      {
        text: "Quantity",
        value: "quantity",
      },
      {
        text: "Rate",
        value: "rate",
      },
      {
        text: "Status",
        value: "status",
      },
    ],
    componentKey: 1,
    customer_list: [],
    payment_modes: [],
    business_sources: [],
    delivery_services: [],
    totalItems: 0,
  }),

  async created() {},
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
  },
};
</script>
