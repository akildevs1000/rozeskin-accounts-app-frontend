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
                v-model="payload.price"
                label="Price"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                outlined
                dense
                hide-details
                v-model="payload.qty"
                label="Quantity"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-autocomplete
                multiple
                v-model="payload.inventory_item_ids"
                :items="inventoryItems"
                item-text="name"
                item-value="id"
                label="Items"
                outlined
                dense
                hide-details
              ></v-autocomplete>
            </v-col>
            <v-col cols="12">
              <v-autocomplete
                v-model="payload.product_category_id"
                :items="product_categories"
                item-text="name"
                item-value="id"
                label="Product Category"
                outlined
                dense
                hide-details
              ></v-autocomplete>
            </v-col>
            <v-col cols="12">
              <v-textarea
                rows="2"
                outlined
                dense
                hide-details
                v-model="payload.description"
                label="Description"
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-file-input
                v-model="payload.image"
                label="Upload Product Image"
                accept="image/*"
                append-icon="mdi-camera"
                prepend-icon=""
                dense
                outlined
                show-size
                @change="previewImage"
                hide-details
              ></v-file-input>

              <v-img
                v-if="imagePreview"
                :src="imagePreview"
                max-height="200"
                class="mt-4"
              ></v-img>
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
      payload: {},
      dialog: false,
      loading: false,
      successResponse: null,
      errorResponse: null,
      product_categories: [],
      inventoryItems: [],
      imagePreview: null,
    };
  },
  async created() {
    let { data } = await this.$axios.get(`product-category-list`);

    this.product_categories = data;

    this.inventoryItems = await this.$axios.$get(`inventory-items-list`);
  },
  methods: {
    previewImage(file) {
      if (file && file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.imagePreview = null;
      }
    },
    close() {
      this.dialog = false;
      this.loading = false;
      this.errorResponse = null;
      this.payload = {};
      this.imagePreview = null;
    },
    async submit() {
      this.loading = true;

      try {
        const formData = new FormData();
        formData.append("name", this.payload.description);
        formData.append("description", this.payload.description);
        formData.append("price", this.payload.price);
        formData.append("qty", this.payload.qty);
        formData.append(
          "product_category_id",
          this.payload.product_category_id
        );

        // Only append image if it's provided or changed
        if (this.payload.image instanceof File) {
          formData.append("image", this.payload.image);
        }
        formData.append(
          "inventory_item_ids",
          JSON.stringify(this.payload.inventory_item_ids)
        );

        await this.$axios.post(this.endpoint, formData);
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
