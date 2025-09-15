<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-container fluid>
          <v-row>
            <v-col>
              <div>Orders</div>
            </v-col>
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
                <v-btn color="primary" @click="applyFilters" small>Submit</v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col cols="12">
        <v-card flat class="rounded-card">
          <div>
            <div
              class="text-center px-3 py-1 white--text"
              style="background: #1f2937"
            >
              Products
            </div>
            <AccountsProduct :filters="filters" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card flat class="rounded-card">
          <div>
            <div class="text-center px-3 py-1" style="background: #a7f3d0">
              Source
            </div>
            <AccountsSource :filters="filters" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card flat class="rounded-card">
          <div>
            <div class="text-center px-3 py-1" style="background: #e9d5ff">
              Payment Mode
            </div>
            <AccountsPaymentMode :filters="filters" />
          </div>
        </v-card>
      </v-col>
    </v-row>
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
