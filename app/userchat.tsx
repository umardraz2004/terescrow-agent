import {
  Keyboard,
  StyleSheet,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatPfpNav from "@/components/ChatPfpNav";
import { COLORS, images } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import { Image } from "expo-image";
import { FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MessageInput from "@/components/MessageInput";
import { useLocalSearchParams } from "expo-router";
import { DUMMY_ALL } from "@/utils/dummyAll";
import { DUMMY_CHAT } from "@/utils/dummyChat";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  image?: string;
};

const individualMessage = [
  { id: "1", text: "Hello! Send details", isUser: true },
  { id: "2", text: "Checking!!!", isUser: false },
  {
    id: "3",
    text: "Valid bro. Your account has been credited.",
    isUser: false,
  },
  { id: "4", text: "Thanks chief", isUser: true },
];

const groupMessages = [
  { id: "1", text: "Hello! Send details", isUser: false },
  { id: "2", text: "Checking!!!", isUser: false },
  {
    id: "3",
    text: "Valid bro. Your account has been credited.",
    isUser: false,
  },
  { id: "4", text: "Thanks chief", isUser: false },
];

const UserChat = () => {
  const { dark } = useTheme();
  const { id } = useLocalSearchParams();
  const userData = DUMMY_ALL.filter((item) => item.id === id);
  // const userData =
  //   id <= "13" && id >= "0"
  //     ? DUMMY_ALL.filter((item) => item.id === id)
  //     : DUMMY_CHAT.filter((item) => item.id === id);
  const flatListRef = useRef<FlatList>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(
    userData[0].group ? groupMessages : individualMessage
  );
  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const sendMessage = (message?: string, image?: any) => {
    if (!image && !message) return;

    let newMessage: Message;

    if (!image) {
      newMessage = {
        id: (messages.length + 1).toString(),
        text: message || "",
        isUser: true,
      };
    } else {
      newMessage = {
        id: (messages.length + 1).toString(),
        text: message || "",
        isUser: true,
        image: image,
      };
    }

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setTimeout(() => {
      const responseMessage: Message = {
        id: (messages.length + 2).toString(),
        text: "This is a dummy response!",
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, responseMessage]);
      scrollToBottom();
    }, 1000);
    scrollToBottom();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageWrapper,
        { flexDirection: item.isUser ? "row-reverse" : "row" },
      ]}
    >
      {/* Profile Picture */}
      <Image
        source={[item.isUser ? images.logo : userData[0].pfp]}
        style={styles.profilePicture}
      />

      {/* Message Content */}
      <View
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessage : styles.otherMessage,
        ]}
      >
        {item.image && (
          <TouchableOpacity
            onPress={() => setImagePreview(item.image as string)}
          >
            <Image source={{ uri: item.image }} style={styles.dynamicImage} />
          </TouchableOpacity>
        )}
        {!item.image && (
          <View style={styles.messageWithTimestamp}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text
              style={[
                styles.timestamp,
                { alignSelf: item.isUser ? "flex-end" : "flex-start" },
              ]}
            >
              {new Date().toLocaleTimeString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  //this event listener scrolls to bottom to view full content
  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", () => {
      console.log("ok");
      setTimeout(() => scrollToBottom(), 200);
    });

    return () => {
      Keyboard.removeAllListeners;
    };
  }, []);

  const renderAgentChat = () => {
    return (
      <KeyboardAvoidingView
        style={[
          styles.container,
          dark
            ? { backgroundColor: COLORS.black }
            : { backgroundColor: COLORS.white },
        ]}
        behavior="padding"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={scrollToBottom}
        />

        <MessageInput sendMessage={sendMessage} />

        {imagePreview && (
          <Modal transparent={true} visible={!!imagePreview}>
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: imagePreview }}
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setImagePreview(null)}
              >
                <Ionicons name="arrow-back" size={40} color="black" />
              </TouchableOpacity>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      <ChatPfpNav
        name={userData[0].name}
        status={userData[0].online ? "Online" : "Offline"}
        image={userData[0].pfp}
      />
      {renderAgentChat()}
    </SafeAreaView>
  );
};

export default UserChat;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatContainer: { padding: 10 },
  messageContainer: {
    maxWidth: "70%",
    borderRadius: 10,
    marginVertical: 5,
    paddingVertical: 10,
  },
  userMessage: { alignSelf: "flex-end", backgroundColor: "#DCF8C6" },
  otherMessage: { alignSelf: "flex-start", backgroundColor: "#E5E5E5" },
  messageText: { fontSize: 16, borderRadius: 8 },
  timestamp: { fontSize: 12, marginTop: 5, color: COLORS.grayscale400 },
  dynamicImage: { width: "100%", height: undefined, aspectRatio: 1 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingStart: 20,
    paddingEnd: 60,
    borderRadius: 25,
    marginHorizontal: 10,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.grayscale400,
  },
  iconButton: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 50,
    borderColor: COLORS.grayscale400,
  },
  sendMessage: {
    position: "absolute",
    right: 20,
    paddingVertical: 10,
    paddingRight: 20,
  },
  imagePickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  optionButton: {
    backgroundColor: COLORS.white,
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "contain" },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    padding: 5,
  },
  profilePicture: {
    width: 40,
    height: 40,
    marginTop: 6,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  messageWrapper: {
    marginVertical: 5,
  },
  messageWithTimestamp: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingTop: 5,
    paddingLeft: 14,
    paddingRight: 14,
    paddingBottom: 5,
  },
  groupMessage: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    padding: 10,
  },
});
