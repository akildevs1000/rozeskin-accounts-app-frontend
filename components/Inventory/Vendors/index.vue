<template>
  <v-card style="background: none">
    <v-data-table
      dense
      :headers="headers"
      :items="items"
      :loading="loading"
      :options.sync="options"
      :server-items-length="totalItems"
      :footer-props="{ itemsPerPageOptions: [15, 30, 50, 100] }"
      class="elevation-1 pa-3 inv-table"
      @click:row="openView"
    >
      <template v-slot:top>
        <div class="inv-toolbar d-flex align-center flex-wrap">
          <span class="inv-title mr-4">Vendors</span>
          <v-text-field
            v-model="filters.search"
            class="inv-search mr-3"
            placeholder="Search company / name / phone / email"
            dense outlined hide-details clearable
            @keyup.enter="getDataFromApi"
          />
          <v-btn small depressed color="primary" @click="getDataFromApi">Submit</v-btn>
          <v-spacer></v-spacer>
          <v-btn small depressed color="primary" @click="openCreate"><v-icon left small>mdi-plus</v-icon>New Vendor</v-btn>
        </div>
      </template>

      <template v-slot:item.company_name="{ item }">
        <span class="font-weight-medium">{{ item.company_name || "—" }}</span>
      </template>
      <template v-slot:item.full_name="{ item }">{{ item.full_name || "—" }}</template>
      <template v-slot:item.options="{ item }">
        <v-menu bottom left offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small v-bind="attrs" v-on="on" @click.stop><v-icon>mdi-dots-vertical</v-icon></v-btn>
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
    endpoint: "vendors",
    loading: false,
    items: [],
    totalItems: 0,
    options: {},
    filters: { search: null },
    headers: [
      { text: "Company", value: "company_name" },
      { text: "Contact", value: "full_name" },
      { text: "Mobile", value: "mobile" },
      { text: "Email", value: "email" },
      { text: "Action", value: "options", sortable: false, align: "center" },
    ],
  }),

  watch: { options: { handler() { this.getDataFromApi(); }, deep: true } },

  methods: {
    openCreate() { this.$router.push("/inventory/vendors/new"); },
    openView(item) { this.$router.push(`/inventory/vendors/${item.id}`); },
    openEdit(item) { this.$router.push(`/inventory/vendors/${item.id}/edit`); },
    async getDataFromApi() {
      this.loading = true;
      try {
        const { page, itemsPerPage } = this.options;
        const { data } = await this.$axios.get(this.endpoint, { params: { page, per_page: itemsPerPage, ...this.filters } });
        this.items = data.data || [];
        this.totalItems = data.total || this.items.length;
      } finally { this.loading = false; }
    },
    async remove(item) {
      const r = await (this.$swal ? this.$swal.fire({ icon: "warning", title: `Delete ${item.display_name || item.company_name}?`, showCancelButton: true, confirmButtonText: "Yes, delete" }) : { isConfirmed: confirm("Delete?") });
      if (!r.isConfirmed) return;
      await this.$axios.delete(`${this.endpoint}/${item.id}`);
      this.getDataFromApi();
    },
  },
};
</script>
