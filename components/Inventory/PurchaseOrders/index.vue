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
      class="elevation-1 pa-3 inv-table inv-clickable"
      @click:row="openDetail"
    >
      <template v-slot:top>
        <div class="inv-toolbar d-flex align-center flex-wrap">
          <span class="inv-title mr-4">Purchase Orders</span>
          <v-text-field
            v-model="filters.search"
            class="inv-search mr-3"
            placeholder="Search PO / vendor"
            dense outlined hide-details clearable
            @keyup.enter="getDataFromApi"
          />
          <v-autocomplete
            v-model="filters.status"
            :items="statuses"
            class="inv-filter mr-3"
            label="Status"
            dense outlined hide-details clearable
          />
          <v-btn small depressed color="primary" @click="getDataFromApi">Submit</v-btn>
          <v-spacer></v-spacer>
          <v-btn small depressed color="primary" @click="$router.push('/inventory/purchase-orders/new')">
            <v-icon left small>mdi-plus</v-icon>New PO
          </v-btn>
        </div>
      </template>

      <template v-slot:item.order_date="{ item }">{{ fmt(item.order_date) }}</template>
      <template v-slot:item.reference_id="{ item }">
        <a class="primary--text font-weight-medium" @click.stop="openDetail(item)">{{ item.reference_id }}</a>
      </template>
      <template v-slot:item.total="{ item }">{{ money(item.total) }}</template>
      <template v-slot:item.received="{ item }">{{ item.received_qty }} / {{ item.ordered_qty }}</template>
      <template v-slot:item.expected_date="{ item }">{{ item.expected_date ? fmt(item.expected_date) : "—" }}</template>
      <template v-slot:item.status="{ item }">
        <v-chip x-small dark :color="statusColor(item.status)">{{ labelize(item.status) }}</v-chip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    endpoint: "purchase-orders",
    loading: false,
    items: [],
    totalItems: 0,
    options: {},
    filters: { search: null, status: null },
    statuses: [
      { text: "Pending", value: "pending" },
      { text: "Partially Received", value: "partially_received" },
      { text: "Received", value: "received" },
      { text: "Cancelled", value: "cancelled" },
    ],
    headers: [
      { text: "Date", value: "order_date" },
      { text: "PO #", value: "reference_id" },
      { text: "Reference#", value: "reference" },
      { text: "Vendor", value: "vendor_name" },
      { text: "Status", value: "status", align: "center" },
      { text: "Received", value: "received", sortable: false, align: "center" },
      { text: "Amount", value: "total", align: "right" },
      { text: "Delivery Date", value: "expected_date" },
    ],
  }),

  watch: { options: { handler() { this.getDataFromApi(); }, deep: true } },

  methods: {
    money(v) { return this.$utils ? this.$utils.currency_format(v || 0, "AED", false) : v; },
    fmt(d) { return this.$dateFormat ? this.$dateFormat.dmy(d) : d; },
    labelize(s) { return (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); },
    statusColor(s) {
      return { pending: "orange", partially_received: "blue", received: "green", cancelled: "red" }[s] || "grey";
    },
    openDetail(item) { this.$router.push(`/inventory/purchase-orders/${item.id}`); },
    async getDataFromApi() {
      this.loading = true;
      try {
        const { page, itemsPerPage } = this.options;
        const { data } = await this.$axios.get(this.endpoint, { params: { page, per_page: itemsPerPage, ...this.filters } });
        this.items = data.data || [];
        this.totalItems = data.total || this.items.length;
      } finally { this.loading = false; }
    },
  },
};
</script>
