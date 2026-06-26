<template>
  <v-card flat style="background: none">
    <v-toolbar flat dense class="mb-2" style="background: none">
      <v-icon left color="primary">mdi-view-dashboard-outline</v-icon>
      <span class="text-h6">Inventory Dashboard</span>
      <v-spacer></v-spacer>
      <v-col cols="3">
        <InventoryDateRange @range="onRange" />
      </v-col>
      <v-icon color="primary" class="ml-2" @click="load">mdi-reload</v-icon>
    </v-toolbar>

    <!-- Stat cards -->
    <v-row class="px-2">
      <v-col v-for="card in cards" :key="card.label" cols="12" sm="6" md="4">
        <v-card outlined :loading="loading">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption grey--text text--darken-1">{{ card.label }}</div>
                <div class="text-h5 font-weight-bold" :class="card.color + '--text'">
                  {{ card.value }}
                </div>
              </div>
              <v-btn fab text small :class="card.color">
                <v-icon color="white">{{ card.icon }}</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="px-2 mt-2">
      <!-- Low stock alerts -->
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="text-subtitle-1">
            <v-icon left color="orange">mdi-alert-outline</v-icon> Low Stock Alerts
            <v-spacer></v-spacer>
            <v-btn x-small text color="primary" @click="$router.push('/inventory/low-stock')">View all</v-btn>
          </v-card-title>
          <v-data-table
            dense
            :headers="lowHeaders"
            :items="lowStock"
            :items-per-page="5"
            :loading="loading"
            no-data-text="No low stock items 🎉"
          >
            <template v-slot:item.sellable_qty="{ item }">
              <v-chip x-small color="red" dark>{{ item.sellable_qty }}</v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Recent movements -->
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="text-subtitle-1">
            <v-icon left color="primary">mdi-history</v-icon> Recent Stock Movements
          </v-card-title>
          <v-data-table
            dense
            :headers="moveHeaders"
            :items="movements"
            :items-per-page="5"
            :loading="loading"
          >
            <template v-slot:item.quantity="{ item }">
              <span :class="item.quantity >= 0 ? 'green--text' : 'red--text'">
                {{ item.quantity >= 0 ? "+" : "" }}{{ item.quantity }}
              </span>
            </template>
            <template v-slot:item.movement_label="{ item }">
              <v-chip x-small outlined>{{ item.movement_label }}</v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    loading: false,
    stats: {},
    lowStock: [],
    movements: [],
    range: { from: null, to: null },
    lowHeaders: [
      { text: "Product", value: "name" },
      { text: "Item #", value: "item_number" },
      { text: "Available", value: "sellable_qty", align: "center" },
      { text: "Low Stock Alert", value: "reorder_level", align: "center" },
    ],
    moveHeaders: [
      { text: "Product", value: "product.name" },
      { text: "Type", value: "movement_label" },
      { text: "Qty", value: "quantity", align: "center" },
      { text: "Balance", value: "balance_after", align: "center" },
    ],
  }),

  computed: {
    cards() {
      const s = this.stats;
      const money = this.$utils
        ? this.$utils.currency_format(s.stock_value || 0, "AED", false)
        : s.stock_value;
      return [
        { label: "Current Stock", value: s.current_stock || 0, icon: "mdi-warehouse", color: "primary" },
        { label: "Stock Value", value: money, icon: "mdi-cash-multiple", color: "teal" },
        { label: "Low Stock Alerts", value: s.low_stock_alerts || 0, icon: "mdi-alert-outline", color: "orange" },
        { label: "Purchase Pending", value: s.purchase_pending || 0, icon: "mdi-clipboard-clock-outline", color: "indigo" },
        { label: "Received Stock", value: s.received_stock || 0, icon: "mdi-truck-check-outline", color: "green" },
        { label: "Returned Stock", value: s.returned_stock || 0, icon: "mdi-keyboard-return", color: "deep-purple" },
      ];
    },
  },

  created() {
    this.load();
  },

  methods: {
    onRange({ from, to }) {
      this.range = { from, to };
      this.load();
    },
    async load() {
      this.loading = true;
      try {
        const params = { from: this.range.from, to: this.range.to };
        const [stats, low, recent] = await Promise.all([
          this.$axios.get("inventory-dashboard", { params }),
          this.$axios.get("inventory-low-stock"),
          this.$axios.get("inventory-dashboard-recent"),
        ]);
        this.stats = stats.data;
        this.lowStock = low.data;
        this.movements = recent.data;
      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
