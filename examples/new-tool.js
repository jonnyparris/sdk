// Available variables within context (send to documentation)
// clientJS is an empty string that will accumulate JS code to be sent to the browser
// Helper Functions are all found under 'utils'

// - event.data contains data configured by users in zaraz-dashboard
// - event.settings usualy contains mostly identifiers(advertiser_id, publish_key),
// also configured in zaraz-dashboard

// Overview
//
// __runTool contains the code that runs after a track request is made from the browser.
//
// The tool checks if venus-cookie is already set on the client. If it is, it
// reads the session data from it and later on will add it to the params/payload object.
// If the cookie doesn't exist, a new session will be created and the client code
// for setting the cookie is appended to clientJS.
//
// After finishing up wiht the cookie, a get request is appended to clientJS, meaning 
// that https://jupiters.watchers/track?session=1&url=2&title=3&resolution=4&ua=5 request will
// be send from the client's browser.
//
// Before the clientJS code leaves to the browser, other two POST requests are sent from 
// the cloud to https://spaceteam.com/collect using zFetch, a fetch wrapper that isn't 
// different from the standard fetch.
// __runTool sends two POST requests just for the sake of giving a complete example.
//
// The function always ends with returning clientJS - client code that will be run 
// in the browser. 


const __runTool = (context) => () => {
  const { clientJS, event, requestData, utils, zFetch } = context
  const { page, device, cookies } = requestData
  
  // Get the cookie from the browser
  const cookieName = "venus-cookie"
  let venusSessionCookie = cookies[cookieName]

  // If it doesn't exist, generate a new UUIDv4 for it
  if (!venusSessionCookie) {
    venusSessionCookie = utils.uuidv4()
  }

  // Save or update the cookie in the browser
  // You can always generate your own cookie string, genCookieString returns
  // something similar to this:
  // document.cookie = 'venus-cookie=5ba3d2cd-967f-422f-aa05-f16c256d8316; Domain=domain.com; Path=/; Expires=Fri, 31 Dec 2028 23:59:59 GMT'
  clientJS += utils.genCookieString(cookieName, venusSessionCookie)

  // build params
  const params = {
    session: venusSessionCookie,
    url: page.url.href,
    title: page.title,
    resolution: device.resolution,
    ua: device.userAgent,
  };

  // Construct the final URL
  const urlParams = new URLSearchParams(params).toString();
  const baseURL = "https://jupiters.watchers/track?";
  const finalURL = baseURL + urlParams;

  // Send a GET request from the browser
  // for GET request, only pass the first argument - url
  // for POST requests, pass the optional(second argument) - data
  clientJS += `zaraz.f("${finalURL}");`;
 
  // Create payload
  const eventId = utils.getRandomInt()

  const payload = {
    data: {
      name: event.data.eventName,
      id: eventId,
      timestamp: requestData['timestamp'],
      url: requestData.system.page.url.href,
    },
    session: venusSessionCookie,
    url: page.url.href,
    title: page.title,
    resolution: device.resolution,
    ua: device.userAgent,
    token: event.settings.accessToken,
  };

  // zFetch can get exaclty the same arguments like the standard fetch 

  // Send a POST request from the cloud(1)
  zFetch("https://spaceteam.com/collect", payload);

  // Send a POST request from the cloud(2)
  zFetch("https://spaceteam.com/collect", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  return clientJS;
}