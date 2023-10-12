import { Participant } from 'livekit-client';
import { FiUserMinus } from 'react-icons/fi';

type SubscribersProps = {
  participants: Participant[];
  removeParticipant: (identity: string) => void;
  updateParticipantPermision: (identity: string, permission: {}) => void;
};

const Subscribers = ({
  participants,
  updateParticipantPermision,
  removeParticipant,
}: SubscribersProps) => {
  return (
    <div className="md:flex-col md:max-h-full md:overflow-y-auto w-full overflow-x-auto flex flex-row">
      {participants
        .filter((participant) => participant.permissions?.canSubscribe)
        .map(({ sid, identity, metadata }) => (
          <div
            key={sid}
            onClick={() =>
              updateParticipantPermision(identity, { canSubscribe: true, canPublish: true })
            }
            className="group flex flex-row gap-2 items-center cursor-pointer box-border md:mb-2 mr-8 hover:mr-2"
          >
            <div
              className="w-6 h-6 rounded-full overflow-hidden inline-block bg-[#2e2e2e]"
              style={{ backgroundImage: `url(${metadata})` }}
            ></div>
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{identity}</span>
            <span
              className="group-hover:inline-flex hidden ml-auto items-center"
              onClick={(e) => {
                e.stopPropagation();
                removeParticipant(identity);
              }}
            >
              <FiUserMinus />
            </span>
          </div>
        ))}
    </div>
  );
};

export default Subscribers;
