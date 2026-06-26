<template>
  <v-card style="background: none">
    <v-data-table
      dense
      :headers="headers"
      :items="items"
      :loading="loading"
      :items-per-page="50"
      class="elevation-1 pa-3 inv-table"
      no-data-text="No items below their reorder level 🎉"
    >
      <template v-slot:top>
        <v-toolbar flat dense style="background: none">
          <v-icon left color="orange">mdi-alert-outline</v-icon>
          <span class="text-h6">Low Stock Alerts</span>
          <v-chip v-if="items.length" x-small color="red" dark class="ml-2">{{ items.length }}</v-chip>
          <v-spacer></v-spacer>
          <v-icon color="primary" @click="load">mdi-reload</v-icon>
        </v-toolbar>
      </template>

      <template v-slot:item.sellable_qty="{ item }"><v-chip x-small color="red" dark>{{ item.sellable_qty }}</v-chip></template>
      <template v-slot:item.shortfall="{ item }">{{ Math.max(0, item.reorder_level - item.sellable_qty) }}</template>
      <template v-slot:item.action="{ item }">
        <v-btn x-small text color="primary" @click="$router.push('/inventory/purchase-orders')"><v-icon x-small left>mdi-cart-plus</v-icon>Reorder</v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    loading: false,
    items: [],
    headers: [
      { text: "SKU", value: "sku" },
      { text: "Item", value: "name" },
      { text: "Available", value: "sellable_qty", align: "center" },
      { text: "Low Stock Alert", value: "reorder_level", align: "center" },
      { text: "Shortfall", value: "shortfall", align: "center", sortable: false },
      { text: "", value: "action", align: "right", sortable: false },
    ],
  }),

  created() { this.load(); },

  methods: {
    async load() {
      this.loading = true;
      try {
        const { data } = await this.$axios.get("inventory-low-stock");
        this.items = data;
      } finally { this.loading = false; }
    },
  },
};
</script>
