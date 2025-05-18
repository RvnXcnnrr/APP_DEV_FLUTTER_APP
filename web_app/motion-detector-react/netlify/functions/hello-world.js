// A simple Netlify function to verify the functions directory is working
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Motion Detector API!" })
  };
};
