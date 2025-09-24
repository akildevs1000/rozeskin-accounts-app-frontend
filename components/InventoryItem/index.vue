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
        <v-toolbar flat dense class="mb-5">
          {{ Model }}
          <v-icon color="primary" right class="mt-1" @click="getDataFromApi()"
            >mdi-reload</v-icon
          >
          <v-spacer></v-spacer>
          <InventoryItemCreate
            :model="Model"
            :endpoint="endpoint"
            @response="getDataFromApi"
          />
        </v-toolbar>
      </template>
      <template v-slot:item.display_image="{ item }">
        <v-avatar
          class="my-3"
          tile
          size="50"
          @click="showImage(item.display_image)"
          style="cursor: pointer"
        >
          <img :src="item.display_image" alt="Image thumbnail" />
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
                <InventoryItemEdit
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

    Model: "Inventory Item",
    endpoint: "inventory-items",
    filters: {},
    options: {},
    loading: false,
    response: "",
    items: [],
    errors: [],
    headers: [
      {
        text: "Item Code",
        value: "item_number",
      },
      {
        text: "Name",
        value: "name",
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
        text: "Created At",
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
    showImage(image) {
      this.selectedImage = image;
      this.imageDialog = true;
    },
    async getDataFromApi() {
      this.loading = true;
      let { data } = await this.$axios.get(this.endpoint);
      this.loading = false;
      this.items = data.data;
    },
  },
};
</script>
