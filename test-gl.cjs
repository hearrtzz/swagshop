const gl = require('gl')(1, 1);
if (!gl) {
  console.log("headless gl not supported");
} else {
  console.log("headless gl supported");
}
