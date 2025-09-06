<template>
  <v-tabs class="pt-3" color="primary" right>
    <v-tab> Report </v-tab>
    <v-tab> Analytics </v-tab>
    <v-tab-item>
      <AccountsReport />
    </v-tab-item>
    <v-tab-item>
      <AccountsAnalytics />
    </v-tab-item>
  </v-tabs>
</template>
