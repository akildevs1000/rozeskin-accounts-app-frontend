<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="400">
      <AssetsIconClose left="390" @click="close" />
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          small
          color="primary"
          class="white--text"
          dark
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="white" small> mdi-plus </v-icon> New
        </v-btn>
      </template>

      <v-card>
        <v-alert flat class="grey lighten-3" dense>
          <span>Create {{ model }}</span>
        </v-alert>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                outlined
                dense
                hide-details
                v-model="payload.name"
                label="Name"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-autocomplete
                v-model="payload.inventory_item_id"
                :items="inventoryItems"
                item-text="name"
                item-value="id"
                label="Inventory Item"
                outlined
                dense
                hide-details
              ></v-autocomplete>
            </v-col>
            <v-col cols="12">
              <v-menu
                v-model="menu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="payload.stock_date"
                    label="Stock Date"
                    append-icon="mdi-calendar"
                    readonly
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                    hide-details
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="payload.stock_date"
                  no-title
                  scrollable
                  @input="menu = false"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12">
              <v-text-field
                outlined
                dense
                hide-details
                v-model="payload.qty_added"
                label="Quantity"
              ></v-text-field>
            </v-col>

            <v-col cols="12" v-if="errorResponse">
              <span class="red--text">{{ errorResponse }}</span>
            </v-col>
            <v-col cols="12" class="text-right">
              <AssetsButton
                :options="{
                  label: `Cancel`,
                  color: `red`,
                }"
                @click="close"
              />
              &nbsp;
              <AssetsButton
                :options="{
                  label: `Submit`,
                  color: `green`,
                }"
                @click="submit"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  props: ["endpoint", "model"],

  data() {
    return {
      menu: false,
      payload: {},
      dialog: false,
      loading: false,
      successResponse: null,
      errorResponse: null,
      inventoryItems: [],
    };
  },
  async created() {
    let { data } = await this.$axios.get(`inventory-items-list`);
    this.inventoryItems = data;
  },
  methods: {
    close() {
      this.dialog = false;
      this.loading = false;
      this.errorResponse = null;
      this.payload = {};
    },
    async submit() {
      this.loading = true;

      try {
        await this.$axios.post(this.endpoint, this.payload);
        this.close();
        this.$emit("response", "Record has been inserted");
      } catch (error) {
        this.errorResponse = error?.response?.data?.message || "Unknown error";
        this.loading = false;
      }
    },
  },
};
</script>
