const axios = require('axios');

function startKeepAlive() {
  const url = process.env.RENDER_EXTERNAL_URL;

  setInterval(async () => {
    try {
      await axios.get(url);
      console.log("🔁 Ping enviado a Render");
    } catch (error) {
      console.log("Ping error:", error.message);
    }
  }, 300000); // 5 minutos
}

module.exports = startKeepAlive;