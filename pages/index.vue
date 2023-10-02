<template>
  <div class="text-center mt-5">
    <v-container>
      <v-avatar size="150">
        <img :src="profile_pictrue" alt="Avatar" />
      </v-avatar>
      <v-card-text>
        <div>EID: {{ UserID }}</div>
        <!-- <div>Device Id: {{ uniqueDeviceId }}</div> -->
        <v-btn
          :disabled="isButtonDisabled"
          small
          class="indigo"
          dark
          outlined
          @click="generateLog(`in`)"
        >
          Check In
        </v-btn>
        &nbsp;
        <v-btn
          :disabled="isButtonDisabled"
          small
          class="grey"
          outlined
          dark
          @click="generateLog(`out`)"
        >
          Check Out
        </v-btn>
      </v-card-text>
    </v-container>
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent>
        <v-card style="background-color: #6946dd" dark>
          <v-card-actions>
            {{ message }}
            <v-spacer></v-spacer>
            <v-icon @click="dialog = false"> mdi-close-circle-outline </v-icon>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import Fingerprint2 from "fingerprintjs2";

export default {
  data: () => ({
    headers: [
      { text: "LogTime", value: "LogTime" },
      { text: "Device", value: "DeviceID" },
      // { text: "location", value: "location" },
    ],
    formattedDateTime: null,
    UserID: null,
    attendanceLogs: [],
    profile_pictrue: "no-profile-image.jpg",
    uniqueDeviceId: null,
    device_id: null,
    isButtonDisabled: false,
    dialog: false,
    message: "",
    response: "",
  }),
  computed: {
    locationData() {
      return this.$store.state.locationData;
    },

    navigator() {
      return this.$store.state.navigator;
    },
    brands() {
      let navigator = this.$store.state.navigator;
      return navigator.userAgentData && navigator.userAgentData.brands;
    },
  },
  mounted() {},
  async created() {
  
    this.UserID = this.$auth.user.employee.system_user_id;
    this.profile_pictrue = this.$auth.user.employee.profile_picture;

    try {
        await this.$axios.head(this.$auth.user.employee.profile_picture);
      } catch (error) {
        this.profile_pictrue = "no-profile-image.jpg";
      }

    this.device_id = `Mobile-${this.UserID}`;
  },
  methods: {
    generateLog(type) {
      this.lockLogButtons();

      let payload = {
        UserID: this.UserID,
        LogTime: this.getFormattedDateTime(),
        log_type: type,
        DeviceID: this.device_id,
        company_id: this.$auth.user.company_id,
        gps_location: this.locationData.name,
      };

      //   return;

      this.$axios
        .post(`/generate_log`, payload)
        .then(({ data }) => {
          this.dialog = true;

          if (!data.status) {
            this.message = data.message;
          }

          this.message = "Your attendance has been marked.";

          this.ifExist();
        })
        .catch(({ message }) => message);
    },
    ifExist() {
      this.$axios
        .get(`/device-by-user/${this.device_id}`)
        .then(({ data }) => {
          if (!data) {
            this.registerDevice();
          } else {
            console.log(`This device id already exist`);
          }
        })
        .catch(({ message }) => console.log(message));
    },
    registerDevice() {
      let payload = {
        device_id: this.device_id,
        name: "Mobile",
        short_name: "Mobile",
        model_number: this.device_id,
        location: this.locationData.name ?? "---",
        company_id: this.$auth.user.company_id,
        status_id: 1,
        device_type: "auto",
        ip: "0.0.0.0",
        port: "0000",
      };

      this.$axios
        .post(`/device`, payload)
        .then(({ data }) => console.log(`This device registered successfully`))
        .catch(({ message }) => console.log(message));
    },
    lockLogButtons() {
      this.isButtonDisabled = true;
      setTimeout(() => {
        this.isButtonDisabled = false;
      }, 60000);
    },
    getFormattedDateTime() {
      const now = new Date();
      // Format the date and time as "YYYY-MM-DD HH:mm"
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(now.getDate()).padStart(2, "0")} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    },
  },
};
</script>
