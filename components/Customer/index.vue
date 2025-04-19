<template>
  <v-card style="background: none">
    <v-data-table
      dense
      :headers="headers"
      :items="items"
      :loading="loading"
      :options.sync="options"
      :footer-props="{
        itemsPerPageOptions: [100, 500, 1000],
      }"
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

      <template v-slot:item.shipping_address="{ item }">
        <div v-if="item.shipping_address">
          <ul class="pa-2">
            <li>
              <strong>Address 1:</strong> {{ item?.shipping_address?.address_1 }}
            </li>
            <li>
              <strong>Address 2:</strong> {{ item?.shipping_address?.address_2 }}
            </li>
            <li><strong>City:</strong> {{ item?.shipping_address?.city }}</li>
            <li><strong>State:</strong> {{ item?.shipping_address?.state }}</li>
            <li>
              <strong>Postcode:</strong> {{ item?.shipping_address?.postcode }}
            </li>
            <li>
              <strong>Country:</strong> {{ item?.shipping_address?.country }}
            </li>
          </ul>
        </div>
      </template>

      <template v-slot:item.billing_address="{ item }">
        <div v-if="item.billing_address">
          <ul class="pa-2">
            <li>
              <strong>Address 1:</strong> {{ item?.billing_address?.address_1 }}
            </li>
            <li>
              <strong>Address 2:</strong> {{ item?.billing_address?.address_2 }}
            </li>
            <li><strong>City:</strong> {{ item?.billing_address?.city }}</li>
            <li><strong>State:</strong> {{ item?.billing_address?.state }}</li>
            <li>
              <strong>Postcode:</strong> {{ item?.billing_address?.postcode }}
            </li>
            <li>
              <strong>Country:</strong> {{ item?.billing_address?.country }}
            </li>
          </ul>
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
</template>

<script>
export default {
  data: () => ({
    Model: "Customer",
    endpoint: "customers",
    filters: {},
    options: {},
    loading: false,
    response: "",
    items: [],
    errors: [],
    headers: [
      {
        text: "Full Name",
        value: "full_name",
      },
      {
        text: "Email",
        value: "email",
      },
      {
        text: "Phone",
        value: "phone",
      },
      {
        text: "Shipping Address",
        value: "shipping_address",
      },

      {
        text: "Billing Address",
        value: "billing_address",
      },

      {
        text: "Action",
        align: "center",
        sortable: false,
        value: "options",
      },
    ],
    componentKey: 1,
  }),

  async created() {
    this.getDataFromApi();
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
      let { data } = await this.$axios.get(this.endpoint);
      this.loading = false;
      this.items = data.data;
    },
  },
};
</script>
