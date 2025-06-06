<template>
  <div class="text-center">
    <v-dialog persistent v-model="dialog" width="850">
      <AssetsIconClose left="840" @click="close" />

      <template v-slot:activator="{ on, attrs }">
        <v-btn
          small
          color="blue"
          class="white--text"
          dark
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="white" small> mdi-plus </v-icon> {{ model }}
        </v-btn>
      </template>

      <v-card>
        <v-alert flat class="grey lighten-3" dense>
          Create {{ model }} <v-spacer></v-spacer
        ></v-alert>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  outlined
                  dense
                  hide-details
                  v-model="payload.name"
                  label="Name"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-autocomplete
                  outlined
                  dense
                  hide-details
                  :items="templateTypes"
                  item-value="id"
                  item-text="name"
                  v-model="payload.action_id"
                  label="Action"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <ClientOnly style="border: 1px solid">
                  <tiptap-vuetify
                    v-model="payload.body"
                    :extensions="extensions"
                    :card-props="{ flat: true }"
                  />
                  <template #placeholder> Loading... </template>
                </ClientOnly>
              </v-col>
              <v-col cols="12" v-if="errorResponse">
                <span class="red--text">{{ errorResponse }}</span>
              </v-col>
              <v-col cols="12" class="text-right">
                <v-btn
                  small
                  color="grey"
                  class="white--text"
                  dark
                  @click="close"
                >
                  Close
                </v-btn>
                <v-btn
                  :loading="loading"
                  small
                  color="blue"
                  class="white--text"
                  dark
                  @click="submit"
                >
                  Submit
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import {
  TiptapVuetify,
  Image,
  Heading,
  Bold,
  Italic,
  Strike,
  Underline,
  Code,
  Paragraph,
  BulletList,
  OrderedList,
  ListItem,
  Link,
  Blockquote,
  HardBreak,
  HorizontalRule,
  History,
} from "tiptap-vuetify";

export default {
  props: ["endpoint", "model", "medium"],

  components: { TiptapVuetify },

  data() {
    return {
      extensions: [
        History,
        Blockquote,
        Link,
        Image,
        Underline,
        Strike,
        Italic,
        ListItem,
        BulletList,
        OrderedList,
        [
          Heading,
          {
            options: {
              levels: [1, 2, 3],
            },
          },
        ],
        Bold,
        Link,
        Code,
        HorizontalRule,
        Paragraph,
        HardBreak,
      ],
      payload: {
        name: "",
        salutation: "Hi",
        salutation_static: "{{UserName}},",
        body: ``,
        action_id: 0,
      },
      dialog: false,
      loading: false,
      successResponse: null,
      errorResponse: null,
      product_categories: [],
      templateTypes: [],
    };
  },
  async created() {
    try {
      let { data } = await this.$axios.get(`template-types`);
      this.templateTypes = data;
    } catch (error) {
      console.log(error);
    }
  },
  methods: {
    close() {
      this.dialog = false;
      this.loading = false;
      this.errorResponse = null;
    },

    async submit() {
      this.loading = true;
      try {
        this.payload.medium = this.medium;

        await this.$axios.post(this.endpoint, this.payload);
        this.close();
        this.$emit("response", "payload has been inserted");
      } catch (error) {
        this.errorResponse = error?.response?.data?.message || "Unknown error";
        this.loading = false;
      }
    },
  },
};
</script>
