<template>
  <div class="text-center mt-5">
    <v-container>
      <v-avatar size="150">
        <img :src="profile_pictrue" alt="Avatar" />
      </v-avatar>
      <v-card-text>
        <div id="cameraContainer">
          <video
            style="width: 100%; height: 250px; display: none"
            id="camera"
            autoplay
            playsinline
          ></video>
          <br />

          <canvas id="canvas" style="display: none"></canvas>
        </div>
        <p id="errorMessage" style="display: none; color: red">
          Camera not found or access denied.
        </p>

        <div>EID: {{ UserID }}</div>
        <!-- <div>Device Id: {{ uniqueDeviceId }}</div> -->
        <v-btn
          :disabled="isButtonDisabled"
          small
          class="indigo"
          dark
          outlined
          @click="capturePhoto(`in`)"
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
          @click="capturePhoto(`out`)"
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
    log_type: "",
    attendanceLogs: [],
    profile_pictrue: "",
    uniqueDeviceId: null,
    device_id: null,
    isButtonDisabled: false,
    dialog: false,
    message: "",
    openCameraDialog: false,
    response: "",
    cameraElement: null,
    canvasElement: null,
    errorMessageElement: null,
    imageSrc: "",
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
  mounted() {
    this.cameraElement = document.getElementById("camera");
    this.canvasElement = document.getElementById("canvas");
    this.errorMessageElement = document.getElementById("errorMessage");
    this.startCamera();
  },
  created() {
    Fingerprint2.get({}, (components) => {
      const values = components.map(({ value }) => value);
      this.uniqueDeviceId = Fingerprint2.x64hash128(values.join(""), 31);
    });

    this.UserID = this.$auth.user.employee.system_user_id;
    this.profile_pictrue = this.$auth.user.employee.profile_picture;
    this.device_id = `Mobile-${this.UserID}`;
  },
  methods: {
    generateLog(type) {
      this.isButtonDisabled = true;
      setTimeout(() => {
        this.isButtonDisabled = false;
      }, 60000);
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
    async startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        }); // Use front camera
        this.cameraElement.srcObject = stream;
        this.errorMessageElement.style.display = "none";
      } catch (error) {
        console.error("Error accessing camera:", error);
        this.errorMessageElement.style.display = "block";
        document.getElementById("cameraContainer").style.display = "none";
      }
    },
    async capturePhoto(type) {
      this.log_type = type;
      this.canvasElement.width = this.cameraElement.videoWidth;
      this.canvasElement.height = this.cameraElement.videoHeight;
      this.canvasElement
        .getContext("2d")
        .drawImage(
          this.cameraElement,
          0,
          0,
          this.canvasElement.width,
          this.canvasElement.height
        );

      this.checkLiveness(this.canvasElement);
    },
    async sendLivenessPhoto(src, type) {
      try {
        const config = {
          headers: {
            token: "4fa25eb27e254ffdbfb53181cb648090",
            "Content-Type": "multipart/form-data", // Set content type to FormData
          },
        };
        const formData = new FormData();
        formData.append("photo", src);
        const { data } = await this.$axios.post(
          "https://api.luxand.cloud/photo/liveness",
          formData,
          config
        );
        if (data.result !== "real") {
          // alert("Not real image");
          this.dialog = true;
          this.message = data.result;
          return;
        }
        this.generateLog(type);
      } catch (error) {
        // alert("catch block");

        this.dialog = true;
        this.message = error;
        console.error(error);
      }
    },

    async checkLiveness(canvas) {
      try {
        const formData = new FormData();
        const blob = await new Promise((resolve) =>
          canvas.toBlob((blob) => resolve(blob), "image/jpeg")
        );

        formData.append("photo", canvas.toDataURL("image/png"));
        const { data } = await this.$axios.post(
          "https://api.luxand.cloud/photo/liveness",
          formData,
          this.config
        );

        if (data && data.result == "fake") {
          this.dialog = true;
          this.response = "Fake Image";
          return;
        }
        this.verify(canvas);
      } catch (error) {
        this.dialog = true;
        this.response = error.message;
      }
    },

    async verify(canvas) {
      try {
        const blob = await new Promise((resolve) =>
          canvas.toBlob((blob) => resolve(blob), "image/jpeg")
        );

        const formData = new FormData();
        formData.append("faceImage", blob, "image.jpg");
        formData.append("uuid", this.uuid);

        const { data } = await this.$axios.post(
          "https://backend.ideahrms.com/api/verify-temp-image",
          formData
        );

        if (data && data.status === "failure") {
          this.dialog = true;
          this.response = data.message;
          return;
        }

        this.generateLog(this.log_type);
      } catch (error) {
        this.dialog = true;
        this.response = error.message;
      }
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
