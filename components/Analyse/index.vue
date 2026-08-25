<template>
  <v-card flat style="background: none">
    <v-toolbar flat dense class="mb-2" style="background: none">
      <v-icon left color="primary">mdi-chart-line</v-icon>
      <span class="text-h6">Sales Analysis</span>
      <v-spacer></v-spacer>
      <v-col cols="3">
        <InventoryDateRange @range="onRange" />
      </v-col>
      <v-btn small depressed color="primary" class="mr-2" :loading="loading" @click="load">Submit</v-btn>
      <v-btn small depressed color="success" class="mr-2" :disabled="loading" @click="exportCsv">
        <v-icon left small>mdi-download</v-icon>Export CSV
      </v-btn>
      <v-btn small depressed color="error" class="mr-2" :disabled="loading" @click="downloadPdf">
        <v-icon left small>mdi-file-pdf-box</v-icon>Download PDF
      </v-btn>
      <v-icon color="primary" class="ml-1" @click="load">mdi-reload</v-icon>
    </v-toolbar>

    <div class="text-caption grey--text mb-1 px-1" v-if="data.range">
      Showing {{ data.range.from }} to {{ data.range.to }} &middot; {{ data.summary.order_count }} completed invoices (Cancelled &amp; Returned excluded)
    </div>
    <div class="text-caption grey--text mb-3 px-1 an-source-note">
      <v-icon x-small color="grey">mdi-information-outline</v-icon>
      This page is <strong>invoice-based</strong>: counted by invoice date and invoice status (Paid + Unpaid; Cancelled/Returned excluded).
      Accounts &rarr; Analytics is <strong>order-based</strong> (order date, status completed/processing only) — the two can legitimately show different totals for the same date range.
    </div>

    <!-- Stat cards: uniform 4-up grid, icon badge + reserved sub-line so every
         card in a row lands at the same height regardless of content length. -->
    <v-row class="px-2" dense>
      <v-col v-for="card in statCards" :key="card.label" cols="6" sm="6" md="3">
        <v-card outlined class="an-stat-card" :loading="loading">
          <v-card-text class="d-flex align-start pa-4">
            <div class="an-stat-icon" :class="card.color">
              <v-icon color="white" size="20">{{ card.icon }}</v-icon>
            </div>
            <div class="an-stat-body">
              <div class="an-stat-label">{{ card.label }}</div>
              <div class="an-stat-value" :title="card.value">{{ card.value }}</div>
              <div class="an-stat-sub" :class="card.subClass || 'grey--text'">{{ card.sub || " " }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Month-on-month comparison -->
    <v-row class="px-2 mt-2">
      <v-col cols="12">
        <v-card outlined class="an-panel">
          <div class="d-flex align-center px-4 pt-4 flex-wrap">
            <v-icon left color="primary">mdi-calendar-sync-outline</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Month-on-Month Comparison</span>
            <v-spacer></v-spacer>
            <input type="month" class="an-month-input" v-model="compare.monthA" @change="loadComparison" />
            <span class="mx-2 grey--text text-caption">vs</span>
            <input type="month" class="an-month-input" v-model="compare.monthB" @change="loadComparison" />
            <v-btn
              icon
              small
              color="success"
              class="ml-2"
              title="Download Excel"
              :disabled="!compare.a || !compare.b"
              @click="downloadComparisonExcel"
            >
              <v-icon small>mdi-file-excel-outline</v-icon>
            </v-btn>
          </div>
          <v-card-text>
            <v-progress-linear v-if="compare.loading" indeterminate color="primary" class="mb-3"></v-progress-linear>
            <table class="an-compare-table" v-if="compare.a && compare.b">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th class="text-right">{{ monthLabel(compare.monthA) }}</th>
                  <th class="text-right">{{ monthLabel(compare.monthB) }}</th>
                  <th class="text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in comparisonRows" :key="row.label">
                  <td>{{ row.label }}</td>
                  <td class="text-right">{{ row.aFmt }}</td>
                  <td class="text-right">{{ row.bFmt }}</td>
                  <td class="text-right font-weight-medium" :class="row.deltaClass">{{ row.deltaLabel }}</td>
                </tr>
              </tbody>
            </table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Revenue trend -->
    <v-row class="px-2 mt-2">
      <v-col cols="12">
        <v-card outlined class="an-panel">
          <div class="d-flex align-center px-4 pt-4">
            <v-icon left color="primary">mdi-chart-timeline-variant</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Daily Revenue Trend</span>
            <v-spacer></v-spacer>
            <v-btn icon small :color="chartType === 'line' ? 'primary' : 'grey lighten-1'" title="Trend line" @click="chartType = 'line'">
              <v-icon small>mdi-chart-line</v-icon>
            </v-btn>
            <v-btn icon small :color="chartType === 'area' ? 'primary' : 'grey lighten-1'" title="Area chart" @click="chartType = 'area'">
              <v-icon small>mdi-chart-areaspline</v-icon>
            </v-btn>
            <v-btn icon small :color="chartType === 'bar' ? 'primary' : 'grey lighten-1'" title="Bar chart" @click="chartType = 'bar'">
              <v-icon small>mdi-chart-bar</v-icon>
            </v-btn>
          </div>
          <v-card-text>
            <div class="an-chart-wrap">
              <ChartsBar v-if="chartType === 'bar' && trendChartData" :chart-data="trendChartData" :options="trendChartOptions" />
              <ChartsLine v-else-if="trendChartData" :chart-data="trendChartData" :options="trendChartOptions" />
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
    <v-row class="px-2 mt-2" align="stretch">
      <v-col cols="12" md="6">
        <v-card outlined class="an-panel">
          <v-card-title class="text-subtitle-1">
            <v-icon left color="green">mdi-trending-up</v-icon> Top 10 Best-Selling — by Units
          </v-card-title>
          <v-card-text>
            <HBarRow v-for="(p, i) in data.top_by_qty" :key="'q' + i" :label="p.name" :value="p.qty" :max="maxTopQty" color="#2a78d6" :fmt="(n) => n + ' units'" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="an-panel">
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
        <v-card outlined class="an-panel">
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
    <v-row class="px-2 mt-2" align="stretch">
      <v-col cols="12" md="4">
        <v-card outlined class="an-panel">
          <v-card-title class="text-subtitle-1"><v-icon left color="primary">mdi-truck-outline</v-icon> Delivery Service</v-card-title>
          <v-card-text>
            <HBarRow v-for="(c, i) in data.channels.delivery_service" :key="'d' + i" :label="c.label" :value="c.count" :max="maxChannel(data.channels.delivery_service)" :color="catColor(i)" :fmt="(n) => n + ' &middot; ' + pct(n, data.summary.order_count)" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined class="an-panel">
          <v-card-title class="text-subtitle-1"><v-icon left color="primary">mdi-source-branch</v-icon> Order Source</v-card-title>
          <v-card-text>
            <HBarRow v-for="(c, i) in data.channels.business_source" :key="'s' + i" :label="c.label" :value="c.count" :max="maxChannel(data.channels.business_source)" :color="catColor(i)" :fmt="(n) => n + ' &middot; ' + pct(n, data.summary.order_count)" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined class="an-panel">
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
        <v-card outlined class="an-panel" :style="{ borderLeft: '4px solid ' + s.color }">
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
import * as XLSX from "xlsx";

const CAT_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"];

// "YYYY-MM" for the month `offset` months from now (0 = current month).
function ymOffset(offset) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

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
    chartType: "area", // "line" | "area" | "bar"
    range: { from: null, to: null },
    compare: { monthA: ymOffset(-1), monthB: ymOffset(0), loading: false, a: null, b: null },
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
      const rows = this.data.daily || [];
      const half = Math.ceil(rows.length / 2);
      const sum = (arr, key) => arr.reduce((t, r) => t + (Number(r[key]) || 0), 0);
      const m1rev = sum(rows.slice(0, half), "revenue");
      const m2rev = sum(rows.slice(half), "revenue");
      const m1ord = sum(rows.slice(0, half), "orders");
      const m2ord = sum(rows.slice(half), "orders");
      const revDelta = m1rev > 0 ? ((m2rev - m1rev) / m1rev) * 100 : 0;
      const ordDelta = m1ord > 0 ? ((m2ord - m1ord) / m1ord) * 100 : 0;
      const deltaSub = (d) => (rows.length < 2 ? "" : (d >= 0 ? "▲ " : "▼ ") + Math.abs(d).toFixed(1) + "% vs first half");
      const deltaClass = (d) => (rows.length < 2 ? "grey--text" : d >= 0 ? "green--text" : "red--text");

      const bestQty = this.data.top_by_qty[0];
      const bestRev = this.data.top_by_revenue[0];

      return [
        { label: "Total Revenue", value: this.money(s.total_revenue || 0), sub: deltaSub(revDelta), subClass: deltaClass(revDelta), icon: "mdi-cash-multiple", color: "primary" },
        { label: "Total Orders", value: this.fmtNum(s.order_count), sub: deltaSub(ordDelta), subClass: deltaClass(ordDelta), icon: "mdi-cart-outline", color: "indigo" },
        { label: "Avg Order Value", value: this.money(s.avg_order_value || 0), sub: "per invoice", icon: "mdi-receipt-text-outline", color: "deep-purple" },
        { label: "Items Sold", value: this.fmtNum(s.total_items_sold), sub: "across " + (s.unique_products || 0) + " products", icon: "mdi-package-variant", color: "teal" },
        { label: "Unique Customers", value: this.fmtNum(s.unique_customers), sub: s.unique_customers ? (s.order_count / s.unique_customers).toFixed(2) + " orders / customer" : "", icon: "mdi-account-group-outline", color: "green" },
        { label: "Regular Customers", value: this.fmtNum(s.repeat_customers), sub: this.pct(s.repeat_customers, s.unique_customers) + " of customers", icon: "mdi-account-heart-outline", color: "deep-orange" },
        { label: "Best Seller (units)", value: bestQty ? this.short(bestQty.name, 20) : "—", sub: bestQty ? this.fmtNum(bestQty.qty) + " units sold" : "", icon: "mdi-trophy-outline", color: "pink" },
        { label: "Top Revenue Product", value: bestRev ? this.short(bestRev.name, 20) : "—", sub: bestRev ? this.money(bestRev.revenue) : "", icon: "mdi-crown-outline", color: "blue-grey" },
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
      const labels = rows.map((r) => r.date.slice(5));
      const values = rows.map((r) => r.revenue);

      if (this.chartType === "bar") {
        return {
          labels,
          datasets: [
            {
              label: "Revenue",
              data: values,
              backgroundColor: "rgba(42,120,214,0.75)",
              hoverBackgroundColor: "#1976D2",
              borderWidth: 0,
              barPercentage: 0.7,
              categoryPercentage: 0.85,
            },
          ],
        };
      }

      const isArea = this.chartType === "area";
      return {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: values,
            borderColor: "#2a78d6",
            backgroundColor: isArea ? "rgba(42,120,214,0.14)" : "transparent",
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 4,
            fill: isArea,
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
    comparisonRows() {
      if (!this.compare.a || !this.compare.b) return [];
      const sa = this.compare.a.summary || {};
      const sb = this.compare.b.summary || {};
      const metrics = [
        { key: "total_revenue", label: "Total Revenue", fmt: this.money },
        { key: "order_count", label: "Total Orders", fmt: this.fmtNum },
        { key: "avg_order_value", label: "Avg Order Value", fmt: this.money },
        { key: "total_items_sold", label: "Items Sold", fmt: this.fmtNum },
        { key: "unique_customers", label: "Unique Customers", fmt: this.fmtNum },
        { key: "repeat_customers", label: "Regular Customers", fmt: this.fmtNum },
      ];
      const rows = metrics.map((m) => {
        const av = Number(sa[m.key] || 0);
        const bv = Number(sb[m.key] || 0);
        const delta = av > 0 ? ((bv - av) / av) * 100 : bv > 0 ? 100 : 0;
        return {
          label: m.label,
          aFmt: m.fmt(av),
          bFmt: m.fmt(bv),
          deltaLabel: (delta >= 0 ? "▲ " : "▼ ") + Math.abs(delta).toFixed(1) + "%",
          deltaClass: delta >= 0 ? "green--text" : "red--text",
        };
      });

      const topA = (this.compare.a.top_by_revenue || [])[0];
      const topB = (this.compare.b.top_by_revenue || [])[0];
      const revA = Number((topA && topA.revenue) || 0);
      const revB = Number((topB && topB.revenue) || 0);
      const revDelta = revA > 0 ? ((revB - revA) / revA) * 100 : revB > 0 ? 100 : 0;
      rows.push({
        label: "Top Revenue Product",
        aFmt: topA ? `${this.short(topA.name, 26)} — ${this.money(revA)}` : "—",
        bFmt: topB ? `${this.short(topB.name, 26)} — ${this.money(revB)}` : "—",
        deltaLabel: topA || topB ? (revDelta >= 0 ? "▲ " : "▼ ") + Math.abs(revDelta).toFixed(1) + "%" : "—",
        deltaClass: revDelta >= 0 ? "green--text" : "red--text",
      });

      return rows;
    },
  },

  created() {
    this.load();
    this.loadComparison();
  },

  methods: {
    monthRange(ym) {
      const [y, m] = ym.split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      return { from: `${ym}-01`, to: `${ym}-${String(lastDay).padStart(2, "0")}` };
    },
    monthLabel(ym) {
      const [y, m] = ym.split("-").map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    },
    async loadComparison() {
      this.compare.loading = true;
      try {
        const [ra, rb] = await Promise.all([
          this.$axios.get("sales-analysis", { params: this.monthRange(this.compare.monthA) }),
          this.$axios.get("sales-analysis", { params: this.monthRange(this.compare.monthB) }),
        ]);
        this.compare.a = ra.data;
        this.compare.b = rb.data;
      } catch (e) {
        console.error("Month comparison load failed", e);
      } finally {
        this.compare.loading = false;
      }
    },
    downloadComparisonExcel() {
      if (!this.compare.a || !this.compare.b) return;
      const labelA = this.monthLabel(this.compare.monthA);
      const labelB = this.monthLabel(this.compare.monthB);

      const rows = [
        ["Metric", labelA, labelB, "Change"],
        ...this.comparisonRows.map((r) => [r.label, r.aFmt, r.bFmt, r.deltaLabel]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [{ wch: 24 }, { wch: 30 }, { wch: 30 }, { wch: 12 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Comparison");
      XLSX.writeFile(wb, `month-comparison-${this.compare.monthA}_vs_${this.compare.monthB}.xlsx`);
    },
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
    fmtNum(v) {
      return Number(v || 0).toLocaleString("en-US");
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
      // Store the picked range; wait for Submit rather than loading on every
      // keystroke/field change (matches Orders/Inventory List elsewhere).
      this.range = { from, to };
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
/* Panels: consistent rounding + full row height so side-by-side cards with
   different content lengths (channel lists, top-seller lists) line up. */
.an-panel { border-radius: 10px; height: 100%; }
.an-source-note { line-height: 1.5; }
.an-source-note .v-icon { margin-right: 2px; vertical-align: text-top; }

/* Stat cards: icon badge + reserved sub-line (always rendered, even blank)
   so every card in a row lands at the same height regardless of content. */
.an-stat-card { border-radius: 10px; height: 100%; transition: box-shadow 0.15s ease; }
.an-stat-card:hover { box-shadow: 0 3px 12px rgba(11, 11, 11, 0.08) !important; }
.an-stat-icon {
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
}
.an-stat-body { min-width: 0; flex: 1 1 auto; }
.an-stat-label {
  font-size: 11px;
  font-weight: 700;
  color: #8a96a6;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.an-stat-value {
  font-size: 19px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.an-stat-sub {
  font-size: 11px;
  font-weight: 600;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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

.an-month-input {
  border: 1px solid #dde2e8;
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 13px;
  color: #333;
  background: #fff;
}
.an-compare-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.an-compare-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; color: #8a96a6; padding: 8px 10px; border-bottom: 2px solid #eef1f5; }
.an-compare-table td { padding: 9px 10px; border-bottom: 1px solid #eef1f5; }
.an-compare-table tr:last-child td { border-bottom: none; }
</style>
