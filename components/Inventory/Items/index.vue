<template>
  <v-card style="background: none">
    <!-- Image preview dialog -->
    <v-dialog v-model="imageDialog" max-width="500">
      <v-card>
        <v-img :src="selectedImage" aspect-ratio="1" contain />
      </v-card>
    </v-dialog>

    <!-- Quick view dialog (double-click a row) -->
    <v-dialog v-model="viewDialog" width="460" content-class="inv-dialog">
      <v-card v-if="viewItem">
        <div class="inv-dialog__header">
          <v-icon small>mdi-eye-outline</v-icon> {{ viewItem.name }}
          <span class="inv-dialog__hint" v-if="viewItem.sku">{{ viewItem.sku }}</span>
        </div>
        <v-card-text class="pt-4">
          <div class="d-flex justify-center mb-4">
            <v-avatar tile size="140" v-if="viewItem.display_image" style="cursor: pointer" @click="showImage(viewItem.display_image)">
              <img :src="viewItem.display_image" alt="item" style="object-fit: contain" />
            </v-avatar>
            <v-icon v-else size="80" color="grey lighten-1">mdi-image-off-outline</v-icon>
          </div>
          <v-simple-table dense>
            <tbody>
              <tr><td class="grey--text">SKU</td><td class="text-right">{{ viewItem.sku || "—" }}</td></tr>
              <tr><td class="grey--text">Status</td><td class="text-right">{{ viewItem.status }}</td></tr>
              <tr v-if="viewItem.description"><td class="grey--text">Description</td><td class="text-right">{{ viewItem.description }}</td></tr>
            </tbody>
          </v-simple-table>
          <div class="text-right mt-3">
            <AssetsButton :options="{ label: 'Edit', color: 'primary' }" @click="viewDialog = false; openEdit(viewItem)" />
            &nbsp;
            <AssetsButton :options="{ label: 'Close', color: 'red' }" @click="viewDialog = false" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Create / Edit item dialog -->
    <v-dialog v-model="dialog" width="560" persistent content-class="inv-dialog">
      <v-card>
        <div class="inv-dialog__header">
          <v-icon small>mdi-package-variant-closed</v-icon> {{ form.id ? "Edit Item" : "New Item" }}
        </div>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12" md="8">
              <v-text-field v-model="form.name" label="Item Name *" dense outlined hide-details />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.sku" label="SKU" dense outlined hide-details />
            </v-col>
            <v-col cols="12">
              <v-autocomplete v-model="form.status" :items="[{text:'Active',value:'active'},{text:'Inactive',value:'inactive'}]" label="Status" dense outlined hide-details />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.description" label="Description" rows="2" dense outlined hide-details />
            </v-col>
            <v-col cols="12">
              <v-file-input
                v-model="imageFile"
                label="Item Image"
                accept="image/*"
                append-icon="mdi-camera"
                prepend-icon=""
                dense outlined show-size hide-details
                @change="previewImage"
              />
              <v-img v-if="imagePreview" :src="imagePreview" max-height="160" contain class="mt-3" />
            </v-col>
          </v-row>

          <div class="d-flex align-center mt-4">
            <v-spacer></v-spacer>
            <span v-if="error" class="red--text mr-3">{{ error }}</span>
            <AssetsButton :options="{ label: 'Cancel', color: 'red' }" @click="dialog = false" />
            &nbsp;
            <AssetsButton :options="{ label: form.id ? 'Update' : 'Save', color: 'green' }" @click="submit" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-data-table
      dense
      :headers="headers"
      :items="items"
      :loading="loading"
      :options.sync="options"
      :server-items-length="totalItems"
      :footer-props="{ itemsPerPageOptions: [15, 30, 50, 100] }"
      class="elevation-1 pa-3 inv-table inv-clickable"
      @dblclick:row="openView"
    >
      <template v-slot:top>
        <div class="inv-toolbar d-flex align-center flex-wrap">
          <span class="inv-title mr-4">Items</span>
          <v-text-field
            v-model="filters.search"
            class="inv-search mr-3"
            placeholder="Search name / SKU"
            dense outlined hide-details clearable
            @keyup.enter="getDataFromApi"
          />
          <v-btn small depressed color="primary" @click="getDataFromApi">Submit</v-btn>
          <v-spacer></v-spacer>
          <v-btn small depressed color="primary" @click="openCreate"><v-icon left small>mdi-plus</v-icon>New Item</v-btn>
        </div>
      </template>

      <template v-slot:item.display_image="{ item }">
        <v-avatar v-if="item.display_image" tile size="40" class="my-2" style="cursor: pointer" @click="showImage(item.display_image)">
          <img :src="item.display_image" alt="item" />
        </v-avatar>
        <v-icon v-else small color="grey lighten-1">mdi-image-off-outline</v-icon>
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip x-small dark :color="item.status === 'active' ? 'green' : 'grey'">{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.options="{ item }">
        <v-menu bottom left offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small v-bind="attrs" v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
          </template>
          <v-list dense>
            <v-list-item link @click="openEdit(item)">
              <v-list-item-icon class="mr-2"><v-icon small color="primary">mdi-pencil</v-icon></v-list-item-icon>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>
            <v-list-item link @click="remove(item)">
              <v-list-item-icon class="mr-2"><v-icon small color="red">mdi-delete</v-icon></v-list-item-icon>
              <v-list-item-title>Delete</v-list-item-title>
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
    endpoint: "inventory-items",
    loading: false,
    items: [],
    totalItems: 0,
    options: {},
    dialog: false,
    error: null,
    filters: { search: null },
    form: {},
    imageFile: null,
    imagePreview: null,
    selectedImage: null,
    imageDialog: false,
    viewDialog: false,
    viewItem: null,
    headers: [
      { text: "Image", value: "display_image", sortable: false, width: 60 },
      { text: "SKU", value: "sku" },
      { text: "Item", value: "name" },
      { text: "Status", value: "status", align: "center" },
      { text: "Action", value: "options", sortable: false, align: "center" },
    ],
  }),

  watch: { options: { handler() { this.getDataFromApi(); }, deep: true } },

  methods: {
    openCreate() {
      this.form = { name: null, sku: null, description: null, status: "active" };
      this.imageFile = null;
      this.imagePreview = null;
      this.error = null;
      this.dialog = true;
    },
    openEdit(item) {
      this.form = { ...item };
      this.imageFile = null;
      this.imagePreview = item.display_image || null;
      this.error = null;
      this.dialog = true;
    },
    previewImage(file) {
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => { this.imagePreview = e.target.result; };
        reader.readAsDataURL(file);
      } else {
        this.imagePreview = this.form.display_image || null;
      }
    },
    showImage(image) {
      this.selectedImage = image;
      this.imageDialog = true;
    },
    openView(event, { item }) {
      this.viewItem = item;
      this.viewDialog = true;
    },
    async getDataFromApi() {
      this.loading = true;
      try {
        const { page, itemsPerPage } = this.options;
        const { data } = await this.$axios.get(this.endpoint, { params: { page, per_page: itemsPerPage, ...this.filters } });
        this.items = data.data || [];
        this.totalItems = data.total || this.items.length;
      } finally { this.loading = false; }
    },
    async submit() {
      this.error = null;
      if (!this.form.name) { this.error = "Item name is required."; return; }
      try {
        const fd = new FormData();
        fd.append("name", this.form.name);
        fd.append("sku", this.form.sku || "");
        fd.append("status", this.form.status || "active");
        fd.append("description", this.form.description || "");
        if (this.imageFile instanceof File) fd.append("image", this.imageFile);

        if (this.form.id) {
          // Method spoofing so PHP parses the uploaded file on update.
          fd.append("_method", "PUT");
          await this.$axios.post(`${this.endpoint}/${this.form.id}`, fd);
        } else {
          await this.$axios.post(this.endpoint, fd);
        }
        this.dialog = false;
        this.$swal && this.$swal.fire({ toast: true, position: "top-end", timer: 2000, showConfirmButton: false, icon: "success", title: "Item saved" });
        this.getDataFromApi();
      } catch (e) {
        this.error = e?.response?.data?.message || "Failed to save";
      }
    },
    async remove(item) {
      const r = await (this.$swal ? this.$swal.fire({ icon: "warning", title: `Delete ${item.name}?`, showCancelButton: true, confirmButtonText: "Yes, delete" }) : { isConfirmed: confirm("Delete?") });
      if (!r.isConfirmed) return;
      try {
        await this.$axios.delete(`${this.endpoint}/${item.id}`);
        this.getDataFromApi();
      } catch (e) {
        this.$swal && this.$swal.fire({ icon: "error", title: "Cannot delete", text: e?.response?.data?.message || "Error" });
      }
    },
  },
};
</script>
