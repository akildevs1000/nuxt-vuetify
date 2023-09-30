<template>
    <v-dialog v-model="dialog" max-width="600px">
      <template v-slot:activator="{ on }">
        <v-btn @click="openCamera" color="primary">Open Camera</v-btn>
      </template>
      <v-card>
        <v-card-title>
          <h1>Camera Example</h1>
        </v-card-title>
        <v-card-text>
          <div id="cameraContainer">
            <video ref="camera" autoplay playsinline></video>
            <v-btn @click="capturePhoto" color="primary">Capture</v-btn>
            <canvas ref="canvas" style="display: none;"></canvas>
          </div>
          <p ref="errorMessage" style="display: none; color: red;">Camera not found or access denied.</p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  export default {
    auth: false,
  layout: "login",
    data() {
      return {
        dialog: false,
      };
    },
    methods: {
      openCamera() {
        this.dialog = true;
        this.startCamera();
      },
      async startCamera() {
        const cameraElement = this.$refs.camera;
        const canvasElement = this.$refs.canvas;
        const errorMessageElement = this.$refs.errorMessage;
  
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); // Use front camera
          cameraElement.srcObject = stream;
          errorMessageElement.style.display = 'none';
        } catch (error) {
          console.error('Error accessing camera:', error);
          errorMessageElement.style.display = 'block';
          document.getElementById('cameraContainer').style.display = 'none';
        }
      },
      capturePhoto() {
        const cameraElement = this.$refs.camera;
        const canvasElement = this.$refs.canvas;
  
        canvasElement.width = cameraElement.videoWidth;
        canvasElement.height = cameraElement.videoHeight;
        canvasElement.getContext('2d').drawImage(cameraElement, 0, 0, canvasElement.width, canvasElement.height);
        const imageURL = canvasElement.toDataURL('image/png');
        const preview = document.createElement('img');
        preview.src = imageURL;
        document.body.appendChild(preview);
      },
    },
  };
  </script>
  