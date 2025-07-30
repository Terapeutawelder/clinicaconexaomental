
import { VideoCallInterface } from "./VideoCall/VideoCallInterface";

interface VideoCallProps {
  patientName?: string;
  professionalName?: string;
  onEndCall: () => void;
  callStartTime?: Date;
}

const VideoCall = (props: VideoCallProps) => {
  return <VideoCallInterface {...props} />;
};

export default VideoCall;
