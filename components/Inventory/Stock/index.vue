<template>
  <div>
    <!-- Reorder level dialog (shared by both views) -->
    <v-dialog v-model="reorderDialog" width="380" content-class="inv-dialog">
      <v-card>
        <div class="inv-dialog__header">
          <v-icon small>mdi-bell-alert-outline</v-icon> Set Reorder Level
          <span class="inv-dialog__hint">{{ selected.name }}</span>
        </div>
        <v-card-text>
          <v-text-field
            v-model.number="reorderLevel"
            type="number"
            min="0"
            label="Low-stock threshold"
            outlined
            dense
            hide-details
            class="mt-2"
          ></v-text-field>
          <div class="text-right mt-4">
            <AssetsButton :options="{ label: 'Cancel', color: 'red' }" @click="reorderDialog = false" />
            &nbsp;
            <AssetsButton :options="{ label: 'Save', color: 'green' }" @click="saveReorder" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ============ LIST VIEW (original table) ============ -->
    <v-card v-if="viewMode === 'list'" style="background: none">
      <v-data-table
        dense
        :headers="headers"
        :items="items"
        :loading="loading"
        :options.sync="options"
        :server-items-length="totalItems"
        :footer-props="{ itemsPerPageOptions: [15, 30, 50, 100] }"
        class="elevation-1 pa-3 inv-table inv-clickable"
        @dblclick:row="openDetail"
      >
        <template v-slot:top>
          <div class="inv-toolbar d-flex align-center flex-wrap">
            <span class="inv-title mr-4">Inventory List</span>
            <v-text-field
              v-model="filters.search"
              class="inv-search mr-3"
              placeholder="Search name / SKU"
              dense outlined hide-details clearable
              @keyup.enter="getDataFromApi"
            />
            <v-switch v-model="filters.low_stock" label="Low stock only" hide-details class="mt-0 mr-3" />
            <v-btn small depressed color="primary" :loading="loading" @click="getDataFromApi">Submit</v-btn>
            <v-spacer></v-spacer>
            <span class="text-caption grey--text">Double-click a row to open details</span>
          </div>
        </template>

        <template v-slot:item.sellable_qty="{ item }">
          <v-chip x-small :color="item.reorder_level > 0 && item.sellable_qty <= item.reorder_level ? 'red' : 'green'" dark>
            {{ item.sellable_qty }}
          </v-chip>
        </template>
        <template v-slot:item.non_sellable_qty="{ item }">
          <span :class="item.non_sellable_qty > 0 ? 'red--text' : 'grey--text'">{{ item.non_sellable_qty }}</span>
        </template>
        <template v-slot:item.stock_value="{ item }">
          {{ money(item.stock_value) }}
        </template>
        <template v-slot:item.reorder_level="{ item }">
          <v-btn x-small text color="primary" @click="openReorder(item)">
            {{ item.reorder_level || "—" }} <v-icon x-small right>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- ============ DETAIL / SHORT VIEW (master-detail, opens on double-click) ============ -->
    <div v-else class="vn-master d-flex">
      <!-- Left list panel (shortview) -->
      <div class="vn-list">
        <div class="vn-list__head d-flex align-center px-3 py-2">
          <v-icon small class="mr-1" style="cursor: pointer" @click="backToList">mdi-chevron-left</v-icon>
          <span class="font-weight-medium">Inventory</span>
          <v-spacer></v-spacer>
          <span class="text-caption grey--text">{{ list.length }} items</span>
        </div>
        <div class="px-3 pb-2">
          <v-text-field
            v-model="search"
            placeholder="Search name / SKU"
            dense outlined hide-details clearable
            prepend-inner-icon="mdi-magnify"
            @keyup.enter="getList"
            @click:clear="getList"
          />
          <v-switch
            v-model="lowStock"
            label="Low stock only"
            dense hide-details
            class="mt-1 ml-1"
            @change="getList"
          />
        </div>
        <div class="vn-list__items">
          <div
            v-for="it in list"
            :key="it.id"
            class="vn-list__item d-flex align-center px-3 py-2"
            :class="{ 'vn-list__item--active': String(it.id) === String(selectedId) }"
            @click="select(it)"
          >
            <v-avatar tile size="40" class="vn-thumb mr-3">
              <img v-if="it.display_image" :src="it.display_image" alt="" style="object-fit: contain" />
              <v-icon v-else small color="grey lighten-1">mdi-image-off-outline</v-icon>
            </v-avatar>
            <div class="vn-item-body">
              <div class="d-flex justify-space-between align-center">
                <span class="font-weight-medium text-truncate">{{ it.name || "—" }}</span>
                <v-chip x-small dark class="ml-2" :color="isLow(it) ? 'red' : 'green'">{{ it.sellable_qty }}</v-chip>
              </div>
              <div class="text-caption grey--text text-truncate">{{ it.sku }}</div>
            </div>
          </div>
          <div v-if="!loading && !list.length" class="text-center grey--text py-6">No items</div>
          <div v-if="loading" class="text-center py-6"><v-progress-circular indeterminate size="22" color="primary" /></div>
        </div>
      </div>

      <!-- Right detail panel -->
      <div class="vn-detail-pane flex-grow-1">
        <v-card flat class="item-detail" :loading="historyLoading">
          <!-- Empty state -->
          <div v-if="!selected.id" class="vd-empty d-flex flex-column align-center justify-center grey--text">
            <v-icon size="64" color="grey lighten-1">mdi-package-variant-closed</v-icon>
            <div class="mt-3">Select an item to view details</div>
          </div>

          <template v-else>
            <!-- Toolbar -->
            <v-alert class="primary vd-toolbar mb-0" flat tile dense dark>
              <div class="d-flex align-center">
                <v-icon dark class="mr-2" style="cursor: pointer" @click="backToList">mdi-chevron-left</v-icon>
                <span class="font-weight-medium text-truncate">{{ selected.name }}</span>
                <v-spacer></v-spacer>
                <span class="vd-act" @click="openReorder(selected)">Set Reorder Level <v-icon small>mdi-bell-alert-outline</v-icon></span>
              </div>
            </v-alert>

            <v-card-text class="pa-0">
              <div class="vd-doc px-8 py-6">
                <!-- Header: image left, key info center, date filter top right (same line) -->
                <div class="vd-head d-flex align-start mb-6">
                  <v-avatar tile size="150" class="vd-image mr-6">
                    <img
                      v-if="(history.item && history.item.display_image) || selected.display_image"
                      :src="(history.item && history.item.display_image) || selected.display_image"
                      alt="item"
                      style="object-fit: contain"
                    />
                    <v-icon v-else size="48" color="grey lighten-1">mdi-image-off-outline</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="text-h6 font-weight-medium">{{ selected.name }}</div>
                    <div class="text-caption grey--text mb-2">SKU: {{ selected.sku }}</div>
                    <v-chip x-small dark :color="isLow(selected) ? 'red' : 'green'">
                      {{ isLow(selected) ? "Low stock" : "In stock" }}
                    </v-chip>

                    <div class="vd-quickgrid mt-4">
                      <div class="vd-q"><span class="vd-k">Unit Cost</span><span>{{ money(selected.unit_cost) }}</span></div>
                      <div class="vd-q"><span class="vd-k">Stock Value</span><span>{{ money(selected.stock_value) }}</span></div>
                      <div class="vd-q"><span class="vd-k">Low Stock Alert</span><span>{{ selected.reorder_level || "—" }}</span></div>
                    </div>
                  </div>

                  <!-- Date range filter — same line, top right -->
                  <div class="ml-4" style="min-width: 260px">
                    <date-picker
                      v-model="dateRange"
                      value-type="format"
                      format="YYYY-MM-DD"
                      type="date"
                      range
                      placeholder="Date range"
                      style="width: 100%"
                      @change="onRangeChange"
                    />
                  </div>
                </div>

                <!-- Summary cards -->
                <v-row dense>
                  <v-col v-for="c in summaryCards" :key="c.label" cols="6" sm="3">
                    <v-card outlined>
                      <v-card-text class="py-2 text-center">
                        <div class="text-caption grey--text">{{ c.label }}</div>
                        <div class="text-h6 font-weight-bold" :class="c.color + '--text'">{{ c.value }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Last purchase -->
                <v-row dense class="mt-1">
                  <v-col cols="6" sm="4">
                    <v-card outlined>
                      <v-card-text class="py-2 text-center">
                        <div class="text-caption grey--text">Last PO Number</div>
                        <div class="text-h6 font-weight-bold">
                          {{ history.last_purchase ? (history.last_purchase.po_number || history.last_purchase.grn || "—") : "—" }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="6" sm="4">
                    <v-card outlined>
                      <v-card-text class="py-2 text-center">
                        <div class="text-caption grey--text">Date Received</div>
                        <div class="text-h6 font-weight-bold">
                          {{ history.last_purchase ? fmt(history.last_purchase.received_date) : "—" }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="6" sm="4">
                    <v-card outlined>
                      <v-card-text class="py-2 text-center">
                        <div class="text-caption grey--text">Received Qty</div>
                        <div class="text-h6 font-weight-bold green--text">
                          {{ history.last_purchase ? history.last_purchase.qty : 0 }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Sold quantity by day -->
                <div class="text-subtitle-2 mt-6 mb-2">Sold quantity by day</div>
                <v-card outlined class="px-3 pt-3 pb-8">
                  <div v-if="hasSoldData" class="vd-chart-wrap">
                    <ChartsLine :chart-data="soldChartData" :options="soldChartOptions" />
                  </div>
                  <div v-else class="text-center grey--text py-8">No sales in the selected period</div>
                </v-card>

                <!-- Movement history -->
                <div class="text-subtitle-2 mt-16 mb-2">History</div>
                <v-data-table
                  dense
                  :headers="historyHeaders"
                  :items="filteredLedger"
                  :loading="historyLoading"
                  :items-per-page="10"
                  class="elevation-0 inv-table"
                >
                  <template v-slot:item.reference="{ item }">
                    <a
                      v-if="item.source_id"
                      class="primary--text"
                      style="cursor: pointer; text-decoration: none"
                      @click="goToInvoice(item)"
                    >{{ item.reference || "—" }}</a>
                    <span v-else>{{ item.reference || "—" }}</span>
                  </template>
                  <template v-slot:item.created_at="{ item }">{{ fmt(item.created_at) }}</template>
                  <template v-slot:item.movement_label="{ item }">
                    <v-chip x-small outlined>{{ item.movement_label }}</v-chip>
                  </template>
                  <template v-slot:item.customer_name="{ item }">{{ item.customer_name || "—" }}</template>
                  <template v-slot:item.quantity="{ item }">
                    <span :class="item.quantity >= 0 ? 'green--text' : 'red--text'">
                      {{ item.quantity >= 0 ? "+" : "" }}{{ item.quantity }}
                    </span>
                  </template>
                </v-data-table>
              </div>
            </v-card-text>
          </template>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";

export default {
  components: { DatePicker },
  data: () => ({
    endpoint: "inventory",
    viewMode: "list",

    // ----- list view -----
    loading: false,
    items: [],
    totalItems: 0,
    options: {},
    filters: { search: null, low_stock: false },

    // ----- detail / short view -----
    list: [],
    search: null,
    lowStock: false,
    selectedId: null,

    // ----- shared -----
    selected: {},
    reorderDialog: false,
    reorderLevel: 0,
    historyLoading: false,
    history: { item: null, summary: {}, ledger: [], last_purchase: null },
    dateRange: null,
    historyFrom: null,
    historyTo: null,
    historyHeaders: [
      { text: "Invoice #", value: "reference" },
      { text: "Date", value: "created_at" },
      { text: "Type", value: "movement_label" },
      { text: "Customer", value: "customer_name" },
      { text: "Qty", value: "quantity", align: "center" },
      { text: "Balance", value: "balance_after", align: "center" },
    ],
    headers: [
      { text: "SKU", value: "sku" },
      { text: "Item", value: "name" },
      { text: "Available", value: "sellable_qty", align: "center" },
      // { text: "Balance", value: "total_qty", align: "center" },
      { text: "Cost", value: "unit_cost", align: "right" },
      { text: "Stock Value", value: "stock_value", align: "right" },
      { text: "Low Stock Alert", value: "reorder_level", align: "center", sortable: false },
    ],
  }),

  watch: {
    options: { handler() { this.getDataFromApi(); }, deep: true },
  },

  computed: {
    summaryCards() {
      const s = this.history.summary || {};
      // Net sold = units that actually stayed sold (returns and cancellations add
      // stock back, so they don't count as a real sale).
      const netSold = Math.max(0, (s.sold || 0) - (s.returned || 0) - (s.cancelled || 0));
      return [
        { label: "Available", value: s.available || 0, color: "green" },
        // { label: "Received", value: s.received || 0, color: "primary" },
        { label: "Sold", value: netSold, color: "blue" },
        { label: "Returned", value: s.returned || 0, color: "deep-purple" },
        { label: "Cancelled", value: s.cancelled || 0, color: "red" },
      ];
    },
    filteredLedger() {
      const rows = this.history.ledger || [];
      if (!this.historyFrom && !this.historyTo) return rows;
      return rows.filter((r) => {
        const d = (r.created_at || "").slice(0, 10); // YYYY-MM-DD
        if (this.historyFrom && d < this.historyFrom) return false;
        if (this.historyTo && d > this.historyTo) return false;
        return true;
      });
    },
    // Day-wise NET sold quantity = sales minus returns/cancellations on that day,
    // so the daily chart reconciles with the "Sold" (net) summary card.
    soldByDay() {
      const BACK = ["customer_return", "rto", "sales_invoice_cancel", "shipment_cancel"];
      const map = {};
      (this.filteredLedger || []).forEach((r) => {
        const d = (r.created_at || "").slice(0, 10); // YYYY-MM-DD
        if (!d) return;
        const q = Math.abs(Number(r.quantity) || 0);
        if (r.movement_type === "sale") map[d] = (map[d] || 0) + q;
        else if (BACK.includes(r.movement_type)) map[d] = (map[d] || 0) - q;
      });
      return Object.keys(map)
        .sort()
        .map((d) => ({ date: d, qty: Math.max(0, map[d]) }));
    },
    hasSoldData() {
      return this.soldByDay.length > 0;
    },
    soldChartData() {
      return {
        labels: this.soldByDay.map((x) => this.shortDate(x.date)),
        datasets: [
          {
            label: "Sold Qty",
            data: this.soldByDay.map((x) => x.qty),
            borderColor: "#1976D2",
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: "#1976D2",
            pointBorderColor: "#fff",
            pointBorderWidth: 1.5,
            lineTension: 0.35,
            // smooth curve that never overshoots past the data points
            cubicInterpolationMode: "monotone",
            fill: "origin",
            // consumed by ChartsLine to build a vertical gradient fill
            _gradient: ["rgba(25,118,210,0.28)", "rgba(25,118,210,0.02)"],
          },
        ],
      };
    },
    soldChartOptions() {
      const max = this.soldByDay.reduce((m, x) => Math.max(m, x.qty), 0);
      return {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        layout: { padding: { top: 8, bottom: 6, left: 4, right: 8 } },
        tooltips: {
          mode: "index",
          intersect: false,
          backgroundColor: "#1976D2",
          titleFontSize: 14,
          bodyFontSize: 13,
          cornerRadius: 6,
          displayColors: false,
          caretSize: 6,
          xPadding: 12,
          yPadding: 8,
          callbacks: {
            label: (item) => `Sold Qty: ${item.yLabel}`,
          },
        },
        hover: { mode: "index", intersect: false },
        scales: {
          xAxes: [
            {
              gridLines: { display: false },
              ticks: {
                fontColor: "#8a96a6",
                autoSkip: true,
                autoSkipPadding: 16,
                maxRotation: 0,
                minRotation: 0,
                padding: 6,
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                // hard floor at 0 so low days never fall below the axis and get clipped
                beginAtZero: true,
                // a little headroom above the peak so the top point isn't on the edge
                suggestedMax: max + Math.max(2, Math.ceil(max * 0.1)),
                // cap the number of gridlines so the axis stays readable whether the
                // peak is 12 or 1200 — chart.js picks nice round steps (2, 20, 50, 100…)
                maxTicksLimit: 6,
                precision: 0,
                fontColor: "#8a96a6",
                padding: 6,
              },
              gridLines: { color: "rgba(0,0,0,0.05)", drawBorder: false },
            },
          ],
        },
      };
    },
  },

  methods: {
    money(v) {
      return this.$utils ? this.$utils.currency_format(v || 0, "AED", false) : v;
    },
    fmt(d) { return this.$dateFormat ? this.$dateFormat.dmyhm(d) : d; },
    shortDate(d) {
      // "2026-06-03" -> "03 Jun"
      if (!d) return d;
      const [, m, day] = d.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${day} ${months[Number(m) - 1] || ""}`.trim();
    },
    isLow(it) {
      return it && it.reorder_level > 0 && it.sellable_qty <= it.reorder_level;
    },
    onRangeChange(val) {
      this.historyFrom = val && val[0] ? val[0] : null;
      this.historyTo = val && val[1] ? val[1] : null;
    },
    // Open the source invoice of a history row in the Invoices short view.
    goToInvoice(row) {
      if (!row.source_id) return;
      this.$router.push({ path: "/invoice", query: { invoice_id: row.source_id } });
    },

    // ---------- list view ----------
    async getDataFromApi() {
      this.loading = true;
      try {
        const { page, itemsPerPage } = this.options;
        const params = { page, per_page: itemsPerPage, ...this.filters };
        const { data } = await this.$axios.get(this.endpoint, { params });
        this.items = data.data || [];
        this.totalItems = data.total || this.items.length;
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    // ---------- open short view on double-click ----------
    async openDetail(event, { item }) {
      this.selectedId = item.id;
      this.search = this.filters.search;
      this.lowStock = this.filters.low_stock;
      this.viewMode = "split";
      await this.getList(); // builds the left list and selects the clicked item
    },
    backToList() {
      this.viewMode = "list";
    },

    // ---------- detail / short view ----------
    async getList() {
      this.loading = true;
      try {
        const params = { per_page: 100, search: this.search, low_stock: this.lowStock };
        const { data } = await this.$axios.get(this.endpoint, { params });
        this.list = data.data || [];
        const current = this.list.find((x) => String(x.id) === String(this.selectedId));
        if (current) {
          this.select(current);
        } else if (this.list.length) {
          this.select(this.list[0]);
        } else {
          this.selectedId = null;
          this.selected = {};
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async select(item) {
      this.selectedId = item.id;
      this.selected = item;
      this.dateRange = null;
      this.historyFrom = null;
      this.historyTo = null;
      this.history = { item: null, summary: {}, ledger: [], last_purchase: null };
      this.historyLoading = true;
      try {
        const { data } = await this.$axios.get(`inventory-items/${item.id}/history`);
        this.history = data;
      } catch (e) {
        console.error("history load failed", e);
      } finally {
        this.historyLoading = false;
      }
    },

    // ---------- shared ----------
    openReorder(item) {
      this.selected = item;
      this.reorderLevel = item.reorder_level || 0;
      this.reorderDialog = true;
    },
    async saveReorder() {
      try {
        await this.$axios.post("inventory-reorder-level", {
          product_id: this.selected.product_id,
          reorder_level: this.reorderLevel,
        });
        this.reorderDialog = false;
        this.$swal && this.$swal.fire({ toast: true, position: "top-end", timer: 2000, showConfirmButton: false, icon: "success", title: "Reorder level updated" });
        // refresh whichever view is active
        if (this.viewMode === "split") this.getList();
        else this.getDataFromApi();
      } catch (e) {
        this.$swal && this.$swal.fire({ icon: "error", title: "Failed", text: e?.response?.data?.message || "Error" });
      }
    },
  },
};
</script>

<style scoped>
/* ----- short / master-detail view ----- */
.vn-master { gap: 16px; align-items: stretch; height: calc(100vh - 100px); }
.vn-list {
  width: 340px;
  flex: 0 0 340px;
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
.vn-item-body { min-width: 0; flex: 1 1 auto; }
.vn-thumb { border: 1px solid #eef1f5; border-radius: 8px; background: #fafbfc; }

.vn-detail-pane { min-width: 0; overflow-y: auto; border-radius: 12px; }
.item-detail {
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  min-height: 100%;
}
.vd-empty { height: calc(100vh - 100px); }
.vd-toolbar { border-radius: 0; }
.vd-act { cursor: pointer; font-size: 13px; }
.vd-act:hover { text-decoration: underline; }
.vd-doc { width: 100%; max-width: none; }
.vd-image { border: 1px solid #eef1f5; border-radius: 12px; background: #fafbfc; }
.vd-chart-wrap { position: relative; height: 340px; width: 100%; }
.vd-chart-wrap canvas { display: block; position: absolute; top: 0; left: 0; width: 100% !important; height: 100% !important; }
.vd-quickgrid { display: grid; grid-template-columns: repeat(3, max-content); gap: 8px 40px; }
.vd-q { display: flex; flex-direction: column; font-size: 14px; }
.vd-k { font-size: 11px; color: #8a96a6; letter-spacing: 0.5px; font-weight: 700; }
</style>
