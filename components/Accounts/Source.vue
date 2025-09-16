<template>
  <div ref="reportArea" class="pa-15">
    <div
      class="d-flex align-center px-3 py-1"
      style="background: #a7f3d0; justify-content: space-between"
    >
      <div class="text-center flex-grow-1">Source</div>

      <v-icon v-if="showIcons" color="#618b77" @click="exportToExcel">
        mdi-file-excel
      </v-icon>

      <v-icon v-if="showIcons" color="#618b77" @click="downloadPDF"
        >mdi-download</v-icon
      >
    </div>
    <table
      class="report-table"
      border="1"
      style="width: 100%; text-align: center"
    >
      <thead>
        <tr>
          <td class="text-center" rowspan="2">DATE</td>
          <td
            class="text-center"
            v-for="method in paymentMethods"
            :key="method"
            colspan="2"
          >
            {{ method }}
          </td>
          <td class="text-center" rowspan="2">Total QTY</td>
          <td class="text-center" rowspan="2">Total Price</td>
        </tr>
        <tr>
          <template v-for="method in paymentMethods">
            <td class="text-center">PRICE</td>
            <td class="text-center">QTY</td>
          </template>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(methods, date) in tableData" :key="date">
          <td class="text-center">{{ date }}</td>
          <template v-for="method in paymentMethods">
            <td class="text-center custom-td">
              {{ methods[method] ? methods[method].price : "0.00" }}
            </td>
            <td class="text-center custom-td">
              {{ methods[method] ? methods[method].quantity : 0 }}
            </td>
          </template>

          <td class="text-center" style="font-weight: bold">
            {{ getRowTotalQty(methods) }}
          </td>
          <td class="text-center" style="font-weight: bold">
            {{ getRowTotalPrice(methods) }}
          </td>
        </tr>
      </tbody>

      <tfoot>
        <tr>
          <td class="text-center" rowspan="2" style="font-weight: bold">
            TOTAL
          </td>
          <template v-for="method in paymentMethods">
            <td class="text-center" style="font-weight: bold">
              {{ getTotalPrice(method) }}
            </td>
            <td class="text-center" style="font-weight: bold">
              {{ getTotalQty(method) }}
            </td>
          </template>

          <td class="text-center" style="font-weight: bold">
            {{
              Object.values(tableData).reduce(
                (acc, methodsObj) =>
                  acc +
                  Object.values(methodsObj).reduce(
                    (sum, m) => sum + m.quantity,
                    0
                  ),
                0
              )
            }}
          </td>
          <td class="text-center" style="font-weight: bold">
            {{
              Object.values(tableData)
                .reduce(
                  (acc, methodsObj) =>
                    acc +
                    Object.values(methodsObj).reduce(
                      (sum, m) => sum + parseFloat(m.price),
                      0
                    ),
                  0
                )
                .toFixed(2)
            }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
export default {
  props: ["filters"],
  data() {
    return {
      loading: false,
      tableData: {}, // response from report-payment-modes
      paymentMethods: [], // dynamic payment method names
      showIcons:true,
    };
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        this.getData();
      },
    },
  },
  async created() {
    await this.getData();
  },
  methods: {
    async getData() {
      this.loading = true;
      try {
        this.tableData = await this.$axios.$get("/report-sources", {
          params: this.filters,
        });
        // Extract unique payment methods from all dates
        const methodsSet = new Set();
        Object.values(this.tableData).forEach((methodsObj) => {
          Object.keys(methodsObj).forEach((method) => {
            methodsSet.add(method);
          });
        });
        this.paymentMethods = Array.from(methodsSet);
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    getTotalPrice(methodName) {
      let total = 0;
      Object.values(this.tableData).forEach((methodsObj) => {
        const item = methodsObj[methodName];
        if (item) total += parseFloat(item.price);
      });
      return total.toFixed(2);
    },

    getTotalQty(methodName) {
      let total = 0;
      Object.values(this.tableData).forEach((methodsObj) => {
        const item = methodsObj[methodName];
        if (item) total += item.quantity;
      });
      return total;
    },

    getRowTotalPrice(methodsObj) {
      let total = 0;
      Object.values(methodsObj).forEach((m) => {
        total += parseFloat(m.price);
      });
      return total.toFixed(2);
    },

    getRowTotalQty(methodsObj) {
      let total = 0;
      Object.values(methodsObj).forEach((m) => {
        total += m.quantity;
      });
      return total;
    },
    exportToExcel() {
      const ws = XLSX.utils.aoa_to_sheet([]);

      // --- Header Rows ---
      const header1 = ["DATE"];
      this.paymentMethods.forEach((product) => {
        header1.push(product, "");
      });
      header1.push("Total QTY", "Total Price");
      XLSX.utils.sheet_add_aoa(ws, [header1], { origin: "A1" });

      const header2 = [""];
      this.paymentMethods.forEach(() => {
        header2.push("PRICE", "QTY");
      });
      header2.push("", "");
      XLSX.utils.sheet_add_aoa(ws, [header2], { origin: "A2" });

      // --- Merges ---
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // DATE rowspan
        {
          s: { r: 0, c: 1 + this.paymentMethods.length * 2 },
          e: { r: 1, c: 1 + this.paymentMethods.length * 2 },
        }, // Total QTY
        {
          s: { r: 0, c: 2 + this.paymentMethods.length * 2 },
          e: { r: 1, c: 2 + this.paymentMethods.length * 2 },
        }, // Total Price
        ...this.paymentMethods.map((_, i) => ({
          s: { r: 0, c: 1 + i * 2 },
          e: { r: 0, c: 2 + i * 2 },
        })),
      ];

      // --- Data Rows ---
      const dataRows = [];
      Object.entries(this.tableData).forEach(([date, products]) => {
        const row = [date];
        this.paymentMethods.forEach((pName) => {
          const item = Object.values(products).find((p) => p.product === pName);
          row.push(item ? Number(item.price) : 0); // Ensure number
          row.push(item ? Number(item.quantity) : 0); // Ensure number
        });
        row.push(this.getRowTotalQty(products)); // number
        row.push(Number(this.getRowTotalPrice(products))); // number
        dataRows.push(row);
      });
      XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: -1 });

      // --- Footer / Grand Total ---
      const totalRow = ["Total"];
      this.paymentMethods.forEach((pName) => {
        totalRow.push(Number(this.getTotalPrice(pName)));
        totalRow.push(this.getTotalQty(pName));
      });

      const grandTotalQty = Object.values(this.tableData).reduce(
        (acc, pObj) =>
          acc +
          Object.values(pObj).reduce((sum, p) => sum + Number(p.quantity), 0),
        0
      );
      const grandTotalPrice = Object.values(this.tableData).reduce(
        (acc, pObj) =>
          acc +
          Object.values(pObj).reduce((sum, p) => sum + Number(p.price), 0),
        0
      );
      totalRow.push(grandTotalQty, grandTotalPrice);
      XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: -1 });

      // --- Styles ---
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = 0; R <= range.e.r; R++) {
        for (let C = 0; C <= range.e.c; C++) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellRef];
          if (!cell) continue;

          // Headers (first 2 rows) -> center
          if (R < 2) {
            cell.s = { alignment: { horizontal: "center" } };
          } else {
            // DATE column -> center, everything else -> right
            if (C === 0) {
              cell.s = { alignment: { horizontal: "center" } };
            } else {
              cell.s = { alignment: { horizontal: "right" } };
            }
          }
        }
      }

      // --- Column widths ---
      ws["!cols"] = [{ wpx: 120 }];
      for (let i = 1; i <= this.paymentMethods.length * 2 + 2; i++)
        ws["!cols"].push({ wpx: 80 });

      // --- Export ---
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, "source-report.xlsx");
    },
    downloadPDF() {
      this.showIcons = false;

      // give DOM time to update before capturing
      setTimeout(() => {
        const reportArea = this.$refs.reportArea;

        html2canvas(reportArea, {
          scale: 2,
          useCORS: true,
        }).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");

          const pdf = new jsPDF("l", "mm", "a4");
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;

          while (heightLeft > 0) {
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            if (heightLeft > 0) {
              pdf.addPage();
              position = -pageHeight;
            }
          }

          pdf.save("source-report.pdf");

          // re-show icons
          setTimeout(() => {
            this.showIcons = true;
          }, 3000);
        });
      }, 500); // delay of 300ms
    },
  },
};
</script>
<style scoped>
.report-table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

.report-table td,
.report-table th {
  border: 1px solid #e5e9eb !important;
  text-align: left;
  padding: 5px;
}
.custom-td {
  /* padding: 14px !important; */
}
.rounded-card {
  border-radius: 12px;
  overflow: hidden;
}
</style>
