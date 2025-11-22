<template>
  <span>
    <style scoped>
      .report-table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
        text-align: center;
      }

      .report-table td,
      .report-table th {
        border: 1px solid #e5e9eb !important;
        text-align: left;
        padding: 5px;
      }
    </style>
    <div ref="reportArea" class="pa-15">
      <v-row>
        <v-col>
          <div class="d-flex" style="gap: 5px">
            <div>
              <v-autocomplete
                v-model="filters.product_id"
                :items="[
                  { id: null, description: `Select All` },
                  ...productDropDown,
                ]"
                item-text="description"
                item-value="id"
                label="Products"
                outlined
                dense
                hide-details
              ></v-autocomplete>
            </div>
            <div>
              <v-autocomplete
                v-model="filters.order_status"
                :items="[{ id: null, name: `Select All` }, ...statusList]"
                item-text="name"
                item-value="id"
                label="Products"
                outlined
                dense
                hide-details
              ></v-autocomplete>
            </div>
            <div>
              <FiltersDateRange
                @filter-attr="
                  ({ from, to }) => {
                    filters.from = from;
                    filters.to = to;
                  }
                "
              />
            </div>
            <v-btn color="primary" @click="getData" small>Submit</v-btn>
          </div>
        </v-col>
        <v-col class="text-right">
          <div>
            <v-icon color="black" v-if="showIcons" @click="exportToExcel">
              mdi-file-excel
            </v-icon>

            <v-icon color="black" v-if="showIcons" @click="downloadPDF">
              mdi-download
            </v-icon>
          </div>
        </v-col>
      </v-row>

      <!-- ONE BLOCK PER PRODUCT -->
      <div v-for="product in productList" :key="product" class="mt-6">
        <!-- Product title bar -->
        <div
          class="d-flex align-center px-3 py-1"
          style="background: #f3f4f6; border: 1px solid #e5e7eb"
        >
          <div class="font-weight-medium">
            {{ product }} –
            {{
              productDropDown.find((e) => e.item_number == product)
                ?.description || "No description"
            }}
          </div>
        </div>

        <table class="report-table" border="1" style="width: 100%">
          <thead>
            <tr>
              <th class="text-center" style="width: 150px">Date</th>
              <th class="text-center">Price</th>
              <th class="text-center">Qty</th>
              <!-- optional: per-day total -->
              <!-- <th class="text-center">Total (Price × Qty)</th> -->
            </tr>
          </thead>

          <tbody>
            <!-- loop dates for this product -->
            <template v-for="(products, date) in productsJson">
              <tr
                v-if="
                  products[product] &&
                  (products[product].price != 0 ||
                    products[product].quantity != 0)
                "
                :key="product + '-' + date"
              >
                <td class="text-center">{{ date }}</td>
                <td class="text-center">{{ products[product].price }}</td>
                <td class="text-center">{{ products[product].quantity }}</td>
                <!-- if you want daily total, uncomment:
            <td class="text-center">
              {{ (parseFloat(products[product].price || 0) *
                  parseFloat(products[product].quantity || 0)
                ).toFixed(2)
              }}
            </td>
            -->
              </tr>
            </template>
          </tbody>

          <tfoot>
            <tr>
              <td class="text-center font-weight-bold">Total</td>
              <td class="text-center font-weight-bold">
                {{ getTotalPrice(product) }}
              </td>
              <td class="text-center font-weight-bold">
                {{ getTotalQty(product) }}
              </td>
              <!-- if you add daily total column, you can also add grand total here -->
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </span>
</template>

<script>
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
export default {
  props: ["downloadExcel"],
  data() {
    return {
      filters: {
        product_id: null,
        from: null,
        to: null,
        order_status:null
      },
      loading: true,
      loading: false,
      productsJson: {}, // response from backend
      productList: [], // dynamic product names
      productDropDown: [], // dynamic product names
      statusList: [],
      showIcons: true,
    };
  },
  watch: {
    // Watch for changes in the filters prop
    filters: {
      deep: true, // watches nested changes in the object
      handler() {
        this.getData();
      },
    },
  },
  async created() {
    try {
      this.productDropDown = await this.$axios.$get("/product-list");
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }

    try {
      this.statusList = await this.$axios.$get("/status-list");
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }

    await this.getData();
    this.loading = false;
  },
  methods: {
    async getData() {
      this.loading = true;
      try {
        this.productsJson = await this.$axios.$get("/report-products", {
          params: this.filters,
        });

        // Build unique product list from all dates
        const productsSet = new Set();
        Object.values(this.productsJson).forEach((dayData) => {
          Object.values(dayData).forEach((item) => {
            productsSet.add(item.product.toUpperCase());
          });
        });
        this.productList = Array.from(productsSet);
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    getTotalPrice(productName) {
      let total = 0;
      Object.values(this.productsJson).forEach((productsObj) => {
        const item = Object.values(productsObj).find(
          (p) => p.product === productName
        );
        if (item) total += parseFloat(item.price);
      });
      return total.toFixed(2);
    },
    getTotalQty(productName) {
      let total = 0;
      Object.values(this.productsJson).forEach((productsObj) => {
        const item = Object.values(productsObj).find(
          (p) => p.product === productName
        );
        if (item) total += item.quantity;
      });
      return total;
    },
    getRowTotalPrice(productsObj) {
      let total = 0;
      Object.values(productsObj).forEach((p) => {
        total += parseFloat(p.price);
      });
      return total.toFixed(2);
    },
    getRowTotalQty(productsObj) {
      let total = 0;
      Object.values(productsObj).forEach((p) => {
        total += p.quantity;
      });
      return total;
    },

    exportToExcel() {
      const ws = XLSX.utils.aoa_to_sheet([]);

      // --- Header Rows ---
      const header1 = ["DATE"];
      this.productList.forEach((product) => {
        header1.push(product, "");
      });
      header1.push("Total QTY", "Total Price");
      XLSX.utils.sheet_add_aoa(ws, [header1], { origin: "A1" });

      const header2 = [""];
      this.productList.forEach(() => {
        header2.push("PRICE", "QTY");
      });
      header2.push("", "");
      XLSX.utils.sheet_add_aoa(ws, [header2], { origin: "A2" });

      // --- Merges ---
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // DATE rowspan
        {
          s: { r: 0, c: 1 + this.productList.length * 2 },
          e: { r: 1, c: 1 + this.productList.length * 2 },
        }, // Total QTY
        {
          s: { r: 0, c: 2 + this.productList.length * 2 },
          e: { r: 1, c: 2 + this.productList.length * 2 },
        }, // Total Price
        ...this.productList.map((_, i) => ({
          s: { r: 0, c: 1 + i * 2 },
          e: { r: 0, c: 2 + i * 2 },
        })),
      ];

      // --- Data Rows ---
      const dataRows = [];
      Object.entries(this.productsJson).forEach(([date, products]) => {
        const row = [date];
        this.productList.forEach((pName) => {
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
      this.productList.forEach((pName) => {
        totalRow.push(Number(this.getTotalPrice(pName)));
        totalRow.push(this.getTotalQty(pName));
      });

      const grandTotalQty = Object.values(this.productsJson).reduce(
        (acc, pObj) =>
          acc +
          Object.values(pObj).reduce((sum, p) => sum + Number(p.quantity), 0),
        0
      );
      const grandTotalPrice = Object.values(this.productsJson).reduce(
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
      for (let i = 1; i <= this.productList.length * 2 + 2; i++)
        ws["!cols"].push({ wpx: 80 });

      // --- Export ---
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, "product-report.xlsx");
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

          pdf.save("product-report.pdf");

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
