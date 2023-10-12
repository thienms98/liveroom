import {
  FocusToggle,
  useFocusToggle,
  GridLayout,
  ParticipantTile,
  useLocalParticipant,
  useParticipants,
  useTracks,
  useCreateLayoutContext,
  LayoutContextProvider,
  Chat,
  FocusLayoutContainer,
  CarouselLayout,
  FocusLayout,
  usePinnedTracks,
  RoomAudioRenderer,
  ConnectionStateToast,
  ControlBar,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import type {
  MessageDecoder,
  MessageEncoder,
  TrackReferenceOrPlaceholder,
  WidgetState,
} from '@livekit/components-core';
import { isEqualTrackRef } from '@livekit/components-core';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState, useCallback } from 'react';
import Lobby from './Lobby';
import Subscribers from './Subscribers';
import axios from 'axios';
import { ImSpinner2 } from 'react-icons/im';
import CustomControlBar from './CustomControlBar';

function CustomVideoConference() {
  const router = useRouter();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const { room } = useParams();
  const [showParticipants, setShowParticipants] = useState<boolean>(false);
  const [widgetState, setWidgetState] = useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
  });

  const widgetUpdate = useCallback((state: WidgetState) => {
    setWidgetState(state);
    setShowParticipants(false);
  }, []);
  const toggleParticipants = useCallback(() => {
    setWidgetState((prev) => ({ ...prev, showChat: false }));
    setShowParticipants((prev) => !prev);
  }, []);
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  const layoutContext = useCreateLayoutContext();
  const focusTrack = usePinnedTracks(layoutContext)?.[0];

  const removeParticipant = (identity: string) => {
    axios.delete('/api/participants', {
      data: {
        room,
        identity,
      },
    });
  };

  const updateParticipantPermision = (identity: string, permission: {}) => {
    axios.put('/api/participants', {
      data: {
        room,
        identity,
        permission,
      },
    });
  };

  const subscribedTracks = useMemo(
    () => tracks.filter((track) => track.participant.permissions?.canSubscribe),
    [tracks],
  );
  const carouselTracks = useMemo(
    () => subscribedTracks.filter((track) => !isEqualTrackRef(track, focusTrack)),
    [subscribedTracks, focusTrack],
  );

  return (
    <LayoutContextProvider value={layoutContext} onWidgetChange={widgetUpdate}>
      <div className="lk-video-conference">
        {localParticipant.permissions?.canSubscribe ? (
          <LayoutContextProvider
            value={layoutContext}
            // onPinChange={handleFocusStateChange}
            onWidgetChange={widgetUpdate}
          >
            <div className="lk-video-conference-inner">
              {!focusTrack || subscribedTracks.length === 1 ? (
                <div className="lk-grid-layout-wrapper">
                  <GridLayout tracks={subscribedTracks}>
                    <ParticipantTile />
                  </GridLayout>
                </div>
              ) : (
                <div className="lk-focus-layout-wrapper">
                  <FocusLayoutContainer>
                    <CarouselLayout tracks={carouselTracks}>
                      <ParticipantTile />
                    </CarouselLayout>
                    {focusTrack && <FocusLayout trackRef={focusTrack} />}
                  </FocusLayoutContainer>
                </div>
              )}
              <CustomControlBar>
                <div className="lk-button" onClick={() => toggleParticipants()}>
                  Participants
                </div>
                <ControlBar controls={{ chat: true }} />
              </CustomControlBar>
            </div>
            {widgetState.showChat && (
              <Chat
                style={{ margin: '8px', borderRadius: '8px' }}
                // messageFormatter={chatMessageFormatter}
                // messageEncoder={chatMessageEncoder}
                // messageDecoder={chatMessageDecoder}
              />
            )}
            {showParticipants && (
              <div className="lk-chat m-2 p-2 ml-0 bg-[#1e1e1e] rounded-lg">
                <Lobby
                  participants={participants}
                  removeParticipant={removeParticipant}
                  updateParticipantPermision={updateParticipantPermision}
                />
                <Subscribers
                  participants={participants}
                  removeParticipant={removeParticipant}
                  updateParticipantPermision={updateParticipantPermision}
                />
              </div>
            )}
          </LayoutContextProvider>
        ) : (
          <h1>
            Wait to enter the room
            <ImSpinner2 className="animate-spin inline" />
          </h1>
        )}
        <RoomAudioRenderer />
        <ConnectionStateToast />
      </div>
    </LayoutContextProvider>
  );
}

export default CustomVideoConference;
