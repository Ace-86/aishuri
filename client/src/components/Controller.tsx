import { useState } from "react";
import Title from "./Title";
import RecordMessage from "./RecordMessage";
import axios from "axios";

function Controller() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  // const [blob, setBlob] = useState("");

  const createBlobUrl = (data: any) => {
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = window.URL.createObjectURL(blob);
    return url;
  };

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);

    //append my recorded message to messages
    const myMessage = { sender: "me", blobUrl };
    const messagesArr = [...messages, myMessage];

    //convert blob url to blob object
    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        //construct audio to send file
        const formData = new FormData();
        formData.append("file", blob, "myfile.wav");

        //send for data to api endpoint
        await axios
          .post("http://localhost:8000/post-audio", formData, {
            headers: { "Content-Type": "audio/mpeg" },
            responseType: "arraybuffer",
          })
          .then((res: any) => {
            const blob = res.data;
            const audio = new Audio();
            audio.src = createBlobUrl(blob);

            //append to audio
            const shuriMessage = { sender: "shuri", blobUrl: audio.src };
            messagesArr.push(shuriMessage);
            setMessages(messagesArr);

            //play Audio
            setIsLoading(false);
            audio.play();
          })
          .catch((err) => {
            console.error(err.message);
            setIsLoading(false);
          });
      });
  };

  return (
    <div className="h-screen overflow-y-hidden">
      <Title setMessages={{ setMessages }} />
      <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
        {/* <audio src={blob} controls /> */}

        {/* conversation log */}
        <div className="mt-5 px-5">
          {messages.map((audio, index) => {
            return (
              <div
                key={index + audio.sender}
                className={
                  "flex flex-col " +
                  (audio.sender == "shuri" && "flex items-end ")
                }
              >
                {/* Sender */}
                <div className="mt-4">
                  <p
                    className={
                      audio.sender == "shuri"
                        ? "text-right mr-2 italic text-green-500"
                        : "ml-2 italic text-blue-500"
                    }
                  >
                    {audio.sender}
                  </p>

                  {/* audio message */}
                  <audio
                    src={audio.blobUrl}
                    className="appearance-none"
                    controls
                  />
                </div>
              </div>
            );
          })}

        {messages.length == 0 && !isLoading && (
          <div className="text-center font-light italic mt-10">
            Shuri is waiting....
          </div>
        )}

        {isLoading && (
          <div className="text-center font-light italic mt-10 animate-pulse">
            Gathering my thoughts...
          </div>
        )}

        </div>

        {/* Recorder */}
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-yellow-500 to-pink-500">
          <div className="flex justify-center item-center w-full">
            <RecordMessage handleStop={handleStop} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controller;
