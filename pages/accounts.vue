<template>
  <v-container fluid>
    <v-card>
      <v-tabs class="pt-3" color="primary" right>
        <v-tab> Customer Report </v-tab>
        <v-tab> Product Report </v-tab>
        <v-tab> Source Report </v-tab>
        <v-tab> Repeated Report </v-tab>
        <v-tab> City Report </v-tab>

        <!-- <v-tab> Reports New </v-tab> -->
        <v-tab> Analytics </v-tab>
        <v-tab-item>
          <v-container fluid>
            <AccountsCustomerReport />
          </v-container>
        </v-tab-item>
        <v-tab-item>
          <v-container fluid>
            <AccountsProductReport />
          </v-container>
        </v-tab-item>
        <v-tab-item>
          <v-container fluid>
            <AccountsSourceReport />
          </v-container>
        </v-tab-item>
        <v-tab-item>
          <v-container fluid>
            <AccountsRepeatedCustomerReport />
          </v-container>
        </v-tab-item>
        <v-tab-item>
          <v-container fluid>
            <AccountsCityReport />
          </v-container>
        </v-tab-item>
        <!-- <v-tab-item>
          <v-container fluid>
            <AccountsReportNew />
          </v-container>
        </v-tab-item> -->
         <v-tab-item>
          <v-container fluid>
            <AccountsAnalytics />
          </v-container>
        </v-tab-item>
      </v-tabs>
    </v-card>
  </v-container>
</template>
