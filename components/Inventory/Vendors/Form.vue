<template>
  <v-card flat class="vendor-form">
    <!-- Header bar -->
    <div class="d-flex align-center px-6 py-4" style="border-bottom: 1px solid #eef1f5">
      <v-icon left>mdi-account-tie-outline</v-icon>
      <span class="text-h6 font-weight-medium">{{ isEdit ? "Edit Vendor" : "New Vendor" }}</span>
      <v-spacer></v-spacer>
      <v-btn icon @click="goBack"><v-icon>mdi-close</v-icon></v-btn>
    </div>

    <v-card-text class="pa-0">
      <!-- Primary contact -->
      <div class="vf-section">
        <div class="vf-heading">Primary Contact</div>
        <v-row no-gutters class="vf-grid">
          <v-col cols="12" md="2"><div class="vf-label">Salutation</div>
            <v-autocomplete v-model="form.title" :items="titles" placeholder="Mr / Mrs" dense outlined hide-details clearable />
          </v-col>
          <v-col cols="12" md="5"><div class="vf-label">First Name</div>
            <v-text-field v-model="form.first_name" dense outlined hide-details placeholder="First Name" />
          </v-col>
          <v-col cols="12" md="5"><div class="vf-label">Last Name</div>
            <v-text-field v-model="form.last_name" dense outlined hide-details placeholder="Last Name" />
          </v-col>
        </v-row>
        <v-row no-gutters class="vf-grid">
          <v-col cols="12" md="7"><div class="vf-label">Company Name</div>
            <v-text-field v-model="form.company_name" dense outlined hide-details placeholder="Company Name" />
          </v-col>
          <v-col cols="12" md="5"><div class="vf-label">Tax Number (TRN)</div>
            <v-text-field v-model="form.tax_number" dense outlined hide-details placeholder="Tax Number" />
          </v-col>
        </v-row>
      </div>

      <!-- Contact details -->
      <div class="vf-section grey lighten-5">
        <div class="vf-heading">Contact Details</div>
        <v-row no-gutters class="vf-grid">
          <v-col cols="12" md="4"><div class="vf-label">Email</div>
            <v-text-field v-model="form.email" dense outlined hide-details placeholder="name@example.com" />
          </v-col>
          <v-col cols="12" md="4"><div class="vf-label">Work Phone</div>
            <v-text-field v-model="form.work_phone" dense outlined hide-details placeholder="Work Phone" />
          </v-col>
          <v-col cols="12" md="4"><div class="vf-label">Mobile</div>
            <v-text-field v-model="form.mobile" dense outlined hide-details placeholder="Mobile" />
          </v-col>
        </v-row>
      </div>

      <!-- Address -->
      <div class="vf-section">
        <div class="vf-heading">Address</div>
        <v-row no-gutters class="vf-grid">
          <v-col cols="12"><div class="vf-label">Street Address</div>
            <v-textarea v-model="form.address" rows="2" dense outlined hide-details placeholder="Street, building, area" />
          </v-col>
        </v-row>
        <v-row no-gutters class="vf-grid">
          <v-col cols="12" md="3"><div class="vf-label">City</div>
            <v-text-field v-model="form.city" dense outlined hide-details />
          </v-col>
          <v-col cols="12" md="3"><div class="vf-label">State</div>
            <v-text-field v-model="form.state" dense outlined hide-details />
          </v-col>
          <v-col cols="12" md="3"><div class="vf-label">Country</div>
            <v-text-field v-model="form.country" dense outlined hide-details />
          </v-col>
          <v-col cols="12" md="3"><div class="vf-label">Zip Code</div>
            <v-text-field v-model="form.zip_code" dense outlined hide-details />
          </v-col>
        </v-row>
      </div>

      <!-- Other -->
      <div class="vf-section grey lighten-5">
        <div class="vf-heading">Other Details</div>
        <v-row no-gutters class="vf-grid">
          <v-col cols="12" md="8"><div class="vf-label">Notes</div>
            <v-textarea v-model="form.notes" rows="2" dense outlined hide-details placeholder="Internal notes about this vendor" />
          </v-col>
          <v-col cols="12" md="4"><div class="vf-label">Status</div>
            <v-autocomplete v-model="form.status" :items="statuses" item-text="text" item-value="value" dense outlined hide-details />
          </v-col>
        </v-row>
      </div>

      <div v-if="error" class="red--text px-6 pb-2">{{ error }}</div>
    </v-card-text>

    <!-- Footer -->
    <div class="d-flex align-center px-6 py-3 vf-footer">
      <v-btn small depressed color="primary" :loading="saving" @click="submit">{{ isEdit ? "Update" : "Save" }}</v-btn>
      <v-btn small text class="ml-2" @click="goBack">Cancel</v-btn>
    </div>
  </v-card>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    saving: false,
    error: null,
    titles: ["Mr", "Mrs", "Ms", "Dr", "M/s"],
    statuses: [
      { text: "Active", value: "active" },
      { text: "Inactive", value: "inactive" },
    ],
    form: {
      title: null,
      first_name: null,
      last_name: null,
      company_name: null,
      tax_number: null,
      email: null,
      work_phone: null,
      mobile: null,
      address: null,
      city: null,
      state: null,
      country: null,
      zip_code: null,
      notes: null,
      status: "active",
    },
  }),

  computed: {
    isEdit() { return !!this.id; },
  },

  async created() {
    if (this.isEdit) {
      const { data } = await this.$axios.get(`vendors/${this.id}`);
      this.form = { ...this.form, ...data };
    }
  },

  methods: {
    goBack() { this.$router.push("/inventory/vendors"); },
    async submit() {
      this.error = null;
      if (!this.form.company_name && !this.form.first_name && !this.form.last_name) {
        this.error = "Provide a company name or a first/last name.";
        return;
      }
      this.saving = true;
      try {
        if (this.isEdit) await this.$axios.put(`vendors/${this.id}`, this.form);
        else await this.$axios.post("vendors", this.form);
        this.$swal && this.$swal.fire({ toast: true, position: "top-end", timer: 2000, showConfirmButton: false, icon: "success", title: this.isEdit ? "Vendor updated" : "Vendor created" });
        this.goBack();
      } catch (e) {
        this.error = e?.response?.data?.message || "Failed to save";
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.vendor-form { border-radius: 12px; max-width: 1100px; margin: 16px 0 24px 16px; background: #fff; }
.vf-section { padding: 18px 24px; border-bottom: 1px solid #eef1f5; }
.vf-heading { font-size: 13px; font-weight: 700; color: #2a2f37; letter-spacing: 0.3px; margin-bottom: 14px; }
.vf-grid > .col, .vf-grid > [class*="col-"] { padding: 0 8px 14px; }
.vf-label { font-size: 13px; color: #41464b; margin-bottom: 4px; font-weight: 500; }
.vf-footer { border-top: 1px solid #eef1f5; position: sticky; bottom: 0; background: #fff; z-index: 2; }
</style>
