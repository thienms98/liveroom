import { useMemo, useState } from 'react';
import { Participant } from 'livekit-client';
import { FiUserPlus } from 'react-icons/fi';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { HiOutlineXCircle } from 'react-icons/hi';

const Lobby = ({
  participants,
  removeParticipant,
  updateParticipantPermision,
}: {
  participants: Participant[];
  removeParticipant: (identity: string) => void;
  updateParticipantPermision: (identity: string, permission: {}) => void;
}) => {
  const unSubscribers = useMemo(
    () => participants.filter((participant) => !participant.permissions?.canSubscribe),
    [participants],
  );
  const [popup, setPopup] = useState<boolean>(false);
  // console.log(popup);

  return (
    <button className="border border-black rounded-lg px-3 py-1 bg-[#3e3e3e] z-50 relative self-end group">
      <div className="relative">
        <FiUserPlus onClick={() => setPopup((prev) => !prev)} />
        {unSubscribers.length > 0 && (
          <span
            className="animate-[ping_.5s_ease-in_backwards] absolute top-[-8px] right-[-8px] text-xs p-[1px] rounded-full bg-red-300 text-white block w-4 h-4"
            key={unSubscribers.length}
          >
            {unSubscribers.length}
          </span>
        )}
      </div>
      {popup && (
        <div className="hidden group-focus-within:block absolute top-7 right-0 bg-[#3e3e3e] border border-black rounded-lg p-3 min-w-[200px]">
          {unSubscribers.length > 0 ? (
            unSubscribers.map(({ sid, identity, permissions }) => (
              <div key={sid} className="grid grid-cols-[150px_50px]">
                <span>{identity}</span>
                <div className="flex flex-row gap-2 items-center">
                  <AiOutlineCheckCircle
                    className="text-green-400 cursor-pointer"
                    onClick={() => {
                      updateParticipantPermision(identity, {
                        canSubscribe: true,
                        canPublish: true,
                        canPublishData: true,
                      });
                    }}
                  />
                  <HiOutlineXCircle
                    className="text-red-400 cursor-pointer"
                    onClick={() => removeParticipant(identity)}
                  />
                </div>
              </div>
            ))
          ) : (
            <div>empty</div>
          )}
        </div>
      )}
    </button>
  );
};

export default Lobby;
