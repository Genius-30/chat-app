import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import axios from "@/api/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  AudioLinesIcon,
  Camera,
  FileIcon,
  GitPullRequestDraftIcon,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Video,
  VideoIcon,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomLoader from "@/components/Loader";

export default function UserChat() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const { chatId } = useParams();
  const messagesEndRef = useRef(null);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/chat/${chatId}/messages`);
        if (res.data.error) {
          toast(res.data.message);
        }
        setChat(res.data);
        setMessages(res.data.messages || []);
      } catch (error) {
        toast.error(error.response.data.message || "Error fetching chat");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleCameraCapture = (e) => {
    const capturedFile = e.target.files[0];
    if (capturedFile) {
      setFiles((prevFiles) => [...prevFiles, capturedFile]);
    }
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && files.length === 0) return;

    const formData = new FormData();
    formData.append("text", inputMessage);
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await axios.post(
        `/api/chat/${chatId}/send-message`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setMessages((prevMessages) => [...prevMessages, res.data]);
      setInputMessage("");
      setFiles([]);
    } catch (error) {
      toast.error(error.response.data.message || "Error sending message");
    }
  };

  const formatDateHeader = (date) => {
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = [];
    let currentDate = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      if (!currentDate || !isSameDay(currentDate, messageDate)) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentGroup = [message];
        currentDate = messageDate;
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }
    return groups;
  };

  const renderFilePreview = (file) => {
    const fileUrl = file.path || URL.createObjectURL(file);

    // Image files
    if (file.mimetype.startsWith("image/")) {
      return (
        <img
          src={fileUrl}
          alt={file.filename}
          className="max-w-52 h-auto rounded-md mb-2"
        />
      );
    }

    // PDF files
    if (file.mimetype === "application/pdf") {
      return (
        <div className="flex items-center space-x-2 mb-2">
          <embed
            src={fileUrl}
            type="application/pdf"
            className="w-52 h-auto rounded-md"
          />
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm"
          >
            {file.filename}
          </a>
        </div>
      );
    }

    // Audio files
    if (file.mimetype.startsWith("audio/")) {
      return (
        <div className="flex items-center space-x-2 mb-2">
          <audio controls src={fileUrl} className="max-w-full">
            Your browser does not support the audio element.
          </audio>
          <span className="text-sm">{file.filename}</span>
        </div>
      );
    }

    // Video files
    if (file.mimetype.startsWith("video/")) {
      return (
        <div className="max-w-64 flex flex-col items-start space-y-2">
          <video controls src={fileUrl} className="w-full h-auto rounded-md">
            Your browser does not support the video tag.
          </video>
          <span className="text-sm">{file.filename}</span>
        </div>
      );
    }

    // Fallback for other file types
    return (
      <div className="flex items-center space-x-2 mb-2">
        <FileIcon className="h-6 w-6" />
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm"
        >
          {file.filename}
        </a>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-[#121212]">
        <CustomLoader />
      </div>
    );
  }

  if (!chatId || !chat) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-[#121212]">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Please select a chat to start messaging.
        </p>
      </div>
    );
  }

  const otherUser = chat.isGroupChat ? null : chat.users[0];
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full w-full bg-gray-100 dark:bg-[#121212]">
      <header className="bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-50 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage
            src={chat.isGroupChat ? chat.avatar : otherUser?.avatar}
            className="rounded-full"
          />
          <AvatarFallback>
            {chat.isGroupChat ? chat.chatName[0] : otherUser?.username[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h2 className="font-semibold">
            {chat.isGroupChat ? chat.chatName : otherUser?.username}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {chat.isGroupChat ? `${chat.users.length} participants` : "Online"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#1A1A1A] custom-scroller">
        {groupedMessages.map(({ date, messages }, groupIndex) => (
          <div key={groupIndex}>
            <div className="sticky top-0 z-10 flex justify-center mb-4">
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full shadow-md shadow-gray-300 dark:shadow-zinc-800">
                {formatDateHeader(date)}
              </span>
            </div>
            {messages.map((message) => (
              <div
                key={message._id}
                className={` flex ${
                  message.sender._id !== otherUser._id
                    ? "justify-end"
                    : "justify-start"
                } mt-2`}
              >
                <div
                  className={`max-w-[60%] px-2 py-2 rounded-lg shadow-sm ${
                    message.sender._id !== otherUser._id
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {message.files && message.files.length > 0 && (
                    <div className="mb-2">
                      {message.files.map((file, index) => (
                        <div key={index}>{renderFilePreview(file)}</div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <p className="text-[10px] text-end text-gray-500 dark:text-gray-400 mt-1">
                    {format(new Date(message.createdAt), "h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Preview the files being uploaded */}
      {files.length > 0 && (
        <div className="bg-gray-100 dark:bg-[#272727] p-2 flex flex-wrap gap-2">
          {files.map((file, index) => {
            const fileType = file.type.split("/")[0]; // Get the type (image, audio, video, etc.)

            return (
              <div key={index} className="relative">
                {fileType === "image" ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Selected file ${index + 1}`}
                    className="h-16 w-16 object-cover rounded-md"
                  />
                ) : fileType === "audio" ? (
                  <div className="h-16 w-16 flex items-center justify-center bg-gray-200 rounded-md">
                    <AudioLinesIcon className="h-8 w-8" />{" "}
                    {/* Replace with your audio icon */}
                  </div>
                ) : fileType === "video" ? (
                  <div className="h-16 w-16 flex items-center justify-center bg-gray-200 rounded-md">
                    <VideoIcon className="h-8 w-8" />{" "}
                    {/* Replace with your video icon */}
                  </div>
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center bg-gray-200 rounded-md">
                    <GitPullRequestDraftIcon className="h-8 w-8" />{" "}
                    {/* Replace with your PDF icon */}
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <footer className="bg-white dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-800 p-4">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleCameraCapture}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current.click()}
          >
            <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => cameraInputRef.current.click()}
          >
            <Camera className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
          <Input
            type="text"
            placeholder="Type a message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-grow border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#2A2A2A] text-gray-900 dark:text-white transition-none"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {inputMessage || files.length > 0 ? (
              <Send className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Mic className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </Button>
        </form>
      </footer>
    </div>
  );
}
