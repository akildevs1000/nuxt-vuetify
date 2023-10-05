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
          :disabled="disableCheckInButton"
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
          :disabled="disableCheckOutButton"
          small
          class="grey"
          outlined
          dark
          @click="generateLog(`out`)"
        >
          Check Out
        </v-btn>
      </v-card-text>

      <!-- <v-card-text>
        <v-btn small class="indigo" dark outlined @click="generateLog(`auto`)">
          Auto (Testing Only)
        </v-btn>
      </v-card-text> -->
    </v-container>
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent>
        <v-card>
          <v-card-title>
            {{ message }}
            <v-spacer></v-spacer>
            <v-icon @click="dialog = false" color="black">
              mdi-close-circle-outline
            </v-icon>
          </v-card-title>
          <v-card-text
            >{{ (locationData && locationData.name) || "Getting location..." }}
          </v-card-text>
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
    shift_type_id: "",
    logsCount: null,

    disableCheckInButton: false,
    disableCheckOutButton: true,
    // : true,
    // : false,
  }),
  computed: {
    locationData() {
      return this.$store.state.locationData;
    },

    brands() {
      let navigator = this.$store.state.navigator;
      return navigator.userAgentData && navigator.userAgentData.brands;
    },
  },
  mounted() {},
  async created() {
    let employee = this.$auth.user.employee;

    this.UserID = employee.system_user_id;
    this.profile_pictrue = employee.profile_picture;
    this.shift_type_id = employee.schedule.shift_type_id;

    this.getLogs();

    // try {
    //   await this.$axios.head(this.$auth.user.employee.profile_picture);
    // } catch (error) {
    //   this.profile_pictrue = "no-profile-image.jpg";
    // }

    this.device_id = `Mobile-${this.UserID}`;
  },
  methods: {
    generateLog(type) {
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

          this.message = "Success";

          this.ifExist();
          this.getLogs();
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

    getLogs() {
      this.$axios
        .get(
          `/attendance_single_list?per_page=1&UserID=${
            this.UserID
          }&LogTime=${this.getFormattedDate()}&company_id=${
            this.$auth.user.company_id
          }`
        )
        .then(({ data }) => {
          this.logsCount = data.total;
          if (data && data.total % 2 != 0) {
            this.disableCheckInButton = true;
            this.disableCheckOutButton = false;
            return;
          }

          this.disableCheckInButton = false;
          this.disableCheckOutButton = true;
        })
        .catch(({ message }) => console.log(message));
    },
    lockLogButtons(type) {
      setTimeout(() => (this.dialog = false), 10000);

      if (type == "in") {
        this.disableCheckInButton = true;

        setTimeout(() => {
          this.disableCheckOutButton = false;
        }, 60000);

        return;
      }

      this.disableCheckOutButton = true;

      setTimeout(() => {
        this.disableCheckInButton = false;
        this.$store.commit("disableCheckInButton", false);
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

    getFormattedDate() {
      const now = new Date();
      // Format the date and time as "YYYY-MM-DD HH:mm"
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(now.getDate()).padStart(2, "0")}`;
    },
  },
};
</script>
