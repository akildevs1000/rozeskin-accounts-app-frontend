<template>
  <v-container fluid>
    <!-- ── PIN gate ──────────────────────────────────────────────────
         Keeps the reports off the screen when the laptop is left open or
         handed to someone. See the note in the script block: this hides the
         page, it does not protect the data. -->
    <v-row v-if="locked" justify="center" class="mt-8">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-6 text-center" outlined>
          <v-icon size="52" color="primary">mdi-lock-outline</v-icon>

          <div class="text-h6 mt-3">Accounts is locked</div>
          <div class="text--secondary mb-5" style="font-size: 13px">
            Enter the PIN to view the reports.
          </div>

          <v-text-field
            ref="pinField"
            v-model="pin"
            label="PIN"
            type="password"
            inputmode="numeric"
            maxlength="4"
            outlined
            autofocus
            :error-messages="error"
            @keyup.enter="unlock"
            @input="error = ''"
          />

          <v-btn block color="primary" :disabled="!pin" @click="unlock">
            Unlock
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── the reports ─────────────────────────────────────────────── -->
    <v-card v-else>
      <v-toolbar flat dense>
        <v-spacer />
        <v-btn small text color="grey darken-1" @click="lock">
          <v-icon left small>mdi-lock</v-icon>
          Lock
        </v-btn>
      </v-toolbar>

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

<script>
/**
 * PIN lock for the Accounts reports.
 *
 * Worth being clear about what this is: the check runs in the browser, so the
 * PIN ships inside the JavaScript bundle and the report components still call
 * the same API endpoints as before. Anyone who opens devtools, or calls the API
 * directly with a valid login, can still reach the figures. It stops the page
 * being read over someone's shoulder or by whoever picks up an unlocked laptop;
 * it is not an access control.
 *
 * To make it a real restriction the reports need gating on the server — a
 * permission on the endpoints, checked with $can() in the UI the way the rest of
 * the app does it. Happy to do that instead, or as well.
 *
 * The unlock lasts for the browser tab (sessionStorage), so moving between
 * reports does not ask again, but closing the tab re-locks it.
 */
const ACCOUNTS_PIN = "7777";
const UNLOCK_KEY = "roze_accounts_unlocked";

export default {
  data() {
    return {
      locked: true,
      pin: "",
      error: "",
    };
  },

  mounted() {
    // sessionStorage is not available during SSR, hence the guard.
    if (
      typeof window !== "undefined" &&
      window.sessionStorage &&
      window.sessionStorage.getItem(UNLOCK_KEY) === "1"
    ) {
      this.locked = false;
    }
  },

  methods: {
    unlock() {
      if (this.pin !== ACCOUNTS_PIN) {
        this.error = "Incorrect PIN";
        this.pin = "";
        return;
      }

      this.error = "";
      this.pin = "";
      this.locked = false;

      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.setItem(UNLOCK_KEY, "1");
      }
    },

    lock() {
      this.locked = true;
      this.pin = "";
      this.error = "";

      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem(UNLOCK_KEY);
      }
    },
  },
};
</script>
