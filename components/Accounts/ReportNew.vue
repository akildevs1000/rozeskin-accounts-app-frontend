<template>
  <v-container fluid>
    <div>
      <v-row>
        <!-- hwo to download from result below header  -->
        <v-col cols="12">
          <v-container fluid>
            <v-row>
              <v-col>
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
                  <v-btn color="primary" @click="applyFilters" small
                    >Submit</v-btn
                  >
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
      <v-container>
        <v-row>
          <v-col cols="12">
            <AccountsProduct :filters="filters" />
          </v-col>

          <v-col cols="6">
            <AccountsSource :filters="filters" />
          </v-col>

          <v-col cols="6">
            <AccountsPaymentMode :filters="filters" />
          </v-col>
        </v-row>
      </v-container>
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
