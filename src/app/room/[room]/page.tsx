'use client';

import { useParams } from 'next/navigation';
import '@livekit/components-styles';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ConnectionStateToast,
  VideoConference,
} from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { VideoPresets } from 'livekit-client';
import CustomVideoConference from '@/components/CustomVideoConference';

export default function Page() {
  const { room } = useParams();
  const [token, setToken] = useState('');

  useEffect(() => {
    (async () => {
      const name = localStorage.getItem('username');
      try {
        const resp = await fetch(`/api/get-participant-token?room=${room}&username=${name}`);
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [room]);

  if (token === '') {
    return <div>Getting token...</div>;
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      options={{
        publishDefaults: {
          red: false,
          dtx: false,
          videoSimulcastLayers: [VideoPresets.h1080, VideoPresets.h720],
          screenShareSimulcastLayers: [VideoPresets.h1080, VideoPresets.h720],
        },
        adaptiveStream: { pixelDensity: 'screen' },
        dynacast: true,
      }}
      video={false}
      audio={true}
      data-lk-theme="default"
      style={{ height: '100dvh' }}
    >
      {/* <VideoConference /> */}
      <CustomVideoConference />
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </LiveKitRoom>
  );
}
