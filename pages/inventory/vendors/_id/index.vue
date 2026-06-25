<template>
  <div class="vn-master d-flex">
    <!-- Left list panel (shortview) -->
    <div class="vn-list">
      <div class="vn-list__head d-flex align-center px-3 py-2">
        <span class="font-weight-medium">Vendors</span>
        <v-spacer></v-spacer>
        <v-btn icon small color="primary" @click="$router.push('/inventory/vendors/new')">
          <v-icon small>mdi-plus</v-icon>
        </v-btn>
      </div>
      <div class="px-3 pb-2">
        <v-text-field
          v-model="search"
          placeholder="Search company / name / phone"
          dense outlined hide-details clearable
          prepend-inner-icon="mdi-magnify"
          @keyup.enter="getList"
          @click:clear="getList"
        />
      </div>
      <div class="vn-list__items">
        <div
          v-for="v in list"
          :key="v.id"
          class="vn-list__item px-3 py-2"
          :class="{ 'vn-list__item--active': String(v.id) === String(id) }"
          @click="select(v)"
        >
          <div class="d-flex justify-space-between">
            <span class="font-weight-medium text-truncate">{{ v.display_name || v.company_name || "—" }}</span>
            <v-chip x-small dark :color="v.status === 'inactive' ? 'red' : 'green'" class="ml-2">{{ v.status === 'inactive' ? 'Inactive' : 'Active' }}</v-chip>
          </div>
          <div class="d-flex justify-space-between text-caption grey--text">
            <span class="text-truncate">{{ v.mobile || v.email || "—" }}</span>
          </div>
        </div>
        <div v-if="!loading && !list.length" class="text-center grey--text py-6">No vendors</div>
        <div v-if="loading" class="text-center py-6"><v-progress-circular indeterminate size="22" color="primary" /></div>
      </div>
    </div>

    <!-- Right detail panel -->
    <div class="vn-detail-pane flex-grow-1">
      <InventoryVendorsDetail :id="id" />
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
    select(v) {
      if (String(v.id) === String(this.id)) return;
      this.$router.push(`/inventory/vendors/${v.id}`);
    },
    async getList() {
      this.loading = true;
      try {
        const { data } = await this.$axios.get("vendors", { params: { per_page: 100, search: this.search } });
        this.list = data.data || [];
      } finally { this.loading = false; }
    },
  },
};
</script>

<style scoped>
.vn-master { gap: 16px; align-items: stretch; height: calc(100vh - 100px); }
.vn-list {
  width: 320px;
  flex: 0 0 320px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.vn-list__head { border-bottom: 1px solid #eef1f5; }
.vn-list__items { overflow-y: auto; flex: 1 1 auto; }
.vn-list__item { border-bottom: 1px solid #f2f4f7; cursor: pointer; }
.vn-list__item:hover { background: #f7f9fc; }
.vn-list__item--active { background: #eef4ff; border-left: 3px solid #1976d2; }
.vn-detail-pane { min-width: 0; overflow-y: auto; border-radius: 12px; }
.vn-detail-pane >>> .vendor-detail { box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); min-height: 100%; }
</style>
