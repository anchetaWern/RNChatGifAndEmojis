import React, { Component, Fragment } from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';

import Config from 'react-native-config';

const CHATKIT_INSTANCE_LOCATOR_ID = Config.CHATKIT_INSTANCE_LOCATOR_ID;
const CHATKIT_SECRET_KEY = Config.CHATKIT_SECRET_KEY;
const CHATKIT_TOKEN_PROVIDER_ENDPOINT = Config.CHATKIT_TOKEN_PROVIDER_ENDPOINT;


const USER_ID = 'YOUR CHATKIT USER ID';
const ROOM_ID = 'YOUR CHAKIT PUBLIC ROOM ID';

class App extends Component {

  state = {
    messages: []
  };

  static navigationOptions = () => {
    return {
      headerTitle: "General"
    };
  };


  constructor() {
    super();

    this.user_id = USER_ID;
    this.room_id = ROOM_ID;
  }


  componentWillUnMount() {
    this.currentUser.disconnect();
  }


  async componentDidMount() {
    try {
      const chatManager = new ChatManager({
        instanceLocator: CHATKIT_INSTANCE_LOCATOR_ID,
        userId: this.user_id,
        tokenProvider: new TokenProvider({ url: CHATKIT_TOKEN_PROVIDER_ENDPOINT })
      });

      let currentUser = await chatManager.connect();
      this.currentUser = currentUser;

      await this.currentUser.subscribeToRoomMultipart({
        roomId: this.room_id,
        hooks: {
          onMessage: this.onReceive
        },
        messageLimit: 10
      });

      await this.setState({
        room_users: this.currentUser.users
      });

    } catch (chat_mgr_err) {
      console.log("error with chat manager: ", chat_mgr_err);
    }
  }


  onReceive = (data) => {
    const { message } = this.getMessage(data);
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, message)
    }));

    if (this.state.messages.length > 1) {
      this.setState({
        show_load_earlier: true
      });
    }
  }


  getMessage = ({ id, sender, parts, createdAt }) => {
    const text = parts.find(part => part.partType === 'inline').payload.content;

    let msg_data = {
      _id: id,
      text: text,
      createdAt: new Date(createdAt),
      user: {
        _id: sender.id,
        name: sender.name,
        avatar: `https://ui-avatars.com/api/?name=${sender.name}&background=0D8ABC&color=fff`
      }
    }

    return {
      message: msg_data
    };
  }


  render() {
    const { messages } = this.state;
    return (
      <Fragment>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.container}>
          <GiftedChat
            messages={messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: this.user_id
            }}
          />
        </SafeAreaView>
      </Fragment>
    );
  }
  //

  onSend = async ([message]) => {
    let text_content = message.text;

    let message_parts = [
      { type: "text/plain", content: text_content }
    ];

    try {
      await this.currentUser.sendMultipartMessage({
        roomId: this.room_id,
        parts: message_parts
      });
    } catch (send_msg_err) {
      console.log("error sending message: ", send_msg_err);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default App;