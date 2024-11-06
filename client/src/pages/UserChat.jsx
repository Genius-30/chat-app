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
  FileDownIcon,
  FileIcon,
  Loader2,
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
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function UserChat() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const { chatId } = useParams();
  const messagesEndRef = useRef(null);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingIntervalRef = useRef(null);

  const { _id: currentUserId } = useSelector((state) => state.auth.user);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setFiles([
          ...files,
          new File([blob], "audio_message.webm", { type: "audio/webm" }),
        ]);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error(
        "Unable to access microphone. Please check your browser settings."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && files.length === 0) return;

    setSendingMessage(true);
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

      // Emit message to other users in the room
      socket.emit("sendMessage", res.data);

      setInputMessage("");
      setFiles([]);
      setAudioBlob(null);
    } catch (error) {
      toast.error(error.response.data.message || "Error sending message");
    } finally {
      setSendingMessage(false);
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

  useEffect(() => {
    // Connect to the Socket.IO server
    socket.connect();

    // Join the specific chat room
    socket.emit("joinRoom", chatId);

    // Listen for new messages from the server
    socket.on("message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      // Leave the room when the component unmounts
      socket.emit("leaveRoom", chatId);
      socket.disconnect();
    };
  }, [chatId]);

  const renderFilePreview = (file) => {
    const fileUrl = file.path || URL.createObjectURL(file);
    const fileType = file.mimetype ? file.mimetype.split("/")[0] : "unknown";

    return (
      <div className={`h-auto w-48 sm:w-64 max-w-full flex flex-col mb-2`}>
        {fileType === "image" && (
          <Dialog>
            <DialogTrigger asChild>
              <img
                src={fileUrl}
                alt={file.filename || "Uploaded image"}
                className="w-full h-full object-cover cursor-pointer rounded-md"
              />
            </DialogTrigger>
            <DialogContent
              aria-describedby={undefined}
              className="max-h-[90vh] h-auto w-auto"
            >
              <DialogTitle className="hidden"></DialogTitle>
              <img
                src={fileUrl}
                alt={file.filename || "Uploaded image"}
                className="w-auto max-h-[80vh] object-cover rounded-md"
              />
            </DialogContent>
          </Dialog>
        )}
        {fileType === "audio" && (
          <audio controls className="w-full">
            <source src={fileUrl} type={file.type} />
            Your browser does not support the audio element.
          </audio>
        )}
        {fileType === "video" && (
          <video controls className="w-full h-full rounded-md">
            <source src={fileUrl} type={file.type} />
            Your browser does not support the video tag.
          </video>
        )}
        {fileType !== "image" &&
          fileType !== "audio" &&
          fileType !== "video" && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1"
            >
              <FileDownIcon className="h-8 w-8d text-gray-500 dark:text-gray-400" />
              <p>{file.filename}</p>
            </a>
          )}
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

  const otherUsers = chat.isGroupChat
    ? chat.users.filter((user) => user._id !== currentUserId)
    : chat.users[0];
  const groupedMessages = groupMessagesByDate(messages);
  const avatar = chat.isGroupChat ? chat.avatar : otherUsers?.avatar;
  const username = chat.isGroupChat ? chat.chatName : otherUsers?.username;

  return (
    <div className="flex flex-col h-full w-full bg-gray-100 dark:bg-[#121212] pb-12 sm:p-0">
      <header className="bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-50 border-b border-gray-200 dark:border-gray-800 py-3 px-2 sm:p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Dialog>
          <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Avatar className="h-8 sm:h-10 w-8 sm:w-10 mr-3">
              <AvatarImage src={avatar} className="rounded-full" />
              <AvatarFallback>{`${username}'s avatar`}</AvatarFallback>
            </Avatar>
          </DialogTrigger>
          <DialogContent
            aria-describedby={undefined}
            className="max-h-[90vh] max-w-[90vw] sm:max-h-[70vh] sm:max-w-[70vh]"
          >
            <DialogTitle className="hidden">{username}</DialogTitle>
            <img
              src={avatar}
              alt={`${username}'s avatar`}
              className="w-full h-full object-cover rounded-lg"
            />
          </DialogContent>
        </Dialog>

        <div className="flex-grow">
          <h2 className="text-sm sm:text-base font-semibold">
            {chat.isGroupChat ? chat.chatName : otherUsers?.username}
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

      <main className="flex-grow overflow-y-auto p-2 sm:p-4 space-y-4 bg-gray-50 dark:bg-[#1A1A1A] custom-scroller">
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
                  message.sender._id !== otherUsers._id
                    ? "justify-end"
                    : "justify-start"
                } mt-2`}
              >
                <div
                  className={`inline-block max-w-[70%] sm:max-w-[60%] px-2 py-1 sm:p-2 rounded-lg shadow-sm ${
                    message.sender._id !== otherUsers._id
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  } overflow-hidden`}
                >
                  {message.files && message.files.length > 0 && (
                    <div className="w-full">
                      {message.files.map((file, index) => (
                        <div key={index} className="w-full">
                          {renderFilePreview(file)}
                        </div>
                      ))}
                    </div>
                  )}
                  {message.text && <p className="text-sm">{message.text}</p>}
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
              <div key={index} title={file.name} className="h-16 w-16 relative">
                {fileType === "image" ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Selected file ${index + 1}`}
                    className="h-full w-full object-cover rounded-md"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center space-y-1 bg-gray-200 dark:bg-zinc-700 rounded-md p-1">
                    {fileType === "audio" ? (
                      <AudioLinesIcon className="h-7 w-7" />
                    ) : fileType === "video" ? (
                      <VideoIcon className="h-7 w-7" />
                    ) : (
                      <FileIcon className="h-7 w-7" />
                    )}
                    <span className="w-full text-xs text-gray-500 dark:text-gray-400 truncate">
                      {file.name}
                    </span>
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

      <footer className="bg-white dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-800 p-2 sm:p-4">
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
            accept="image/*, audio/*, video/*"
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
          {isRecording ? (
            <div className="flex-grow flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Recording... {recordingDuration}s
              </span>
              <div className="flex-grow">
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${((recordingDuration % 60) / 60) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Input
              type="text"
              placeholder="Type a message"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#2A2A2A] text-gray-900 dark:text-white transition-none"
            />
          )}
          <Button
            type="button"
            size="icon"
            className={`${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            } transition-none px-[6px]`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic
              className={`h-5 w-5 ${
                isRecording ? "text-white" : "text-gray-600 dark:text-gray-300"
              }`}
            />
          </Button>
          <Button
            type="submit"
            size="icon"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-none px-[6px]"
            disabled={
              (!inputMessage && files.length === 0 && !audioBlob) ||
              sendingMessage
            }
          >
            {sendingMessage ? (
              <Loader2 className="h-5 w-5 text-gray-600 dark:text-gray-300 animate-spin" />
            ) : (
              <Send className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </Button>
        </form>
      </footer>
    </div>
  );
}
