<template>
  <v-card style="background: none">
    <v-dialog persistent v-model="myDialog" width="1300">
        <AssetsIconClose left="1290" @click="myDialog = false" />
        <CustomerOrders :key="customer_id" :customer_id="customer_id" />
      </v-dialog>
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
</template>

<script>
export default {
  data: () => ({
    myDialog: false,
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
        text: "Ref #",
        value: "reference_id",
      },
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
        text: "City",
        value: "shipping_address.city",
      },
      {
        text: "Shipping Address",
        value: "shipping_address",
      },
      {
        text: "Orders",
        value: "orders_count",
      },
      {
        text: "Registed At",
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
