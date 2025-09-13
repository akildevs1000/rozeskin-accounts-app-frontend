<template>
  <table
    class="report-table"
    border="1"
  >
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
        <td class="text-center" style="width:150px;">{{ date }}</td>
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
          <td class="text-center" style="font-weight: bold">{{ getTotalPrice(product) }}</td>
          <td class="text-center" style="font-weight: bold">{{ getTotalQty(product) }}</td>
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
export default {
  props: ["filters"],
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
