<template>
  <div class="text-center mt-5">
    <v-container>
      <v-avatar size="150">
        {{ imageSrc }}
        <img :src="imageSrc" alt="Avatar" />
      </v-avatar>
      <v-card-text>
        <div id="cameraContainer">
          <video
            style="width: 100%; height: 250px"
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
          @click="enroll"
        >
          Enroll
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
  },
  methods: {
    async startCamera() {
      try {
        this.isButtonDisabled = false;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        }); // Use front camera
        this.cameraElement.srcObject = stream;
        this.errorMessageElement.style.display = "none";
      } catch (error) {
        console.error("Error accessing camera:", error);
        this.errorMessageElement.style.display = "block";
        document.getElementById("cameraContainer").style.display = "none";
        this.isButtonDisabled = true;
      }
    },
    async enroll() {
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
      this.imageSrc = this.canvasElement.toDataURL("image/png");

      var myHeaders = new Headers();
      myHeaders.append("token", "4fa25eb27e254ffdbfb53181cb648090");

      var formdata = new FormData();
      formdata.append("name", "Francis");
      formdata.append("photos", this.imageSrc);
      formdata.append("store", "1");
      formdata.append("collections", "Employees");

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
      };

      fetch("https://api.luxand.cloud/v2/person", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          console.log(result);
        })
        .catch((error) => console.log("error", error));
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
