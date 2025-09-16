<template>
  <table class="report-table" border="1">
    <thead>
      <tr>
        <td class="text-center" rowspan="2">DATE</td>
        <td
          v-for="product in productList"
          :key="product"
          colspan="2"
          class="text-center"
        >
          <v-tooltip bottom color="primary">
            <template v-slot:activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on">
                {{ product }}
              </span>
            </template>
            <span>{{
              productDropDown.find((e) => e.item_number == product)?.description
            }}</span>
          </v-tooltip>
        </td>

        <td class="text-center" rowspan="2">Total QTY</td>
        <td class="text-center" rowspan="2">Total Price</td>
      </tr>
      <tr>
        <template v-for="product in productList">
          <td class="text-center">PRICE</td>
          <td class="text-center">QTY</td>
        </template>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(products, date) in productsJson" :key="date">
        <td class="text-center" style="width: 150px">{{ date }}</td>
        <template v-for="product in products">
          <td class="text-center">{{ product.price }}</td>
          <td class="text-center">{{ product.quantity }}</td>
        </template>

        <td class="text-center" style="font-weight: bold">
          {{ getRowTotalQty(products) }}
        </td>
        <td class="text-center" style="font-weight: bold">
          {{ getRowTotalPrice(products) }}
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td class="text-center" rowspan="2" style="font-weight: bold">Total</td>
        <template v-for="product in productList">
          <td class="text-center" style="font-weight: bold">
            {{ getTotalPrice(product) }}
          </td>
          <td class="text-center" style="font-weight: bold">
            {{ getTotalQty(product) }}
          </td>
        </template>

        <td class="text-center" style="font-weight: bold">
          {{
            Object.values(productsJson).reduce(
              (acc, pObj) =>
                acc +
                Object.values(pObj).reduce((sum, p) => sum + p.quantity, 0),
              0
            )
          }}
        </td>
        <td class="text-center" style="font-weight: bold">
          {{
            Object.values(productsJson)
              .reduce(
                (acc, pObj) =>
                  acc +
                  Object.values(pObj).reduce(
                    (sum, p) => sum + parseFloat(p.price),
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
</template>

<script>
import * as XLSX from "xlsx";
export default {
  props: ["filters", "downloadExcel"],
  data() {
    return {
      loading: true,
      loading: false,
      productsJson: {}, // response from backend
      productList: [], // dynamic product names
      productDropDown: [], // dynamic product names
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
      XLSX.writeFile(wb, "report.xlsx");
    },
  },
};
</script>
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
