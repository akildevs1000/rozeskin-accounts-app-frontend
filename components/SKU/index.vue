<template>
  <v-card style="background: none">
    <v-dialog v-model="imageDialog" max-width="500">
      <AssetsIconClose left="490" @click="imageDialog = false" />
      <v-card>
        <v-img :src="selectedImage" aspect-ratio="1" contain />
      </v-card>
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
        <v-row>
          <v-col cols="6">
            <v-row>
              <v-col cols="2">
                <div>SKU</div>
              </v-col>
              <v-col cols="2">
                <v-autocomplete
                  v-model="filters.inventory_item_id"
                  :items="[
                    { id: null, item_number: `Select All` },
                    ...inventoryItems.filter((e) => e.item_number),
                  ]"
                  item-text="item_number"
                  item-value="id"
                  label="Inventory Items"
                  outlined
                  dense
                  hide-details
                ></v-autocomplete>
              </v-col>
              <v-col cols="4">
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
          </v-col>
          <v-col cols="6">
            <div style="display: flex; justify-content: end">
              <SKUCreate
                :model="Model"
                :endpoint="endpoint"
                @response="getDataFromApi"
              />
            </div>
          </v-col>
        </v-row>
      </template>
      <template v-slot:item.display_image="{ item }">
        <v-avatar
          class="my-3"
          tile
          size="50"
          @click="showImage(item?.inventory_item?.display_image)"
          style="cursor: pointer"
        >
          <img :src="item?.inventory_item?.display_image" alt="Image thumbnail" />
        </v-avatar>
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
                <SKUEdit
                  :model="Model"
                  :endpoint="endpoint"
                  :item="item"
                  @response="getDataFromApi"
                />
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                <Delete
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
    imageDialog: false,
    selectedImage: null,

    Model: "SKU",
    endpoint: "sku",
    filters: {},
    options: {},
    loading: false,
    response: "",
    items: [],
    errors: [],
    headers: [
      {
        text: "Inventory Item",
        value: "inventory_item.name",
      },
      {
        text: "Name",
        value: "name",
      },
      {
        text: "Qty Added",
        value: "qty_added",
      },
      {
        text: "Qty Available",
        value: "qty_available",
      },
      {
        text: "Image",
        value: "display_image",
      },
      
      {
        text: "Stock Date",
        value: "stock_date_display",
      },
      {
        text: "Action",
        align: "center",
        sortable: false,
        value: "options",
      },
    ],
    componentKey: 1,
    inventoryItems: [],
  }),

  async created() {
    try {
      this.inventoryItems = await this.$axios.$get(`inventory-items-list`);
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }

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
    showImage(image) {
      this.selectedImage = image;
      this.imageDialog = true;
    },
    async getDataFromApi() {
      this.loading = true;
      let config = {
        params: {
          ...this.filters,
        },
      };
      let { data } = await this.$axios.get(this.endpoint,config);
      this.loading = false;
      this.items = data.data;
    },
  },
};
</script>
