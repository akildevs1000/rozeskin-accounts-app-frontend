<template>
  <div class="d-flex align-center" style="gap: 8px">
    <v-text-field
      v-model="from"
      type="date"
      label="From"
      dense
      outlined
      hide-details
      @change="emit"
    ></v-text-field>
    <v-text-field
      v-model="to"
      type="date"
      label="To"
      dense
      outlined
      hide-details
      @change="emit"
    ></v-text-field>
  </div>
</template>

<script>
export default {
  data: () => ({ from: null, to: null }),
  methods: {
    emit() {
      this.$emit("range", { from: this.from, to: this.to });
    },
  },
};
</script>
