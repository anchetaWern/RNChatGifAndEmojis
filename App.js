import React, { Component, Fragment } from 'react';
import { StatusBar, SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GiftedChat, Send, Message } from 'react-native-gifted-chat';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';
import EmojiSelector from 'react-native-emoji-selector';

import Config from 'react-native-config';
import Modal from 'react-native-modal';

import GiphySearch from './src/components/GiphySearch';

const CHATKIT_INSTANCE_LOCATOR_ID = Config.CHATKIT_INSTANCE_LOCATOR_ID;
const CHATKIT_SECRET_KEY = Config.CHATKIT_SECRET_KEY;
const CHATKIT_TOKEN_PROVIDER_ENDPOINT = Config.CHATKIT_TOKEN_PROVIDER_ENDPOINT;

import searchGifs from './src/helpers/searchGifs';

const USER_ID = 'YOUR CHATKIT USER ID';
const ROOM_ID = 'YOUR CHATKIT PUBLIC ROOM ID';

class App extends Component {

  state = {
    messages: [],

    text: '',
    is_gif_modal_visible: false,
    is_emoji_modal_visible: false,
    query: '',
    gif_url: '',
    has_emoji: false
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
    const url_part = parts.find(part => part.partType === 'url') ? parts.find(part => part.partType === 'url').payload : null;

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

    if (url_part) {
      msg_data.image = url_part.url;
    }

    return {
      message: msg_data
    };
  }


  render() {
    const { text, messages, is_gif_modal_visible, is_emoji_modal_visible, query, search_results } = this.state;
    return (
      <Fragment>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.container}>
          <GiftedChat
            text={text}
            onInputTextChanged={text => this.setState({ text })}
            messages={messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: this.user_id
            }}
            renderActions={this.renderCustomActions}
          />
        </SafeAreaView>

        <Modal isVisible={is_gif_modal_visible}>
          <View style={styles.modal_body}>
            <TouchableOpacity onPress={() => this.closeGifModal('')}>
              <View style={styles.modal_close_container}>
                <Text style={styles.modal_close_text}>Close</Text>
              </View>
            </TouchableOpacity>

            <GiphySearch
              query={query}
              onSearch={(query) => this.setState({ query })}
              search={this.searchGifs}
              search_results={search_results}
              onPick={(gif_url) => this.closeGifModal(gif_url)} />
          </View>
        </Modal>

        <Modal isVisible={is_emoji_modal_visible}>
          <View style={styles.modal_body}>
            <TouchableOpacity onPress={() => {
              this.setState({ is_emoji_modal_visible: false });
            }}>
              <View style={styles.modal_close_container}>
                <Text style={styles.modal_close_text}>Close</Text>
              </View>
            </TouchableOpacity>

            <EmojiSelector
              columns={12}
              showHistory={true}
              onEmojiSelected={this.selectEmoji}
            />

          </View>
        </Modal>

      </Fragment>
    );
  }
  //

  searchGifs = async () => {
    const { query } = this.state;
    const search_results = await searchGifs(query);
    this.setState({
      search_results
    });
  }


  selectEmoji = (emoji) => {
    this.setState(state => {
      return {
        text: `${state.text} ${emoji}`,
        has_emoji: true
      }
    });
  }


  onSend = async ([message]) => {
    const { gif_url } = this.state;
    let text_content = message.text;
    let message_parts = [
      { type: "text/plain", content: text_content }
    ];

    if (gif_url) {
      message_parts.push({ type: "image/gif", url: gif_url });
    }

    try {
      await this.currentUser.sendMultipartMessage({
        roomId: this.room_id,
        parts: message_parts
      });

      this.setState({
        gif_url: '',
        has_emoji: false
      });
    } catch (send_msg_err) {
      console.log("error sending message: ", send_msg_err);
    }
  }


  closeGifModal = (gif_url) => {
    this.setState({
      is_gif_modal_visible: false,
      gif_url
    });
  }


  renderCustomActions = () => {
    const { gif_url, has_emoji } = this.state;
    const gif_text_color = (gif_url) ? "#0064e1" : "#808080";
    const emoji_text_color = (has_emoji) ? "#0064e1" : "#808080";

    return (
      <View style={styles.custom_actions_container}>
        <TouchableOpacity onPress={() => this.setState({ is_gif_modal_visible: true })}>
          <View style={styles.buttonContainer}>
            <Text style={{ color: gif_text_color }}>GIF</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.setState({ is_emoji_modal_visible: true })}>
          <View style={styles.buttonContainer}>
            <Text style={{ color: emoji_text_color }}>ICO</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
  //
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  custom_actions_container: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  buttonContainer: {
    padding: 10
  },
  modal_body: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 10
  },
  modal_close_container: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 10
  },
  modal_close_text: {
    color: '#0366d6'
  }
});

export default App;