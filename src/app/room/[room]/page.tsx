'use client';

import { useParams } from 'next/navigation';
import '@livekit/components-styles';
import { LiveKitRoom, GridLayout, ParticipantTile, useTracks, RoomAudioRenderer, ControlBar, useParticipants, VideoConference, ConnectionStateToast, VideoTrack, ParticipantName } from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { Track, Room, VideoPresets } from 'livekit-client';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';

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
      <MyVideoConference />
      {/* <VideoConference /> */}
      <RoomAudioRenderer />
      <ControlBar controls={{ screenShare: true }} />
      <ConnectionStateToast />
      {/* <VideoConference chatMessageFormatter={formatChatMessageLinks} /> */}
    </LiveKitRoom>
  );
}

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const participants = useParticipants();
  const { room } = useParams();
  const [chosenOne, setChosenOne] = useState<TrackReferenceOrPlaceholder[] | null>([]); //participant choice

  console.log(chosenOne);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const removeParticipant = (identity: string) => {
    fetch('/api/participants', {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        room,
        identity,
      }),
    });
  };

  return (
    <div className="grid grid-cols-[auto_150px]">
      <GridLayout tracks={chosenOne && chosenOne?.[0]?.participant && chosenOne?.[0]?.publication ? chosenOne : tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
        <ParticipantTile
          onParticipantClick={(e) => {
            if (chosenOne) {
              setChosenOne(null);
            } else
              setChosenOne([
                {
                  participant: e.participant,
                  publication: e.track || undefined,
                  source: Track.Source.Camera,
                },
              ]);
          }}
        />
      </GridLayout>
      <div className="rounded-lg bg-[#1e1e1e] max-h-[calc(100vh_-_16px_-_var(--lk-control-bar-height))] overflow-y-auto px-4 py-2 m-2 ml-0 flex flex-col gap-2">
        {participants.map(({ sid, identity, metadata }) => (
          <div
            key={sid}
            onContextMenu={(e) => {
              e.preventDefault();
              removeParticipant(identity);
            }}
            className="flex flex-row gap-2 items-center cursor-pointer box-border"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden inline-block bg-[#2e2e2e]" style={{ backgroundImage: `url(${metadata})` }}></div>
            <span>{identity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
