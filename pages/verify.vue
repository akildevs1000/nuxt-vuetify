<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-dialog persistent v-model="dialog">
          <v-card>
            <v-toolbar dense color="purple">
              {{ response }}
              <!-- {{ response.status }} - {{ response.uuid }} -->

              <v-spacer></v-spacer>
              <v-icon @click="dialog = false">mdi-close-circle-outline</v-icon>
            </v-toolbar>
          </v-card>
        </v-dialog>
        <v-text-field v-model="uuid" outlined dense></v-text-field>

        <div
          id="cameraContainer"
          class="text-center"
          style="width: 250px; height: auto; margin: 0 auto"
        >
          <video
            style="width: 100%; height: auto"
            id="camera"
            autoplay
            playsinline
          ></video>
          <br />
          <v-btn block @click="capturePhoto" color="primary">Capture</v-btn>
          <canvas id="canvas" style="display: none"></canvas>
          <v-img :src="this.imageSrc"></v-img>
        </div>
        <p id="errorMessage" style="display: none; color: red">
          Camera not found or access denied.
        </p>
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
      uuid: "",
      dialog: false,
      openCameraDialog: false,
      response: "",
      cameraElement: null,
      canvasElement: null,
      errorMessageElement: null,
      imageSrc: "",
      config: {
        headers: {
          token: "4fa25eb27e254ffdbfb53181cb648090",
          "Content-Type": "multipart/form-data", // Set content type to FormData
        },
      },
    };
  },
  mounted() {
    this.cameraElement = document.getElementById("camera");
    this.canvasElement = document.getElementById("canvas");
    this.errorMessageElement = document.getElementById("errorMessage");
    this.startCamera();
  },
  created() {
    this.uuid = "669e267a-6082-11ee-86d3-0242ac120002";
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

      this.checkLiveness(this.canvasElement);
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

        // Temp
        this.dialog = true;
        this.response = data.message;

        //
      } catch (error) {
        this.dialog = true;
        this.response = error.message;
      }
    },
  },
};
</script>
