import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
}

interface VideoCallChatProps {
  showChat: boolean;
}

export const VideoCallChat = ({ showChat }: VideoCallChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: "Você",
        text: newMessage,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  if (!showChat) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-lg">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Chat da Consulta</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="text-sm">
              <div className="font-medium text-purple-600">{message.sender}</div>
              <div className="text-gray-700">{message.text}</div>
              <div className="text-xs text-gray-400">{message.time}</div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <Button onClick={handleSendMessage} size="sm">
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};