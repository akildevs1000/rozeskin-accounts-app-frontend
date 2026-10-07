<template>
  <div>
    <!-- controls -->
    <v-row class="align-center" dense>
      <v-col cols="6" sm="3">
        <v-menu
          v-model="fromMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              :value="from"
              label="From"
              prepend-inner-icon="mdi-calendar-start"
              readonly
              outlined
              dense
              hide-details
              v-bind="attrs"
              v-on="on"
            />
          </template>
          <v-date-picker v-model="from" no-title @input="pickFrom" />
        </v-menu>
      </v-col>

      <v-col cols="6" sm="3">
        <v-menu
          v-model="toMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              :value="to"
              label="To"
              prepend-inner-icon="mdi-calendar-end"
              readonly
              outlined
              dense
              hide-details
              v-bind="attrs"
              v-on="on"
            />
          </template>
          <v-date-picker v-model="to" :min="from" no-title @input="pickTo" />
        </v-menu>
      </v-col>

      <v-col cols="12" sm="6" class="text-right">
        <v-btn small color="primary" class="mr-2" :loading="loading" @click="load">
          <v-icon left small>mdi-refresh</v-icon> Check again
        </v-btn>
        <v-btn
          small
          color="green darken-1"
          dark
          :disabled="!data.missing.length"
          @click="exportCsv"
        >
          <v-icon left small>mdi-download</v-icon> CSV
        </v-btn>
      </v-col>
    </v-row>

    <div class="caption grey--text mt-1 mb-3">
      Compares every order on the website against this app, for the dates above.
      Unpaid and cancelled orders are never sent by the website, so they are
      listed separately rather than counted as missing.
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />

    <v-alert v-if="error" type="error" dense text class="mb-4">
      {{ error }}
    </v-alert>

    <template v-else>
      <!-- counts -->
      <v-row dense class="mb-2">
        <v-col v-for="c in cards" :key="c.label" cols="6" md="3">
          <v-card outlined class="pa-3 text-center">
            <div class="text-h6" :class="c.color">{{ c.value }}</div>
            <div class="caption grey--text">{{ c.label }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- the answer, stated plainly: a table of nothing reads as a failure -->
      <v-alert
        v-if="!loading && !data.missing.length"
        type="success"
        dense
        text
        class="mt-4"
      >
        Every website order in this period reached the app
        ({{ data.summary.received }} of {{ data.summary.sent_by_store }}).
      </v-alert>

      <div v-else-if="data.missing.length">
        <div class="text-subtitle-1 font-weight-bold mt-5 mb-2 red--text">
          Not received ({{ data.missing.length }})
        </div>

        <div class="rep-scroll">
          <table class="rep-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th class="text-right">Total</th>
                <th>Customer</th>
                <th>Phone</th>
                <th class="text-right">Items</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in data.missing" :key="o.order_id">
                <td class="font-weight-bold">
                  <a :href="wpLink(o.order_id)" target="_blank" rel="noopener">
                    {{ o.order_id }}
                  </a>
                </td>
                <td>{{ pretty(o.date) }}</td>
                <td>{{ o.status }}</td>
                <td>{{ o.payment || "&mdash;" }}</td>
                <td class="text-right">{{ money(o.total) }}</td>
                <td>
                  {{ o.customer || "—" }}
                  <v-chip v-if="o.is_empty" x-small class="ml-1" color="grey lighten-2">
                    empty / test
                  </v-chip>
                </td>
                <td>{{ o.phone || "—" }}</td>
                <td class="text-right">{{ o.items }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="caption grey--text mt-2">
          An order marked <strong>empty / test</strong> has no products and no
          value, so the app refused it on purpose &mdash; it is not a lost sale.
        </div>
      </div>

      <!-- never sent, shown so the absence is explained rather than noticed -->
      <div v-if="data.not_sent.length" class="mt-6">
        <v-btn small text color="grey darken-1" @click="showNotSent = !showNotSent">
          <v-icon left small>
            {{ showNotSent ? "mdi-chevron-up" : "mdi-chevron-down" }}
          </v-icon>
          Unpaid &amp; cancelled, never sent ({{ data.not_sent.length }})
        </v-btn>

        <div v-if="showNotSent" class="rep-scroll mt-2">
          <table class="rep-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Status</th>
                <th class="text-right">Total</th>
                <th>Customer</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in data.not_sent" :key="o.order_id">
                <td class="font-weight-bold">
                  <a :href="wpLink(o.order_id)" target="_blank" rel="noopener">
                    {{ o.order_id }}
                  </a>
                </td>
                <td>{{ pretty(o.date) }}</td>
                <td>{{ o.status }}</td>
                <td class="text-right">{{ money(o.total) }}</td>
                <td>{{ o.customer || "—" }}</td>
                <td>{{ o.phone || "—" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <v-snackbar v-model="snackbar" :color="snackColor" timeout="5000" top>
      {{ snackText }}
    </v-snackbar>
  </div>
</template>

<script>
const WP_ADMIN_ORDER =
  "https://rozeskin.com/wp-admin/admin.php?page=wc-orders&action=edit&id=";

export default {
  data() {
    const now = new Date();
    const iso = (d) =>
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0");

    const thirtyAgo = new Date(now);
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);

    return {
      from: iso(thirtyAgo),
      to: iso(now),
      fromMenu: false,
      toMenu: false,
      loading: false,
      error: "",
      showNotSent: false,
      snackbar: false,
      snackText: "",
      snackColor: "success",
      data: {
        summary: {
          website_orders: 0,
          sent_by_store: 0,
          received: 0,
          missing: 0,
          not_sent: 0,
        },
        missing: [],
        not_sent: [],
      },
    };
  },
  computed: {
    cards() {
      const s = this.data.summary;
      return [
        { label: "Website orders", value: s.website_orders, color: "" },
        { label: "Received here", value: s.received, color: "green--text" },
        {
          label: "Not received",
          value: s.missing,
          color: s.missing ? "red--text" : "grey--text",
        },
        { label: "Unpaid / cancelled", value: s.not_sent, color: "grey--text" },
      ];
    },
  },
  created() {
    this.load();
  },
  methods: {
    money(n) {
      return Number(n || 0).toLocaleString("en-AE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    /** The website stores times in UTC; the shop reads them in Dubai time. */
    pretty(gmt) {
      if (!gmt) return "";
      const d = new Date(String(gmt).replace(" ", "T") + "Z");
      if (isNaN(d)) return gmt;
      return d.toLocaleString("en-GB", {
        timeZone: "Asia/Dubai",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    wpLink(id) {
      return WP_ADMIN_ORDER + id;
    },
    notify(text, color) {
      this.snackText = text;
      this.snackColor = color || "success";
      this.snackbar = true;
    },
    pickFrom(value) {
      this.fromMenu = false;
      if (this.to < value) this.to = value;
      this.load();
    },
    pickTo() {
      this.toMenu = false;
      this.load();
    },
    async load() {
      this.loading = true;
      this.error = "";
      try {
        const { data } = await this.$axios.get("website-order-audit", {
          params: { from: this.from, to: this.to },
        });
        this.data = data;
      } catch (e) {
        const body = e?.response?.data;
        this.error =
          body?.error ||
          body?.message ||
          "Could not run the check. Try again in a moment.";
        this.data = {
          summary: {
            website_orders: 0,
            sent_by_store: 0,
            received: 0,
            missing: 0,
            not_sent: 0,
          },
          missing: [],
          not_sent: [],
        };
      } finally {
        this.loading = false;
      }
    },
    exportCsv() {
      const head = [
        "Order",
        "Date (Dubai)",
        "Status",
        "Payment",
        "Total",
        "Customer",
        "Phone",
        "Email",
        "Items",
      ];

      // Quote everything: a customer name with a comma would otherwise split
      // into two columns and silently shift the rest of the row.
      const cell = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;

      const lines = [head.map(cell).join(",")];

      this.data.missing.forEach((o) => {
        lines.push(
          [
            o.order_id,
            this.pretty(o.date),
            o.status,
            o.payment,
            o.total,
            o.customer,
            o.phone,
            o.email,
            o.items,
          ]
            .map(cell)
            .join(",")
        );
      });

      const blob = new Blob(["﻿" + lines.join("\r\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `orders-not-received-${this.from}_to_${this.to}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);

      this.notify("CSV downloaded.");
    },
  },
};
</script>

<style scoped>
.rep-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.rep-table th,
.rep-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 10px;
}
.rep-table thead th {
  background: #fafafa;
  font-weight: 600;
  white-space: nowrap;
}
.rep-scroll {
  overflow-x: auto;
}
.rep-table a {
  text-decoration: none;
}
</style>
