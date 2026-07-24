<template>
  <v-card flat style="background: none">
    <v-toolbar flat dense class="mb-2" style="background: none">
      <v-icon left color="primary">mdi-chart-line</v-icon>
      <span class="text-h6">Sales Analysis</span>
      <v-spacer></v-spacer>
      <v-col cols="3">
        <InventoryDateRange @range="onRange" />
      </v-col>
      <v-btn small depressed color="success" class="mr-2" :disabled="loading" @click="exportCsv">
        <v-icon left small>mdi-download</v-icon>Export CSV
      </v-btn>
      <v-btn small depressed color="error" class="mr-2" :disabled="loading" @click="downloadPdf">
        <v-icon left small>mdi-file-pdf-box</v-icon>Download PDF
      </v-btn>
      <v-icon color="primary" class="ml-1" @click="load">mdi-reload</v-icon>
    </v-toolbar>

    <div class="text-caption grey--text mb-3 px-1" v-if="data.range">
      Showing {{ data.range.from }} to {{ data.range.to }} &middot; {{ data.summary.order_count }} completed invoices (Cancelled &amp; Returned excluded)
    </div>

    <!-- Stat cards -->
    <v-row class="px-2">
      <v-col v-for="card in statCards" :key="card.label" cols="12" sm="6" md="4" lg="2">
        <v-card outlined :loading="loading">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption grey--text text--darken-1">{{ card.label }}</div>
                <div class="text-h6 font-weight-bold" :class="card.color + '--text'">{{ card.value }}</div>
                <div v-if="card.sub" class="text-caption grey--text">{{ card.sub }}</div>
              </div>
              <v-btn fab text small :class="card.color">
                <v-icon color="white">{{ card.icon }}</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Revenue trend -->
    <v-row class="px-2 mt-2">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="text-subtitle-1">
            <v-icon left color="primary">mdi-chart-timeline-variant</v-icon> Daily Revenue Trend
          </v-card-title>
          <v-card-text>
            <div class="an-chart-wrap">
              <ChartsLine v-if="trendChartData" :chart-data="trendChartData" :options="trendChartOptions" />
            </div>
            <div v-if="peakDay" class="an-callout mt-3">
              <strong>{{ peakDay.label }}</strong> shows the largest single-day revenue ({{ money(peakDay.revenue) }}, {{ peakDay.orders }} orders) —
              roughly {{ peakMultiple }}&times; the daily average. Worth reviewing what drove it so it can be reproduced deliberately.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Top sellers -->
    <v-row class="px-2 mt-2">
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="text-subtitle-1">
            <v-icon left color="green">mdi-trending-up</v-icon> Top 10 Best-Selling — by Units
          </v-card-title>
          <v-card-text>
            <HBarRow v-for="(p, i) in data.top_by_qty" :key="'q' + i" :label="p.name" :value="p.qty" :max="maxTopQty" color="#2a78d6" :fmt="(n) => n + ' units'" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="text-subtitle-1">
            <v-icon left color="orange">mdi-cash-multiple</v-icon> Top 10 Best-Selling — by Revenue
          </v-card-title>
          <v-card-text>
            <HBarRow v-for="(p, i) in data.top_by_revenue" :key="'r' + i" :label="p.name" :value="p.revenue" :max="maxTopRevenue" color="#eb6834" :fmt="(n) => money(n)" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Product tables -->
    <v-row class="px-2 mt-2">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="text-subtitle-1">
            <v-icon left color="primary">mdi-format-list-numbered</v-icon> Product Performance
          </v-card-title>
          <v-tabs v-model="tab" dense>
            <v-tab>Top 10 by Units</v-tab>
            <v-tab>Top 10 by Revenue</v-tab>
            <v-tab>Least-Selling</v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item>
              <v-data-table dense :headers="productHeaders" :items="data.top_by_qty" :items-per-page="10" :loading="loading" class="elevation-0">
                <template v-slot:item.revenue="{ item }">{{ money(item.revenue) }}</template>
                <template v-slot:item.trend="{ item }"><span v-html="trendLabel(item)"></span></template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item>
              <v-data-table dense :headers="productHeaders" :items="data.top_by_revenue" :items-per-page="10" :loading="loading" class="elevation-0">
                <template v-slot:item.revenue="{ item }">{{ money(item.revenue) }}</template>
                <template v-slot:item.trend="{ item }"><span v-html="trendLabel(item)"></span></template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item>
              <v-data-table dense :headers="productHeadersNoTrend" :items="data.bottom_by_qty" :items-per-page="12" :loading="loading" class="elevation-0">
                <template v-slot:item.revenue="{ item }">{{ money(item.revenue) }}</template>
              </v-data-table>
              <div v-if="(data.bottom_by_qty || []).length" class="an-callout ma-4">
                <strong>{{ data.bottom_by_qty.length }} of {{ data.summary.unique_products }} products</strong> sold in the single digits over this period, contributing only
                {{ money(bottomRevenueSum) }} &mdash; under {{ pct(bottomRevenueSum, data.summary.total_revenue) }} of total revenue. Consider bundling, discounting, or trimming these.
              </div>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
    </v-row>

    <!-- Channel mix -->
    <v-row class="px-2 mt-2">
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="text-subtitle-1"><v-icon left color="primary">mdi-truck-outline</v-icon> Delivery Service</v-card-title>
          <v-card-text>
            <HBarRow v-for="(c, i) in data.channels.delivery_service" :key="'d' + i" :label="c.label" :value="c.count" :max="maxChannel(data.channels.delivery_service)" :color="catColor(i)" :fmt="(n) => n + ' &middot; ' + pct(n, data.summary.order_count)" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="text-subtitle-1"><v-icon left color="primary">mdi-source-branch</v-icon> Order Source</v-card-title>
          <v-card-text>
            <HBarRow v-for="(c, i) in data.channels.business_source" :key="'s' + i" :label="c.label" :value="c.count" :max="maxChannel(data.channels.business_source)" :color="catColor(i)" :fmt="(n) => n + ' &middot; ' + pct(n, data.summary.order_count)" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="text-subtitle-1"><v-icon left color="primary">mdi-credit-card-outline</v-icon> Payment Method</v-card-title>
          <v-card-text>
            <HBarRow v-for="(c, i) in data.channels.payment_mode" :key="'p' + i" :label="c.label" :value="c.count" :max="maxChannel(data.channels.payment_mode)" :color="catColor(i)" :fmt="(n) => n + ' &middot; ' + pct(n, data.summary.order_count)" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Payment status -->
    <v-row class="px-2 mt-2 mb-4">
      <v-col cols="6" md="3" v-for="s in statusCards" :key="s.label">
        <v-card outlined :style="{ borderLeft: '4px solid ' + s.color }">
          <v-card-text>
            <div class="text-caption grey--text">{{ s.label }}</div>
            <div class="text-h6 font-weight-bold">{{ s.value }}</div>
            <div class="text-caption grey--text">{{ pct(s.value, data.summary.order_count) }} of orders</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
const CAT_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"];

export default {
  components: {
    HBarRow: {
      props: { label: String, value: Number, max: Number, color: String, fmt: Function },
      render(h) {
        const w = this.max ? Math.max(2, (this.value / this.max) * 100) : 0;
        return h("div", { class: "an-hbar-row" }, [
          h("div", { class: "an-hbar-label", attrs: { title: this.label } }, this.label),
          h("div", { class: "an-hbar-track" }, [
            h("div", { class: "an-hbar-fill", style: { width: w + "%", background: this.color } }),
          ]),
          h("div", { class: "an-hbar-value", domProps: { innerHTML: this.fmt ? this.fmt(this.value) : this.value } }),
        ]);
      },
    },
  },
  data: () => ({
    loading: false,
    tab: 0,
    range: { from: null, to: null },
    data: { range: null, summary: {}, daily: [], top_by_qty: [], top_by_revenue: [], bottom_by_qty: [], channels: { delivery_service: [], business_source: [], payment_mode: [] }, status_count: {} },
    productHeaders: [
      { text: "Product", value: "name" },
      { text: "Qty Sold", value: "qty", align: "end" },
      { text: "Revenue", value: "revenue", align: "end" },
      { text: "Orders", value: "orders", align: "end" },
      { text: "Trend", value: "trend", align: "end", sortable: false },
    ],
    productHeadersNoTrend: [
      { text: "Product", value: "name" },
      { text: "Qty Sold", value: "qty", align: "end" },
      { text: "Revenue", value: "revenue", align: "end" },
      { text: "Orders", value: "orders", align: "end" },
    ],
  }),

  computed: {
    statCards() {
      const s = this.data.summary || {};
      return [
        { label: "Total Revenue", value: this.money(s.total_revenue || 0), icon: "mdi-cash-multiple", color: "primary" },
        { label: "Total Orders", value: s.order_count || 0, icon: "mdi-cart-outline", color: "indigo" },
        { label: "Items Sold", value: s.total_items_sold || 0, sub: (s.unique_products || 0) + " products", icon: "mdi-package-variant", color: "teal" },
        { label: "Avg Order Value", value: this.money(s.avg_order_value || 0), icon: "mdi-receipt-text-outline", color: "deep-purple" },
        { label: "Unique Customers", value: s.unique_customers || 0, icon: "mdi-account-group-outline", color: "green" },
        { label: "Best Seller", value: s.order_count ? this.short((this.data.top_by_qty[0] || {}).name || "—", 22) : "—", sub: this.data.top_by_qty[0] ? this.data.top_by_qty[0].qty + " units" : "", icon: "mdi-star-outline", color: "orange" },
      ];
    },
    statusCards() {
      const sc = this.data.status_count || {};
      const order = ["Paid", "Unpaid", "Cancelled", "Returned"];
      const colors = { Paid: "#0ca30c", Unpaid: "#fab219", Cancelled: "#d03b3b", Returned: "#898781" };
      return Object.keys(sc)
        .sort((a, b) => order.indexOf(a) - order.indexOf(b))
        .map((k) => ({ label: k, value: sc[k], color: colors[k] || "#2a78d6" }));
    },
    maxTopQty() {
      return Math.max(1, ...(this.data.top_by_qty || []).map((p) => p.qty));
    },
    maxTopRevenue() {
      return Math.max(1, ...(this.data.top_by_revenue || []).map((p) => p.revenue));
    },
    bottomRevenueSum() {
      return (this.data.bottom_by_qty || []).reduce((s, p) => s + Number(p.revenue || 0), 0);
    },
    trendChartData() {
      const rows = this.data.daily || [];
      if (!rows.length) return null;
      return {
        labels: rows.map((r) => r.date.slice(5)),
        datasets: [
          {
            label: "Revenue",
            data: rows.map((r) => r.revenue),
            borderColor: "#2a78d6",
            backgroundColor: "rgba(42,120,214,0.12)",
            borderWidth: 2,
            pointRadius: 2,
            fill: true,
            lineTension: 0.3,
          },
        ],
      };
    },
    trendChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        tooltips: { mode: "index", intersect: false, callbacks: { label: (item) => this.money(item.yLabel) } },
        scales: {
          xAxes: [{ gridLines: { display: false }, ticks: { maxTicksLimit: 10, fontColor: "#8a96a6" } }],
          yAxes: [{ ticks: { beginAtZero: true, fontColor: "#8a96a6", callback: (v) => (v >= 1000 ? v / 1000 + "K" : v) }, gridLines: { color: "rgba(0,0,0,0.05)" } }],
        },
      };
    },
    peakDay() {
      const rows = this.data.daily || [];
      if (!rows.length) return null;
      const peak = rows.reduce((a, b) => (b.revenue > a.revenue ? b : a));
      return peak.revenue > 0 ? { label: this.fmtDate(peak.date), revenue: peak.revenue, orders: peak.orders } : null;
    },
    peakMultiple() {
      const rows = this.data.daily || [];
      if (!rows.length || !this.peakDay) return 0;
      const avg = rows.reduce((s, r) => s + r.revenue, 0) / rows.length;
      return avg > 0 ? Math.round(this.peakDay.revenue / avg) : 0;
    },
  },

  created() {
    this.load();
  },

  methods: {
    downloadPdf() {
      const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8001/api/";
      const params = {};
      if (this.range.from) params.from = this.range.from;
      if (this.range.to) params.to = this.range.to;
      const qs = new URLSearchParams(params).toString();
      const finalUrl = `${backendUrl}sales-analysis-pdf${qs ? "?" + qs : ""}`;
      const link = document.createElement("a");
      link.href = finalUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    money(v) {
      return this.$utils ? this.$utils.currency_format(v || 0, "AED", false) : "AED " + Number(v || 0).toFixed(0);
    },
    pct(n, d) {
      return d ? ((n / d) * 100).toFixed(1) + "%" : "0%";
    },
    short(s, max) {
      s = s || "";
      return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
    },
    fmtDate(d) {
      return this.$dateFormat ? this.$dateFormat.dmy(d) : d;
    },
    catColor(i) {
      return CAT_COLORS[i % CAT_COLORS.length];
    },
    maxChannel(arr) {
      return Math.max(1, ...(arr || []).map((c) => c.count));
    },
    trendLabel(item) {
      const m1 = Number(item.qty_m1 || 0);
      const m2 = Number(item.qty_m2 || 0);
      if (m1 === 0 && m2 === 0) return '<span class="grey--text">—</span>';
      if (m1 === 0) return '<span class="green--text">▲ new</span>';
      const d = ((m2 - m1) / m1) * 100;
      if (Math.abs(d) < 5) return '<span class="grey--text">▬ steady</span>';
      return d > 0 ? `<span class="green--text">▲ +${d.toFixed(0)}%</span>` : `<span class="red--text">▼ ${d.toFixed(0)}%</span>`;
    },
    onRange({ from, to }) {
      this.range = { from, to };
      this.load();
    },
    async load() {
      this.loading = true;
      try {
        const params = {};
        if (this.range.from) params.from = this.range.from;
        if (this.range.to) params.to = this.range.to;
        const { data } = await this.$axios.get("sales-analysis", { params });
        this.data = data;
      } catch (e) {
        console.error("Sales analysis load failed", e);
      } finally {
        this.loading = false;
      }
    },
    downloadCsv(filename, columns, rows) {
      const esc = (v) => {
        const s = v === null || v === undefined ? "" : String(v);
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const lines = [columns.map(esc).join(",")];
      rows.forEach((r) => lines.push(r.map(esc).join(",")));
      const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    exportCsv() {
      const rows = [
        ...this.data.top_by_qty.map((p) => ["Top by Qty", p.name, p.qty, p.revenue, p.orders]),
        ...this.data.top_by_revenue.map((p) => ["Top by Revenue", p.name, p.qty, p.revenue, p.orders]),
        ...this.data.bottom_by_qty.map((p) => ["Least-Selling", p.name, p.qty, p.revenue, p.orders]),
      ];
      const range = this.data.range ? `${this.data.range.from}_to_${this.data.range.to}` : "report";
      this.downloadCsv(`sales-analysis-${range}.csv`, ["Category", "Product", "Qty Sold", "Revenue", "Orders"], rows);
    },
  },
};
</script>

<style scoped>
/* vue-chartjs renders <div><canvas/></div> — only that inner div gets this
   component's scope attribute, so the canvas needs a deep selector. Pin the
   div to the wrapper's box to give chart.js an unambiguous height to measure. */
.an-chart-wrap { position: relative; height: 260px; width: 100%; overflow: hidden; }
.an-chart-wrap > div { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.an-chart-wrap >>> canvas { display: block; width: 100% !important; height: 100% !important; }

.an-callout {
  background: #fff7ef;
  border: 1px solid #f3d9c2;
  border-left: 4px solid #e0672a;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12.5px;
  line-height: 1.5;
}
.an-hbar-row { display: flex; align-items: center; gap: 10px; padding: 5px 0; }
.an-hbar-label { flex: 0 0 42%; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.an-hbar-track { flex: 1 1 auto; height: 14px; background: #eef1f5; border-radius: 4px; overflow: hidden; }
.an-hbar-fill { height: 100%; border-radius: 4px; }
.an-hbar-value { flex: 0 0 auto; font-size: 11.5px; font-weight: 600; color: #52514e; min-width: 70px; text-align: right; }
</style>
