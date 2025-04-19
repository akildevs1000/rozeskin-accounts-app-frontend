<template>
  <div class="text-center">
   
    <client-only>
        <svg ref="barcode"></svg>
    </client-only>
  </div>
</template>

<script>
import JsBarcode from "jsbarcode";

export default {
  props: ["value"],
  mounted() {
    if (process.client) {
      this.$nextTick(() => {
        if (this.$refs.barcode) {
          JsBarcode(this.$refs.barcode, this.value, {
            format: "CODE128",
            lineColor: "#000",
            width: 2.5,
            height: 50,
            displayValue: true,
          });
        }
      });
    }
  },
};
</script>
