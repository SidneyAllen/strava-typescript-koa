# Strava Typescript Koa

This example app demonstrates Strava's 3-legged OAuth2 flow and displays basic profile information.

Project built with: 

* TypeScript
* Koa
* Simple OAuth2

## Live Demo

This project has been deployed on Render.

[See Live Demo](https://strava-typescript-koa.onrender.com/)

## Getting Started

Fork or Clone this repository to your local development environement

## Install Dependencies

```console
cd strava-typescript-koa
npm install
```

## Get your App Client ID & Secret

Go to Strava.com to create your account. You will need to be a paying member to builid using Strava's API.

Go to your [My Application API](https://www.strava.com/settings/api) in your profile settings.

You'll find your client id and secret, which you'll use in the next section.

Before you leave, set the authorization callback domain to `localhost:3000`

## Configure your app

Rename the file `env.example` to `.env`

Copy and paste your client id and client secret into the `.env` file.

```console
CLIENT_ID="YOUR_STRAVA_CLIENT_ID"
CLIENT_SECRET="YOUR_STRAVA_CLIENT_SECRET"
REDIRECT_URI="http://localhost:3000/callback"
```

## Build Project

```console
npm run build
```

## Run Project Locally

```console
npm run start
```

## Check in your browser

Open your browser to 

```console
http://localhost:3000
```

If everything went according to plan, you should see a **Connect to Strava** link. Click it, an authorize access to your Strava account. Upon successfully connecting, click **Get My Profile** to see some basic profile information.
