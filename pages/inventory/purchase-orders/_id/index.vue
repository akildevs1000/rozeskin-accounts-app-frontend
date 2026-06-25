<template>
  <div class="po-master d-flex">
    <!-- Left list panel (Zoho-style) -->
    <div class="po-list">
      <div class="po-list__head d-flex align-center px-3 py-2">
        <span class="font-weight-medium">Purchase Orders</span>
        <v-spacer></v-spacer>
        <v-btn icon small color="primary" @click="$router.push('/inventory/purchase-orders/new')">
          <v-icon small>mdi-plus</v-icon>
        </v-btn>
      </div>
      <div class="px-3 pb-2">
        <v-text-field
          v-model="search"
          placeholder="Search PO / vendor"
          dense outlined hide-details clearable
          prepend-inner-icon="mdi-magnify"
          @keyup.enter="getList"
          @click:clear="getList"
        />
      </div>
      <div class="po-list__items">
        <div
          v-for="po in list"
          :key="po.id"
          class="po-list__item px-3 py-2"
          :class="{ 'po-list__item--active': String(po.id) === String(id) }"
          @click="select(po)"
        >
          <div class="d-flex justify-space-between">
            <span class="font-weight-medium text-truncate">{{ po.vendor_name || "—" }}</span>
            <span class="font-weight-medium ml-2">{{ money(po.total) }}</span>
          </div>
          <div class="d-flex justify-space-between text-caption grey--text">
            <span>{{ po.reference_id }} &bull; {{ fmt(po.order_date) }}</span>
          </div>
          <v-chip x-small dark :color="statusColor(po.status)" class="mt-1">{{ labelize(po.status) }}</v-chip>
        </div>
        <div v-if="!loading && !list.length" class="text-center grey--text py-6">No purchase orders</div>
        <div v-if="loading" class="text-center py-6"><v-progress-circular indeterminate size="22" color="primary" /></div>
      </div>
    </div>

    <!-- Right detail panel -->
    <div class="po-detail-pane flex-grow-1">
      <InventoryPurchaseOrdersDetail :id="id" />
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    list: [],
    loading: false,
    search: null,
  }),

  computed: {
    id() { return this.$route.params.id; },
  },

  created() { this.getList(); },

  methods: {
    money(v) { return this.$utils ? this.$utils.currency_format(v || 0, "AED", false) : v; },
    fmt(d) { return this.$dateFormat ? this.$dateFormat.dmy(d) : d; },
    labelize(s) { return (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); },
    statusColor(s) { return { pending: "orange", partially_received: "blue", received: "green", cancelled: "red" }[s] || "grey"; },
    select(po) {
      if (String(po.id) === String(this.id)) return;
      this.$router.push(`/inventory/purchase-orders/${po.id}`);
    },
    async getList() {
      this.loading = true;
      try {
        const { data } = await this.$axios.get("purchase-orders", { params: { per_page: 100, search: this.search } });
        this.list = data.data || [];
      } finally { this.loading = false; }
    },
  },
};
</script>

<style scoped>
.po-master { gap: 16px; align-items: stretch; height: calc(100vh - 100px); }
.po-list {
  width: 320px;
  flex: 0 0 320px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.po-list__head { border-bottom: 1px solid #eef1f5; }
.po-list__items { overflow-y: auto; flex: 1 1 auto; }
.po-list__item { border-bottom: 1px solid #f2f4f7; cursor: pointer; }
.po-list__item:hover { background: #f7f9fc; }
.po-list__item--active { background: #eef4ff; border-left: 3px solid #1976d2; }
.po-detail-pane { min-width: 0; overflow-y: auto; border-radius: 12px; }
.po-detail-pane >>> .po-detail { max-width: none; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); min-height: 100%; }
</style>
