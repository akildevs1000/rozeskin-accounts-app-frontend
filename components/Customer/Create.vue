<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="700">
      <AssetsIconClose left="690" @click="close" />
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          small
          color="primary"
          class="white--text"
          dark
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="white" small> mdi-plus </v-icon> New
        </v-btn>
      </template>

      <v-card>
        <v-alert flat class="grey lighten-3" dense>
          <span>Create {{ model }}</span>
        </v-alert>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-card outlined>
                <v-container>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.customer.first_name"
                        label="First Name"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.customer.last_name"
                        label="Last Name"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.customer.email"
                        label="Email"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-menu
                        ref="menu"
                        v-model="menu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="payload.customer.dob"
                            label="Date of Birth"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            outlined
                            dense
                            hide-details
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="payload.customer.dob"
                          @input="menu = false"
                          :show-current="false"
                          no-title
                        ></v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        type="tel"
                        outlined
                        dense
                        hide-details
                        v-model="payload.customer.phone"
                        label="Phone"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        type="tel"
                        outlined
                        dense
                        hide-details
                        v-model="payload.customer.whatsapp"
                        label="Whatsapp"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>

            <v-col cols="6">
              <v-card outlined>
                <v-container>
                  <v-row>
                    <v-col cols="6">Shipping Address</v-col>
                    <v-col cols="6" class="pa-0">
                      <v-checkbox
                        dense
                        hide-details
                        v-model="useAsBillingAddress"
                      >
                        <template v-slot:label>
                          <span style="font-size: 11px !important"
                            >Use as Billing Address</span
                          >
                        </template>
                      </v-checkbox></v-col
                    >
                    <v-col cols="12">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.shipping_address.address_1"
                        label="Address 1"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.shipping_address.address_2"
                        label="Address 2"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.shipping_address.city"
                        label="City"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.shipping_address.state"
                        label="State"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.shipping_address.postcode"
                        label="Post Code"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.shipping_address.country"
                        label="Country"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>

            <v-col cols="6">
              <v-card outlined>
                <v-container>
                  <v-row>
                    <v-col cols="12">Billing Address</v-col>
                    <v-col cols="12">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.billing_address.address_1"
                        label="Address 1"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.billing_address.address_2"
                        label="Address 2"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.billing_address.city"
                        label="City"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.billing_address.state"
                        label="State"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.billing_address.postcode"
                        label="Post Code"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        outlined
                        dense
                        hide-details
                        v-model="payload.billing_address.country"
                        label="Country"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>

            <v-col cols="12" v-if="errorResponse">
              <span class="red--text">{{ errorResponse }}</span>
            </v-col>
            <v-col cols="12" class="text-right">
              <AssetsButton
                :options="{
                  label: `Cancel`,
                  color: `red`,
                }"
                @click="close"
              />
              &nbsp;
              <AssetsButton
                :options="{
                  label: `Submit`,
                  color: `green`,
                }"
                @click="submit"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  props: ["endpoint", "model"],

  data() {
    return {
      menu: false,
      payload: {
        customer: {
          first_name: null,
          last_name: null,
          email: null,
          dob: null,
          phone: null,
          whatsapp: null,
        },
        shipping_address: {
          address_1: null,
          address_2: null,
          city: null,
          state: null,
          postcode: null,
          country: null,
        },

        billing_address: {
          address_1: null,
          address_2: null,
          city: null,
          state: null,
          postcode: null,
          country: null,
        },
      },
      dialog: false,
      loading: false,
      successResponse: null,
      errorResponse: null,
      useAsBillingAddress: false,

      default_address: {
        address_1: null,
        address_2: null,
        city: null,
        state: null,
        postcode: null,
        country: null,
      },
    };
  },
  watch: {
    useAsBillingAddress(val) {
      this.payload.billing_address =
        val == true
          ? { ...this.payload.shipping_address }
          : { ...this.default_address };
    },

    "payload.customer.phone"(newVal) {
      this.payload.customer.whatsapp = newVal;
    },
  },
  created() {},
  methods: {
    close() {
      this.dialog = false;
      this.loading = false;
      this.errorResponse = null;

      this.payload = {
        customer: {
          first_name: null,
          last_name: null,
          email: null,
          phone: null,
          whatsapp: null,
        },
        shipping_address: {
          address_1: null,
          address_2: null,
          city: null,
          state: null,
          postcode: null,
          country: null,
        },
        billing_address: {
          address_1: null,
          address_2: null,
          city: null,
          state: null,
          postcode: null,
          country: null,
        },
      };
    },
    async submit() {
      this.loading = true;
      try {
        await this.$axios.post(this.endpoint, this.payload);
        this.$emit("response", "Record has been inserted");

        this.close();
      } catch (error) {
        this.errorResponse = error?.response?.data?.message || "Unknown error";
        this.loading = false;
      }
    },
  },
};
</script>
