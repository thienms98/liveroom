'use client';

import { useParams, useSearchParams } from 'next/navigation';
import '@livekit/components-styles';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  useTracks,
  RoomAudioRenderer,
  ControlBar,
  VideoConference,
  StartAudio,
  TrackLoop,
  TrackRefContext,
  VideoTrack,
  useTrack,
  CarouselLayout,
  formatChatMessageLinks,
} from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { Track, Room, VideoPresets } from 'livekit-client';
import { User } from '@/app/page';
import { useMainContext } from '@/components/Context';

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
        // videoCaptureDefaults: {
        //   deviceId: userChoices.videoDeviceId ?? undefined,
        //   resolution: hq === 'true' ? VideoPresets.h2160 : VideoPresets.h720,
        // },
        // audioCaptureDefaults: {
        //   deviceId: userChoices.audioDeviceId ?? undefined,
        // },
        publishDefaults: {
          red: false,
          dtx: false,
          videoSimulcastLayers: [VideoPresets.h1080, VideoPresets.h720],
        },
        adaptiveStream: { pixelDensity: 'screen' },
        dynacast: true,
      }}
      video={true}
      audio={true}
      data-lk-theme="default"
      style={{ height: '100dvh' }}
    >
      <MyVideoConference />
      <RoomAudioRenderer />
      <ControlBar />
      {/* <VideoConference chatMessageFormatter={formatChatMessageLinks} /> */}
    </LiveKitRoom>
  );
}

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      <ParticipantTile></ParticipantTile>
    </GridLayout>
  );
}
