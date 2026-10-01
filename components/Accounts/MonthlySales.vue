<template>
  <div>
    <!-- controls -->
    <v-row class="align-center" dense>
      <v-col cols="12" sm="3">
        <v-menu
          v-model="monthMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              :value="month"
              label="Month"
              prepend-inner-icon="mdi-calendar"
              readonly
              outlined
              dense
              hide-details
              v-bind="attrs"
              v-on="on"
            />
          </template>
          <v-date-picker
            v-model="month"
            type="month"
            no-title
            @input="
              monthMenu = false;
              load();
            "
          />
        </v-menu>
      </v-col>

      <v-col cols="12" sm="5">
        <v-btn-toggle v-model="basis" mandatory dense @change="load">
          <v-btn small value="order">By order date</v-btn>
          <v-btn small value="collection">By collection date</v-btn>
        </v-btn-toggle>
      </v-col>

      <v-col cols="12" sm="4" class="text-right">
        <v-btn small color="green darken-1" dark class="mr-2" @click="exportExcel" :loading="excelLoading">
          <v-icon left small>mdi-file-excel</v-icon> Excel
        </v-btn>
        <v-btn small color="red darken-1" dark :loading="pdfLoading" @click="exportPdf">
          <v-icon left small>mdi-file-pdf-box</v-icon> PDF
        </v-btn>
      </v-col>
    </v-row>

    <div class="caption grey--text mt-1 mb-3">
      <span v-if="basis === 'order'">
        Counting orders placed in the month, and what has been collected against
        them so far.
      </span>
      <span v-else>
        Counting orders invoiced in the month, which is the closest the system
        has to the date cash arrived. Orders not yet invoiced are excluded.
      </span>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />

    <div id="monthly-report-capture" class="pa-4 white">
      <div class="text-h6 mb-1">Monthly Sales Report</div>
      <div class="caption grey--text mb-4">
        {{ data.month_label }} &mdash;
        {{ basis === "order" ? "by order date" : "by collection date" }}
      </div>

      <!-- order counts -->
      <v-row dense class="mb-2">
        <v-col v-for="c in countCards" :key="c.label" cols="6" md="2">
          <v-card outlined class="pa-3 text-center">
            <div class="text-h6" :class="c.color">{{ c.value }}</div>
            <div class="caption grey--text">{{ c.label }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- per channel -->
      <table class="rep-table mt-4">
        <thead>
          <tr>
            <th>Payment method / Platform</th>
            <th class="text-right">Total Orders</th>
            <th class="text-right">Gross Sales</th>
            <th class="text-right">Delivered (collected)</th>
            <th class="text-right">RTO / Returns</th>
            <th class="text-right">Pending Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data.channels" :key="row.channel">
            <td>{{ row.channel }}</td>
            <td class="text-right">{{ row.orders }}</td>
            <td class="text-right">{{ money(row.gross) }}</td>
            <td class="text-right green--text text--darken-2">
              {{ money(row.delivered) }}
            </td>
            <td class="text-right" :class="row.rto ? 'red--text' : 'grey--text'">
              {{ money(row.rto) }}
            </td>
            <td class="text-right">{{ money(row.pending) }}</td>
          </tr>
          <tr v-if="!data.channels.length && !loading">
            <td colspan="6" class="text-center grey--text">
              No orders in this month.
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th>TOTAL</th>
            <th class="text-right">{{ data.summary.orders }}</th>
            <th class="text-right">{{ money(data.totals.gross) }}</th>
            <th class="text-right">{{ money(data.totals.delivered) }}</th>
            <th class="text-right">{{ money(data.totals.rto) }}</th>
            <th class="text-right">{{ money(data.totals.pending) }}</th>
          </tr>
        </tfoot>
      </table>

      <!-- bottom line -->
      <v-row dense class="mt-5">
        <v-col cols="12" md="7">
          <table class="rep-table rep-table--totals">
            <tbody>
              <tr>
                <td>Total Gross Sales</td>
                <td class="text-right">{{ money(data.totals.gross) }}</td>
              </tr>
              <tr>
                <td>Total RTO / Returns</td>
                <td class="text-right red--text">
                  &minus; {{ money(data.totals.rto) }}
                </td>
              </tr>
              <tr>
                <td>Total Refunds</td>
                <td class="text-right red--text">
                  &minus; {{ money(data.totals.refunds) }}
                </td>
              </tr>
              <tr class="rep-net">
                <td>Total Net Revenue (delivered less refunds)</td>
                <td class="text-right">{{ money(data.totals.net_revenue) }}</td>
              </tr>
              <tr>
                <td>Total Pending Order Value</td>
                <td class="text-right">{{ money(data.totals.pending) }}</td>
              </tr>
              <tr>
                <td class="grey--text">Cancelled (excluded from gross)</td>
                <td class="text-right grey--text">
                  {{ money(data.totals.cancelled) }}
                </td>
              </tr>
            </tbody>
          </table>
        </v-col>
      </v-row>
    </div>

    <!-- refunds are not captured anywhere in the order flow, so they are typed in -->
    <v-card outlined class="mt-5 pa-4">
      <div class="subtitle-2 mb-1">Refunds for {{ data.month_label }}</div>
      <div class="caption grey--text mb-3">
        Refunds are not recorded against orders anywhere in the system, so this
        figure is entered by hand. It feeds Total Refunds and Net Revenue above.
      </div>
      <v-row dense class="align-center">
        <v-col cols="12" sm="3">
          <v-text-field
            v-model="refundAmount"
            label="Refund amount (AED)"
            type="number"
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="refundNote"
            label="Note (optional)"
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="3">
          <v-btn color="primary" small :loading="savingRefund" @click="saveRefund">
            Save refunds
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-snackbar v-model="snackbar" :color="snackColor" timeout="5000" top>
      {{ snackText }}
    </v-snackbar>
  </div>
</template>

<script>
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default {
  data() {
    const now = new Date();
    const month =
      now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");

    return {
      month,
      basis: "order",
      monthMenu: false,
      loading: false,
      pdfLoading: false,
      excelLoading: false,
      savingRefund: false,
      refundAmount: 0,
      refundNote: "",
      snackbar: false,
      snackText: "",
      snackColor: "success",
      data: {
        month_label: "",
        summary: { orders: 0, delivered: 0, pending: 0, cancelled: 0, rto: 0 },
        channels: [],
        daily: [],
        totals: {
          gross: 0,
          delivered: 0,
          rto: 0,
          pending: 0,
          cancelled: 0,
          refunds: 0,
          net_revenue: 0,
        },
      },
    };
  },
  computed: {
    countCards() {
      const s = this.data.summary;
      return [
        { label: "Orders received", value: s.orders, color: "" },
        { label: "Delivered", value: s.delivered, color: "green--text" },
        { label: "Pending", value: s.pending, color: "orange--text" },
        { label: "Cancelled", value: s.cancelled, color: "grey--text" },
        { label: "RTO / Returned", value: s.rto, color: "red--text" },
      ];
    },
  },
  created() {
    this.load();
  },
  methods: {
    money(n) {
      return Number(n || 0).toLocaleString("en-AE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    notify(text, color) {
      this.snackText = text;
      this.snackColor = color || "success";
      this.snackbar = true;
    },
    async load() {
      this.loading = true;
      try {
        const { data } = await this.$axios.get("monthly-sales-report", {
          params: { month: this.month, basis: this.basis },
        });
        this.data = data;
        this.refundAmount = data.totals.refunds;
        this.refundNote = data.refund_note || "";
      } catch (e) {
        this.notify(
          e?.response?.data?.message || "Could not load the report.",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
    async saveRefund() {
      this.savingRefund = true;
      try {
        await this.$axios.post("monthly-sales-report/refund", {
          period: this.month,
          amount: Number(this.refundAmount) || 0,
          note: this.refundNote || null,
        });
        await this.load();
        this.notify("Refunds saved.");
      } catch (e) {
        this.notify(
          e?.response?.data?.message || "Could not save the refunds.",
          "error"
        );
      } finally {
        this.savingRefund = false;
      }
    },
    // ExcelJS is ~1MB, and nobody pays for it until they actually export.
    async exportExcel() {
      this.excelLoading = true;
      try {
        const ExcelJS = (await import("exceljs")).default;
        const wb = new ExcelJS.Workbook();
        wb.created = new Date();

        const RED = "FFC00000";
        const money = "#,##0.00";
        const thin = { style: "thin", color: { argb: "FF9E9E9E" } };
        const border = { top: thin, left: thin, bottom: thin, right: thin };

        // Columns are whatever channels actually traded this month, so a month
        // with no Tamara does not carry an empty Tamara column.
        const channels = this.data.channels.map((c) => c.channel);
        const title = `TOTAL AMOUNT SALES - ${this.data.month_label.toUpperCase()}`;

        /* ---------- Sheet 1: daily grid, laid out like the kept sheet ------- */
        const ws = wb.addWorksheet("Daily Sales");

        ws.mergeCells(1, 1, 1, channels.length + 2);
        const titleCell = ws.getCell(1, 1);
        titleCell.value = title;
        titleCell.font = { bold: true, size: 14, color: { argb: RED } };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        ws.getRow(1).height = 26;

        const head = ["DATE", ...channels, "TOTAL"];
        const headRow = ws.addRow(head);
        headRow.height = 22;
        headRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FF1A237E" } };
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
          cell.border = border;
        });

        this.data.daily.forEach((d) => {
          const row = ws.addRow([
            this.dmy(d.date),
            ...channels.map((c) => Number(d[c] || 0)),
            Number(d.total || 0),
          ]);
          row.eachCell((cell, col) => {
            cell.border = border;
            if (col === 1) {
              cell.alignment = { horizontal: "center" };
              cell.font = { bold: true };
            } else {
              cell.numFmt = money;
              cell.alignment = { horizontal: "right" };
            }
          });
          row.getCell(head.length).font = { bold: true, color: { argb: RED } };
        });

        const sum = (key) =>
          this.data.daily.reduce((a, d) => a + Number(d[key] || 0), 0);

        const totalRow = ws.addRow([
          "TOTAL",
          ...channels.map((c) => sum(c)),
          sum("total"),
        ]);
        totalRow.height = 20;
        totalRow.eachCell((cell, col) => {
          cell.border = border;
          cell.font = { bold: true, color: { argb: RED } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDF3F3" } };
          cell.alignment = { horizontal: col === 1 ? "center" : "right" };
          if (col > 1) cell.numFmt = money;
        });

        ws.getColumn(1).width = 14;
        for (let i = 2; i <= head.length; i++) ws.getColumn(i).width = 15;
        ws.views = [{ state: "frozen", xSplit: 1, ySplit: 2 }];

        /* ---------- Sheet 2: the summary shown on screen -------------------- */
        const s = wb.addWorksheet("Summary");

        s.mergeCells(1, 1, 1, 6);
        const t2 = s.getCell(1, 1);
        t2.value = `${title} - ${this.basis === "order" ? "BY ORDER DATE" : "BY COLLECTION DATE"}`;
        t2.font = { bold: true, size: 13, color: { argb: RED } };
        t2.alignment = { horizontal: "center" };
        s.getRow(1).height = 24;

        s.addRow([]);
        const counts = s.addRow([
          "Orders received", this.data.summary.orders,
          "Delivered", this.data.summary.delivered,
          "Pending", this.data.summary.pending,
        ]);
        counts.eachCell((c, i) => {
          c.border = border;
          if (i % 2 === 1) c.font = { bold: true };
        });
        const counts2 = s.addRow([
          "Cancelled", this.data.summary.cancelled,
          "RTO / Returned", this.data.summary.rto,
          "", "",
        ]);
        counts2.eachCell((c, i) => {
          c.border = border;
          if (i % 2 === 1) c.font = { bold: true };
        });

        s.addRow([]);
        const h2 = s.addRow([
          "Payment method / Platform", "Total Orders", "Gross Sales",
          "Delivered (collected)", "RTO / Returns", "Pending Value",
        ]);
        h2.height = 22;
        h2.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FF1A237E" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
          cell.alignment = { horizontal: "center", wrapText: true };
          cell.border = border;
        });

        this.data.channels.forEach((c) => {
          const r = s.addRow([c.channel, c.orders, c.gross, c.delivered, c.rto, c.pending]);
          r.eachCell((cell, col) => {
            cell.border = border;
            if (col >= 3) cell.numFmt = money;
            if (col === 1) cell.font = { bold: true };
          });
        });

        const t = this.data.totals;
        const tr = s.addRow(["TOTAL", this.data.summary.orders, t.gross, t.delivered, t.rto, t.pending]);
        tr.eachCell((cell, col) => {
          cell.border = border;
          cell.font = { bold: true, color: { argb: RED } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDF3F3" } };
          if (col >= 3) cell.numFmt = money;
        });

        s.addRow([]);
        const bottom = [
          ["Total Gross Sales", t.gross],
          ["Total RTO / Returns", -t.rto],
          ["Total Refunds", -t.refunds],
          ["Total Net Revenue (delivered less refunds)", t.net_revenue],
          ["Total Pending Order Value", t.pending],
          ["Cancelled (excluded from gross)", t.cancelled],
        ];
        bottom.forEach(([label, value], idx) => {
          const r = s.addRow([label, "", value]);
          s.mergeCells(r.number, 1, r.number, 2);
          r.getCell(1).font = { bold: idx === 3 };
          r.getCell(3).numFmt = money;
          r.getCell(3).font = { bold: idx === 3, color: { argb: idx === 3 ? "FF1B5E20" : "FF000000" } };
          [1, 2, 3].forEach((c) => (r.getCell(c).border = border));
          if (idx === 3) {
            [1, 2, 3].forEach((c) => {
              r.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F8F3" } };
            });
          }
        });

        s.getColumn(1).width = 38;
        for (let i = 2; i <= 6; i++) s.getColumn(i).width = 18;

        const buf = await wb.xlsx.writeBuffer();
        const blob = new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `monthly-sales-${this.month}-${this.basis}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } catch (e) {
        this.notify("Could not build the Excel file.", "error");
      } finally {
        this.excelLoading = false;
      }
    },
    dmy(iso) {
      const [y, m, d] = String(iso).split("-");
      return `${d}.${m}.${y}`;
    },
    async exportPdf() {
      this.pdfLoading = true;
      try {
        const el = document.getElementById("monthly-report-capture");
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const pdf = new jsPDF("p", "mm", "a4");
        const margin = 8;
        const imgWidthMm = 210 - margin * 2;
        const pxPerMm = canvas.width / imgWidthMm;
        const pageHeightPx = Math.max(1, Math.floor((297 - margin * 2) * pxPerMm));
        const pages = Math.max(1, Math.min(20, Math.ceil(canvas.height / pageHeightPx)));

        for (let i = 0; i < pages; i++) {
          const sy = i * pageHeightPx;
          const sh = Math.min(pageHeightPx, canvas.height - sy);
          if (sh <= 0) break;

          const slice = document.createElement("canvas");
          slice.width = canvas.width;
          slice.height = sh;
          const ctx = slice.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

          if (i > 0) pdf.addPage();
          pdf.addImage(
            slice.toDataURL("image/png"),
            "PNG",
            margin,
            margin,
            imgWidthMm,
            sh / pxPerMm
          );
        }

        pdf.save(`monthly-sales-${this.month}-${this.basis}.pdf`);
      } catch (e) {
        this.notify("Could not build the PDF.", "error");
      } finally {
        this.pdfLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.rep-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.rep-table th,
.rep-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 10px;
}
.rep-table thead th {
  background: #fafafa;
  font-weight: 600;
  white-space: nowrap;
}
.rep-table tfoot th {
  background: #f5f5f5;
  font-weight: 700;
}
.rep-table--totals td {
  padding: 9px 10px;
}
.rep-net td {
  background: #f1f8f3;
  font-weight: 700;
}
</style>
