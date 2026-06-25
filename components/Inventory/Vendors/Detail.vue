<template>
  <v-card flat class="vendor-detail" :loading="loading">
    <!-- Toolbar -->
    <v-alert class="primary vd-toolbar mb-0" flat tile dense dark>
      <div class="d-flex align-center">
        <v-icon dark class="mr-2" style="cursor: pointer" @click="$router.push('/inventory/vendors')">mdi-chevron-left</v-icon>
        <span class="font-weight-medium">{{ vendor.display_name || vendor.company_name || "Vendor" }}</span>
        <v-spacer></v-spacer>
        <span class="vd-act" @click="$router.push(`/inventory/vendors/${id}/edit`)">Edit <v-icon small>mdi-pencil</v-icon></span>
        <span class="vd-act ml-5" @click="remove">Delete <v-icon small>mdi-delete</v-icon></span>
      </div>
    </v-alert>

    <v-card-text v-if="vendor.id" class="pa-0">
      <div class="vd-doc px-8 py-8">
        <!-- Header -->
        <div class="d-flex align-center mb-6">
          <v-avatar color="primary" size="56" class="mr-4">
            <span class="white--text text-h5">{{ initials }}</span>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-medium">{{ vendor.display_name || "—" }}</div>
            <div v-if="vendor.full_name && vendor.full_name !== vendor.display_name" class="text-caption grey--text">{{ vendor.full_name }}</div>
            <v-chip x-small dark :color="vendor.status === 'inactive' ? 'red' : 'green'" class="mt-1">{{ labelize(vendor.status) }}</v-chip>
          </div>
        </div>

        <div class="vd-grid">
          <!-- Contact -->
          <div>
            <div class="vd-h">CONTACT</div>
            <div class="vd-row"><span class="vd-k">Salutation</span><span>{{ vendor.title || "—" }}</span></div>
            <div class="vd-row"><span class="vd-k">First Name</span><span>{{ vendor.first_name || "—" }}</span></div>
            <div class="vd-row"><span class="vd-k">Last Name</span><span>{{ vendor.last_name || "—" }}</span></div>
            <div class="vd-row"><span class="vd-k">Email</span><span>{{ vendor.email || "—" }}</span></div>
            <div class="vd-row"><span class="vd-k">Work Phone</span><span>{{ vendor.work_phone || "—" }}</span></div>
            <div class="vd-row"><span class="vd-k">Mobile</span><span>{{ vendor.mobile || "—" }}</span></div>
          </div>

          <!-- Company / Address -->
          <div>
            <div class="vd-h">COMPANY</div>
            <div class="vd-row"><span class="vd-k">Company</span><span>{{ vendor.company_name || "—" }}</span></div>
            <div class="vd-row"><span class="vd-k">Tax Number</span><span>{{ vendor.tax_number || "—" }}</span></div>

            <div class="vd-h mt-5">ADDRESS</div>
            <div v-if="addressLines.length">
              <div v-for="(l, i) in addressLines" :key="i" class="text-body-2">{{ l }}</div>
            </div>
            <div v-else class="grey--text">—</div>
          </div>
        </div>

        <div v-if="vendor.notes" class="mt-6">
          <div class="vd-h">NOTES</div>
          <div class="text-body-2">{{ vendor.notes }}</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    loading: false,
    vendor: {},
  }),

  computed: {
    initials() {
      const s = this.vendor.display_name || this.vendor.company_name || this.vendor.first_name || "?";
      return s.trim().slice(0, 2).toUpperCase();
    },
    addressLines() {
      const v = this.vendor;
      return [
        v.address,
        [v.city, v.state].filter(Boolean).join(", "),
        v.country,
        v.zip_code,
      ].filter(Boolean);
    },
  },

  created() { this.load(); },

  watch: { id() { this.load(); } },

  methods: {
    labelize(s) { return (s || "active").replace(/\b\w/g, (c) => c.toUpperCase()); },
    async load() {
      this.loading = true;
      try {
        const { data } = await this.$axios.get(`vendors/${this.id}`);
        this.vendor = data;
      } finally { this.loading = false; }
    },
    async remove() {
      const r = await (this.$swal ? this.$swal.fire({ icon: "warning", title: `Delete ${this.vendor.display_name || this.vendor.company_name}?`, showCancelButton: true, confirmButtonText: "Yes, delete" }) : { isConfirmed: confirm("Delete?") });
      if (!r.isConfirmed) return;
      await this.$axios.delete(`vendors/${this.id}`);
      this.$router.push("/inventory/vendors");
    },
  },
};
</script>

<style scoped>
.vendor-detail { border-radius: 12px; }
.vd-toolbar { border-radius: 0; }
.vd-act { cursor: pointer; font-size: 13px; }
.vd-act:hover { text-decoration: underline; }
.vd-doc { max-width: 860px; }
.vd-h { font-size: 11px; color: #8a96a6; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 700; }
.vd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.vd-row { display: flex; padding: 4px 0; font-size: 14px; }
.vd-k { width: 120px; flex: 0 0 120px; color: #5b6776; }
@media (max-width: 760px) { .vd-grid { grid-template-columns: 1fr; } }
</style>
