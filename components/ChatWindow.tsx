import { Box, useTheme } from "@chakra-ui/react";
import { Chat as ChatComponent, ChatProvider, useChat } from "@nft/chat";
import { useSigner } from "@nft/hooks";
import { PropsWithChildren } from "react";

const DEFAULT_CHAT_HEIGHT = 480;
const DEFAULT_CHAT_WIDTH = 356;

const Chat = () => {
  const { signer } = useChat();

  if (!signer) return null;
  return (
    <Box
      zIndex="modal"
      position="fixed"
      right="6"
      bottom="0"
      height={DEFAULT_CHAT_HEIGHT}
      width={DEFAULT_CHAT_WIDTH}
      roundedTop="2xl"
      overflow="hidden"
      boxShadow="2xl"
      border="1px"
      borderColor="grayAlpha.700"
      borderBottom="none"
    >
      <ChatComponent />
    </Box>
  );
};

export default function ChatWindow({
  children,
}: PropsWithChildren<{}>): JSX.Element {
  const signer = useSigner();
  const theme = useTheme();

  return (
    <ChatProvider signer={signer as any} theme={theme}>
      {children}
      <Chat />
    </ChatProvider>
  );
}
