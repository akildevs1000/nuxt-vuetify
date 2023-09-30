<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card outlined>
          <v-card-text>
            {{ response }}
            <div id="cameraContainer">
              <video
                style="width: 100%; height: 250px; display: none"
                id="camera"
                autoplay
                playsinline
              ></video>
              <br />
              <v-btn @click="capturePhoto" color="primary">Capture</v-btn>
              <canvas id="canvas" style="display: none"></canvas>
            </div>
            <p id="errorMessage" style="display: none; color: red">
              Camera not found or access denied.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  auth: false,
  layout: "guest",
  data() {
    return {
      openCameraDialog: false,
      response: "",
      cameraElement: null,
      canvasElement: null,
      errorMessageElement: null,
      imageSrc: "",
    };
  },
  mounted() {
    this.cameraElement = document.getElementById("camera");
    this.canvasElement = document.getElementById("canvas");
    this.errorMessageElement = document.getElementById("errorMessage");
    this.startCamera();
  },
  methods: {
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
    async capturePhoto() {
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
      // const imageURL = this.canvasElement.toDataURL("image/png");
      // const preview = document.createElement("img");
      // document.body.appendChild(preview);
      this.imageSrc = this.canvasElement.toDataURL("image/png");
      await this.sendLivenessPhoto(this.imageSrc);
    },
    async sendLivenessPhoto(src) {
      try {
        const config = {
          headers: {
            token: "4fa25eb27e254ffdbfb53181cb648090",
            "Content-Type": "multipart/form-data", // Set content type to FormData
          },
        };
        const formData = new FormData();
        formData.append("photo", src);
        const response = await this.$axios.post(
          "https://api.luxand.cloud/photo/liveness",
          formData,
          config
        );
        console.log((this.response = response.data));
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style>
/* Add your custom styles here */
</style>
