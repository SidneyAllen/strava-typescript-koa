import Koa from 'koa';
import Router from 'koa-router';
import { AuthorizationCode } from 'simple-oauth2';
import 'dotenv/config';

import { randomBytes } from 'crypto';

var session = require('koa-generic-session');
var redisStore = require('koa-redis');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const Pug = require('koa-pug');

const app = new Koa();
const pug = new Pug({
  viewPath: path.resolve(__dirname, './views'),
  locals: {
    /* variables and helpers */
  },
  app: app, // Binding `ctx.render()`
});
const router = new Router();

const oauthClient = new AuthorizationCode({
  client: {
    id: `${process.env.CLIENT_ID}`,
    secret: `${process.env.CLIENT_SECRET}`,
  },
  auth: {
    tokenHost: 'https://www.strava.com',
    authorizeHost: 'https://www.strava.com',
    authorizePath: '/oauth/authorize',
    tokenPath: '/api/v3/oauth/token',
  },
  options: {
    authorizationMethod: 'body',
    bodyFormat: 'form',
  },
});

// Set up session middleware
app.keys = ['your-secret-key']; // Replace with a strong secret key
app.use(
  session({
    store: redisStore(),
  }),
);

// Set up body parser middleware
app.use(bodyParser());

// Router Init
app.use(async (ctx, next) => {
  console.log(`Request: ${ctx.method} ${ctx.url}`);
  await next();
});

// Home route
router.get('/', async (ctx) => {
  ctx.body = '<h1>Welcome</h1><a href="/auth">Connect to Strava</a>';
});

// Authorization and Redirect route
router.get('/auth', async (ctx) => {
  const state = generateRandomState();
  const authorizationUri = oauthClient.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI,
    scope: 'profile:read_all,read',
    state: state,
  });

  session.state = state;

  ctx.redirect(authorizationUri);
});

// Callback route
router.get('/callback', async (ctx) => {
  const code = ctx.query.code as string;
  const state = ctx.query.state as string;

  if (!code) {
    ctx.body = 'Authorization code is missing!';
    return;
  }

  if (state != session.state) {
    ctx.body = 'Authorization state invalid!';
    return;
  }

  const options = {
    code,
    redirect_uri: 'http://localhost:3000/callback',
  };

  try {
    const data = await oauthClient.getToken(options);

    // Save token in session
    session.token = data.token.access_token;

    ctx.body = '<h1>Authorization successful!</h1> <a href="/me">Get Your Profile</a>';
  } catch (error) {
    if (!error) {
      return;
    }
    ctx.body = 'Authorization failed!';
  }
});

// Get Authenticated Athelete route
router.get('/me', async (ctx) => {
  const accessToken = session.token;

  const response = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
  });

  // Check if the response is OK (status code is 200-299)
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  // Read the ReadableStream as JSON
  const data = await response.json();

  // Now you can work with the parsed JSON data
  const body = await pug.render('me', data, true);
  ctx.body = body;
});

function generateRandomState(): string {
  const state = randomBytes(32).toString('hex');
  return state;
}

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
