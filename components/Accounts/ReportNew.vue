<template>
  <v-container fluid>
    <div class="d-flex justify-end" style="gap: 10px; width: 100%">
      <div>
        <FiltersDateRange
          @filter-attr="
            ({ from, to }) => {
              tempFilters.from = from;
              tempFilters.to = to;
            }
          "
        />
      </div>
      <v-btn color="primary" @click="applyFilters" small>Submit</v-btn>
    </div>
    <div>
      <v-tabs color="primary" centered>
        <v-tab>Product</v-tab>
        <v-tab>Source</v-tab>
        <v-tab>Payment Mode</v-tab>
        <v-tab-item>
          <v-container fluid>
            <AccountsProduct :filters="filters" />
          </v-container>
        </v-tab-item>
        <v-tab-item>
          <v-container fluid>
            <AccountsSource :filters="filters" />
          </v-container>
        </v-tab-item>
        <v-tab-item>
          <v-container fluid>
            <AccountsPaymentMode :filters="filters" />
          </v-container>
        </v-tab-item>
      </v-tabs>
    </div>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      filters: {
        from: null,
        to: null,
      },
      tempFilters: {
        from: null,
        to: null,
      },
    };
  },
  methods: {
    applyFilters() {
      this.filters = { ...this.tempFilters };
    },
  },
};
</script>
