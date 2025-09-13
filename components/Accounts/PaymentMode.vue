<template>
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
        <td class="text-center" rowspan="2" style="font-weight: bold">TOTAL</td>
        <template v-for="method in paymentMethods">
          <td class="text-center" style="font-weight: bold">{{ getTotalPrice(method) }}</td>
          <td class="text-center" style="font-weight: bold">{{ getTotalQty(method) }}</td>
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
</template>

<script>
export default {
  props: ["filters"],
  data() {
    return {
      loading: false,
      tableData: {}, // response from report-payment-modes
      paymentMethods: [], // dynamic payment method names
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
        const data = await this.$axios.$get("/report-payment-modes", {
          params: this.filters,
        });
        this.tableData = data;

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