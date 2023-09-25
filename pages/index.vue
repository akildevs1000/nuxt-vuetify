<template>
  <div class="text-center mt-5">
    <v-container>
      <v-avatar size="150">
        <img :src="profile_pictrue" alt="Avatar" />
      </v-avatar>
      <v-card-text>
        <div>EID: {{ UserID }}</div>
        <!-- <div>Device Id: {{ uniqueDeviceId }}</div> -->
        <v-btn small class="indigo" dark @click="generateLog(`In`)">
          Check In
        </v-btn>
        &nbsp;
        <v-btn small class="grey" dark @click="generateLog(`Out`)">
          Check Out
        </v-btn>
      </v-card-text>
    </v-container>
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
    device_id: "",
    attendanceLogs: [],
    profile_pictrue: "",
    uniqueDeviceId: null,
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

  created() {
    Fingerprint2.get({}, (components) => {
      const values = components.map(({ value }) => value);
      this.uniqueDeviceId = Fingerprint2.x64hash128(values.join(""), 31);
    });

    this.UserID = this.$auth.user.employee.system_user_id;
    this.profile_pictrue = this.$auth.user.employee.profile_picture;
  },
  methods: {
    generateLog(type) {
      this.ifExist();
      // return;
      // Get the current date and time
      const now = new Date();

      // Format the date and time as "YYYY-MM-DD HH:mm"
      this.formattedDateTime = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      let payload = {
        UserID: this.UserID,
        LogTime: this.formattedDateTime,
        DeviceID: "Mobile",
        company_id: this.$auth.user.company_id,
      };

      //   return;

      this.$axios
        .post(`/generate_log`, payload)
        .then(({ data }) => {
          if (!data.status) {
            return;
          } else {
            this.attendanceLogs.push(payload);
            console.log(this.attendanceLogs);
          }
        })
        .catch(({ message }) => {
          console.log(message);
        });
    },
    registerDevice() {
      let payload = {
        device_id: `Mobile`,
        name: `Mobile`,
        short_name: `Mobile`,
        model_number: `Mobile`,
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
    ifExist() {
      this.$axios
        .get(`/device-by-user/Mobile`)
        .then(({ data }) => {
          if (!data) {
            this.registerDevice();
          } else {
            console.log(`This device id already exist`);
          }
        })
        .catch(({ message }) => console.log(message));
    },
  },
};
</script>

<style scoped>
@media only screen and (max-width: 600px) {
  .v-data-table-header.v-data-table-header-mobile {
    display: none;
  }
}
</style>
