# RNChatGifAndEmojis
A sample React Native chat app which allows the user to pick emojis and gifs.

## Prerequisites

-   React Native development environment
-   [Node.js](https://nodejs.org/en/)
-   [Yarn](https://yarnpkg.com/en/)
-   [Chatkit app instance](https://pusher.com/chatkit)
-   [Giphy API key](https://developers.giphy.com/docs/api#quick-start-guide)

## Getting Started

1. Clone the repo:

```
git clone https://github.com/anchetaWern/RNChatGifAndEmojis.git
cd RNChatGifAndEmojis
```

2. Install the dependencies:

```
yarn
react-native eject
react-native link react-native-config
```

3. Update `android/app/build.gradle` file to add support for React Native Config and gifs:

```
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle" // 2nd line
dependencies {
  compile 'com.facebook.fresco:animated-gif:1.10.0' // add this
}
```

4. Update the `.env` file with your credentials:

```
CHATKIT_INSTANCE_LOCATOR_ID="YOUR CHATKIT INSTANCE LOCATOR ID"
CHATKIT_SECRET_KEY="YOUR CHATKIT SECRET KEY"
CHATKIT_TOKEN_PROVIDER_ENDPOINT="YOUR CHATKIT TOKEN PROVIDER ENDPOINT"
GIPHY_API_KEY="YOUR GIPHY API KEY"
```

5. Add the Chatkit user ID and room ID on `App.js`:

```
const USER_ID = 'YOUR CHATKIT USER ID';
const ROOM_ID = 'YOUR CHATKIT PUBLIC ROOM ID';
```

6. Run the app:

```
react-native run-android
react-native run-ios
```

## Built With

-   [React Native](http://facebook.github.io/react-native/)
-   [Chatkit](https://pusher.com/chatkit)
-   [Giphy API](https://developers.giphy.com/)
-   [React Native Emoji Selector](https://github.com/arronhunt/react-native-emoji-selector)
