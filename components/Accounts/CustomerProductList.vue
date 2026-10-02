<template>
  <div>
    <v-row dense class="align-center mb-2">
      <v-col cols="12" sm="5">
        <v-combobox
          v-model="terms"
          :items="presets"
          label="Product keywords"
          hint="Type a keyword and press Enter. Several can be combined."
          persistent-hint
          multiple
          chips
          small-chips
          deletable-chips
          outlined
          dense
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-btn color="primary" small :loading="loading" @click="load">
          <v-icon left small>mdi-magnify</v-icon> Find customers
        </v-btn>
      </v-col>
      <v-col cols="12" sm="4" class="text-right">
        <v-btn
          small
          color="green darken-1"
          dark
          class="mr-2"
          :disabled="!rows.length"
          :loading="excelLoading"
          @click="exportExcel"
        >
          <v-icon left small>mdi-file-excel</v-icon> Excel
        </v-btn>
        <v-btn
          small
          color="red darken-1"
          dark
          :disabled="!rows.length"
          :loading="pdfLoading"
          @click="exportPdf"
        >
          <v-icon left small>mdi-file-pdf-box</v-icon> PDF
        </v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" dense text class="mb-3">{{ error }}</v-alert>

    <v-row v-if="summary" dense class="mb-2">
      <v-col v-for="c in cards" :key="c.label" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <div class="text-h6" :class="c.color">{{ c.value }}</div>
          <div class="caption grey--text">{{ c.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="summary" class="caption grey--text mb-3">
      Bundles such as the Family, Mega, Glow and Trio Pack carry the product in
      their name. <b>Direct</b> means the customer chose it on its own;
      <b>Bundle</b> means they only received it inside a pack. Cancelled orders
      are excluded.
    </div>

    <v-data-table
      :headers="headers"
      :items="rows"
      :loading="loading"
      dense
      :items-per-page="25"
      :footer-props="{ 'items-per-page-options': [25, 50, 100, -1] }"
    >
      <template v-slot:item.bought_alone="{ item }">
        <v-chip x-small :color="item.bought_alone ? 'green' : 'grey'" dark>
          {{ item.bought_alone ? "Direct" : "Bundle" }}
        </v-chip>
      </template>
      <template v-slot:item.email="{ item }">
        <span v-if="item.email">{{ item.email }}</span>
        <span v-else class="grey--text">&mdash;</span>
      </template>
    </v-data-table>

    <v-snackbar v-model="snackbar" :color="snackColor" timeout="6000" top>
      {{ snackText }}
    </v-snackbar>
  </div>
</template>

<script>
import jsPDF from "jspdf";

export default {
  data() {
    return {
      terms: ["shampoo", "hair serum"],
      presets: [
        "shampoo",
        "hair serum",
        "cleanser",
        "moisturizer",
        "sunscreen",
        "body lotion",
        "lip balm",
        "body wash",
        "glow serum",
      ],
      rows: [],
      summary: null,
      loading: false,
      pdfLoading: false,
      excelLoading: false,
      error: "",
      snackbar: false,
      snackText: "",
      snackColor: "success",
      headers: [
        { text: "Customer", value: "name" },
        { text: "Email", value: "email" },
        { text: "Phone", value: "phone" },
        { text: "Bought", value: "bought_alone", align: "center" },
        { text: "Orders", value: "orders", align: "end" },
        { text: "Last order", value: "last_order", align: "center" },
      ],
    };
  },
  computed: {
    cards() {
      if (!this.summary) return [];
      const s = this.summary;
      return [
        { label: "Customers", value: s.total, color: "" },
        { label: "Bought direct", value: s.standalone, color: "green--text" },
        { label: "Bundle only", value: s.bundle_only, color: "orange--text" },
        { label: "With email", value: s.with_email, color: "" },
      ];
    },
    title() {
      return this.terms.join(" + ").toUpperCase() + " CUSTOMERS";
    },
  },
  created() {
    this.load();
  },
  methods: {
    notify(text, color) {
      this.snackText = text;
      this.snackColor = color || "success";
      this.snackbar = true;
    },
    async load() {
      if (!this.terms.length) {
        this.error = "Add at least one product keyword.";
        return;
      }
      this.loading = true;
      this.error = "";
      try {
        const { data } = await this.$axios.get("customer-product-report", {
          params: { terms: this.terms.join(",") },
        });
        this.rows = data.data || [];
        this.summary = {
          total: data.total,
          standalone: data.standalone,
          bundle_only: data.bundle_only,
          with_email: data.with_email,
        };
      } catch (e) {
        this.error =
          e?.response?.data?.message || "Could not load the customer list.";
        this.rows = [];
        this.summary = null;
      } finally {
        this.loading = false;
      }
    },
    async exportPdf() {
      this.pdfLoading = true;
      try {
        const mod = await import("jspdf-autotable");
        const autoTable =
          typeof mod.default === "function"
            ? mod.default
            : typeof mod.autoTable === "function"
            ? mod.autoTable
            : mod.default && mod.default.autoTable;

        if (typeof autoTable !== "function") {
          throw new Error("PDF table plugin did not load.");
        }

        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageW = pdf.internal.pageSize.getWidth();
        const s = this.summary;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(192, 0, 0);
        pdf.text(this.title, pageW / 2, 14, { align: "center" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(110);
        pdf.text(
          `${s.total} customers  -  ${s.standalone} bought direct, ${s.bundle_only} only inside a bundle`,
          pageW / 2,
          19.5,
          { align: "center" }
        );
        pdf.text(
          `Generated ${new Date().toLocaleDateString("en-GB")}  -  cancelled orders excluded`,
          pageW / 2,
          24,
          { align: "center" }
        );

        // Widths are pinned and the table width declared to match their sum,
        // otherwise autotable has page space it cannot distribute.
        const widths = { 0: 9, 1: 32, 2: 58, 3: 26, 4: 22, 5: 22, 6: 18 };
        const total = Object.values(widths).reduce((a, b) => a + b, 0);

        autoTable(pdf, {
          startY: 29,
          head: [["#", "Customer", "Email", "Phone", "Bought", "Orders", "Last order"]],
          body: this.rows.map((r, i) => [
            i + 1,
            r.name || "-",
            r.email || "-",
            r.phone || "-",
            r.bought_alone ? "Direct" : "Bundle",
            r.orders,
            r.last_order || "-",
          ]),
          theme: "grid",
          styles: { fontSize: 7.5, cellPadding: 1.1, overflow: "linebreak" },
          headStyles: {
            fillColor: [242, 242, 242],
            textColor: [26, 35, 126],
            fontStyle: "bold",
            halign: "center",
            fontSize: 7.5,
          },
          tableWidth: total,
          columnStyles: {
            0: { cellWidth: widths[0], halign: "right" },
            1: { cellWidth: widths[1] },
            2: { cellWidth: widths[2] },
            3: { cellWidth: widths[3] },
            4: { cellWidth: widths[4], halign: "center" },
            5: { cellWidth: widths[5], halign: "right" },
            6: { cellWidth: widths[6], halign: "center" },
          },
          showHead: "everyPage",
          margin: { left: 8, right: 8, top: 12 },
        });

        pdf.save(`customers-${this.terms.join("-")}.pdf`);
      } catch (e) {
        this.notify(
          "Could not build the PDF: " + (e && e.message ? e.message : e),
          "error"
        );
      } finally {
        this.pdfLoading = false;
      }
    },
    async exportExcel() {
      this.excelLoading = true;
      try {
        const ExcelJS = (await import("exceljs")).default;
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Customers");

        ws.mergeCells(1, 1, 1, 6);
        const t = ws.getCell(1, 1);
        t.value = this.title;
        t.font = { bold: true, size: 13, color: { argb: "FFC00000" } };
        t.alignment = { horizontal: "center" };

        const head = ws.addRow(["Customer", "Email", "Phone", "Bought", "Orders", "Last order"]);
        head.eachCell((c) => {
          c.font = { bold: true, color: { argb: "FF1A237E" } };
          c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
        });

        this.rows.forEach((r) => {
          ws.addRow([
            r.name || "",
            r.email || "",
            r.phone || "",
            r.bought_alone ? "Direct" : "Bundle",
            r.orders,
            r.last_order || "",
          ]);
        });

        ws.getColumn(1).width = 30;
        ws.getColumn(2).width = 38;
        ws.getColumn(3).width = 22;
        ws.getColumn(4).width = 12;
        ws.getColumn(5).width = 10;
        ws.getColumn(6).width = 14;
        ws.views = [{ state: "frozen", ySplit: 2 }];

        const buf = await wb.xlsx.writeBuffer();
        const blob = new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `customers-${this.terms.join("-")}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } catch (e) {
        this.notify(
          "Could not build the Excel file: " + (e && e.message ? e.message : e),
          "error"
        );
      } finally {
        this.excelLoading = false;
      }
    },
  },
};
</script>
