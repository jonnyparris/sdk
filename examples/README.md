# Why adapt your tool for Zaraz?

When customers are adding your tool to their website, they put their trust in it: they trust that the code will not do anything malicious, they trust it will not collect private data, and they trust it will not slow down their website. That's a lot of responsibility!

With more than 20 third-party tools in the average website as of 2020, it's common that a website gives up on a tool because of the side effects it brings. We know it can be difficult to build a great third-party tool - one that does everything your customers need, but still keep it performant and safe - and that's why we created Zaraz and its cloud environment. **Using Zaraz, you can offer your customers to use your tools without it running even one line of JavaScript on their users pages. They can forget about security issues, privacy issues and performance issues, and you can focus on building a great tool.**

# How does it work?

Zaraz lets your tool run JavaScript code in the cloud, instead of in the browser. This protects the browser, improves performance, and adds reliability. The cloud environment is managed for the website by Zaraz, so your tool does not need to maintain it. It is based on Cloudflare Workers, meaning it is very fast and highly stable.

After adapting tens of tools to run out in the cloud, we built a set of Helper Functions that make writing a third-party fun and easy. It's more about building the logic than about writing boilerplate code. We also provide enough context for third-party tools, so there's no need to query the `document` or `window` objects just to get common information.

This means you can still build and send tracking requests to your API just like you were doing it from the browser, but with less code. We've already built the most common Helper Functions, for example: extracting & setting cookies, generating UUIDs, detecting old browsers, auto-retry in case of failure and more.

Even if most of the processing will be moved to the cloud, the possibility to run code in the browser is still available. We encourage you to move as much as possible to the cloud environment.

Get started here!

---

# Runtime APIs

## Overview

Zaraz aims to provide enough context via a requestData object and handy utility functions for each library to reduce the amount of code running within user browsers. This also helps minimise duplicate efforts across multiple third party scripts.

In essence, the code for each tool runs within an environment roughly like the following code block:

```javascript
import utils from 'ZarazHelpers'

fire(bla, blah, { requestData }) {
  // YOUR_CODE_HERE
}
```

### requestData

Contains the properties below providing a comprehensive context for each event triggered from a user's browser session.
The `requestData` object is essentially comprised of 2 main themes of information, data about the request made to the Zaraz worker, and data about the user's request to your customer's website. The latter is under the **`requestData.system`** key and typically contains more than enough information for your tool to execute as intended. It also includes any arguments sent as part of event payload.

#### Properties

- `ip` **string**
- `timestamp` **number**
- `method` **string**
- `pathname` **string**
- `baseUrl` **string**
- `url` **string**
- `user-agent`
  - `ua` **string**
  - `browser`
    - `name` **string**
    - `version` **string**
    - `major` **string**
  - `engine`
    - `name` **string**
    - `version` **string**
  - `os`
    - `name` **string**;
    - `version` **string**
  - `device` **string**
  - `cpu` **string**
- `cookies` **Cookies**
- `pcookies` **Cookies**
- `params` **Params**
  - `_let` **number** timestamp of last executed request
  - `executed` **string array** collection of previously executed event names
- `client` **Client**
- `system` **System**

  includes general information about a user's visit to the website such as details about their browser and the state of the site itself.

  - `page`
    - `query` **object**
    - `title` **string**
    - `url`
      - `href` **string**
    - `referrer` **string**
    - `encoding` **string**
  - `cookies` **object** cookies obtained from the browser `document`
  - `device`
    - `ip`: **string** incoming IP address
    - `resolution` **string**
    - `viewport` **string**
    - `language` **string**
    - `user-agent`
      - `ua` **string**
      - `browser`
        - `name` **string**
        - `version` **string**
        - `major` **string**
      - `engine`
        - `name` **string**
        - `version` **string**
      - `os`
        - `name` **string**;
        - `version` **string**
      - `device` **string**
      - `cpu` **string**
  - `misc`
    - `random` **number** a random number unique to each request
    - `timestamp` **number**
  - `event` **object**

#### an example requestData object:

```javascript=
requestData: {
    'user-agent': {
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0',
      browser: { name: 'Firefox', version: '88.0', major: '88' },
      engine: { name: 'Gecko', version: '88.0' },
      os: { name: 'Mac OS', version: '10.15' },
      device: {},
      cpu: {},
    },
    ip: '127.0.0.1',
    timestamp: 1621935336,
    cookies: {},
    method: 'GET',
    pcookies: {},
    baseUrl: 'http://127.0.0.1:1337/z-3333',
    pathname: '/z-3333/s.js',
    params: {},
    url: false,
    client: { __zarazTrack: '__zarazPageview' },
    system: {
      page: {
        query: { cheese: 'brie'},
        title: 'page title',
        url: {
          href: 'destination link',
        },
        referer: '',
        encoding: '',
      },
      cookies: {
        _ga: 'GA1.1.2006998272.1617012296',
        _gid: 'GA1.2.1520407294.1621950425',
      },
      event: {
        name: 'clickCTA',
        category: 'conversion',
      },
      device: {
        resolution: '1680x1050',
        viewport: 'undefinedxundefined',
        language: 'en-GB',
        userAgent: {
          ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0',
          browser: { name: 'Firefox', version: '88.0', major: '88' },
          engine: { name: 'Gecko', version: '88.0' },
          os: { name: 'Mac OS', version: '10.15' },
          device: {},
          cpu: 'Intel Mac OS X 10.15',
        },
        ip: '127.0.0.1',
      },
      misc: { random: 341712, timestamp: 1621935336 },
    },
  }
```

---

### Helper Functions

1.  `genCookieString(key, value, [options])`

    params: - `key` **string** - `value` **string** - `[options]` **object** (optional) containing overrides for `path`, `domain`, `expires` values

    returns a browser-console-ready script string for setting a cookie.

    e.g. `genCookieString('userId', 'b7f1520d2f57')` would return `document = 'userId=b7f1520d2f57; expires=Fri, 31 Dec 2028 23:59:59 GMT';`

2.  `getRandomInt()`

    returns a random integer between 0 and [2147483647](https://en.wikipedia.org/wiki/2,147,483,647)

3.  `uuidv4()`

    returns a [v4 uuid](<https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)>)

4.  `uuidv4NoDashes()`

    returns a [v4 uuid](<https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)>) without hyphens

5.  `flattenKeys(object, prefixString)`

    "flattens" the key-value pairs of an object such that any nested key paths are joined by dots.

    E.g. `flattenkeys({a: 'a', b: {c: 'c'}})` would return `{ a: "a", "b.c": "c" }`

6.  `asyncSome()`

    [Array.some()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some) but for an array of Promises

7.  `asyncEvery()`

    [Array.every()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every) but for an array of Promises

8.  `asyncFilter()`

    [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) but for an array of Promises

---

# Best practices & examples

## Cloud based pixel

Spaceteam Analytics collects pageviews data from customers websites. It needs to know what page was viewed, and some non-identifing information about who viewed it. They can do **everything on the cloud, without any client-side JavaScript code.**

```javascript=
// Create the payload
const payload = {
  url: page.url.href,
  title: page.title,
  resolution: device.resolution,
  ua: device.userAgent,
};

// Send a POST request from the cloud
zFetch("https://spaceteam.com/collect", payload);
```

## Browser fired pixel

Jupiter Watchers are doing a bit more tracking. They rely on third-party cookies, and so they **need the request to originate in the browser**. They still want to minimize the amount of JavaScript code as much as possible, so they use Zaraz the construct the URL server-side.

```javascript=
// Create the payload
const payload = {
  url: page.url.href,
  title: page.title,
  resolution: device.resolution,
  ua: device.userAgent,
};

// Construct the final URL
const params = new URLSearchParams(payload).toString();
const baseURL = "https://jupiters.watchers/track?";
const finalURL = baseURL + params;

// Send a GET request from the browser
clientJS += `zaraz.f("${finalURL}");`;
```

## Cloud based pixel with first-party cookie

Venus Observatory can get all the information they need using an API, but they **need to set a first-party cookie on the browser and send its value** too.

```javascript=
// Get the cookie from the browser
const cookieName = "venus-cookie"
let venusSessionCookie = cookies[cookieName]

// If it doesn't exist, generate a new UUIDv4 for it
if (!venusSessionCookie) {
  venusSessionCookie = uuidv4()
}

// Save or update the cookie in the browser
clientJS += genCookieString(cookieName, venusSessionCookie)

// Create the payload
const payload = {
  session: venusSessionCookie,
  ip: device.ip,
  url: page.url.href,
  title: page.title,
};

// Send a POST request from the cloud
zFetch("https://venus-observatory.com/cookie-endpoint", payload);
```

# Invite for submissions

If you want to join us in building a faster internet without giving up on the obvious benefits third-parties are bringing, give it a try, ask us any question you may have, tell us about any special needs you encounter and submit your tool to vendors@zaraz.com for a review.

With our support, your tool will be added to our third-parties catalog and users will be able to install and configure it in no time.

Don't forget to check out our getting started example!
