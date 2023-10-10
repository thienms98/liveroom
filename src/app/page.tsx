'use client';

import { useMainContext } from '@/components/Context';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Room, ParticipantInfo } from 'livekit-server-sdk';
import { AiOutlineEdit, AiOutlineCheckCircle } from 'react-icons/ai';

export interface User {
  username: string;
  image: string;
  position?: {
    top: number;
    left: number;
    zIndex: number;
  };
  room: string;
}

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [rooms, setRooms] = useState<{ roomName: string; room: Room; participants: ParticipantInfo[] }[]>([]);
  const [userSelect, setUserSelect] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>('');
  const [edit, setEdit] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserName(localStorage.getItem('username') || '');
    getRooms();
  }, []);

  useEffect(() => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  }, [rooms]);

  const getRooms = async () => {
    const res = await fetch('/api/room');
    const data = await res.json();
    setRooms(data || []);
  };

  async function fetchCreate<T>(value: string): Promise<T> {
    const newRoom = await fetch('/api/room', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        room: value,
      }),
    });
    const data = await newRoom.json();
    return data.room;
  }
  const createRoom = async (value: string) => {
    const newRoom = await fetchCreate<Room>(value);
    setRooms((prev) => [
      ...prev,
      {
        roomName: newRoom.name,
        room: newRoom,
        participants: [],
      },
    ]);
  };

  const removeParticipant = async (room: string, identity: string) => {
    await fetch('/api/participants', {
      method: 'delete',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        room,
        identity,
      }),
    });
    await getRooms();
  };

  return (
    <main className="flex flex-col bg-[#111] min-h-screen">
      <div className="h-24 flex flex-row p-6 gap-3">
        <div className="h-full px-4 py-1 rounded-md border border-black bg-white text-black text-lg cursor-pointer hover:bg-white/95 " onClick={() => setOpen(true)}>
          Create room
        </div>
        <form
          className="h-full ml-auto flex flex-row items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            localStorage.setItem('username', userName);
            setEdit(false);
          }}
        >
          {edit ? (
            <>
              <input value={userName} onChange={(e) => setUserName(e.target.value)} className="border border-white bg-transparent px-2" autoFocus />
              <AiOutlineCheckCircle
                onClick={() => {
                  localStorage.setItem('username', userName);
                  setEdit(false);
                }}
              />
            </>
          ) : (
            <>
              <span>{userName}</span>
              <AiOutlineEdit className="cursor-pointer" onClick={() => setEdit(true)} />
            </>
          )}
        </form>
      </div>
      <div
        className="flex-1 bg-[#1e1e1e] rounded-lg m-3 overflow-auto relative flex flex-col gap-4 p-4"
        ref={containerRef}
        onClick={async () => {
          if (!userSelect) return;
          const room = rooms.find((room) => room.participants.find((user) => user.identity === userSelect));
          if (!room) return;
          await removeParticipant(room.roomName, userSelect);
          setUserSelect('');
        }}
      >
        <div className="flex flex-row flex-wrap gap-4">
          {rooms.map(({ roomName, room, participants }, index) => (
            <div
              key={roomName}
              className="border border-black bg-[#2e2e2e] rounded-lg transition-all flex flex-col p-3 w-full md:w-[50%] xl:w-[25%] h-[250px] cursor-pointer"
              onContextMenu={async (e) => {
                e.preventDefault();
                await fetch('/api/room', {
                  method: 'delete',
                  headers: { 'content-type': 'appliction/json' },
                  body: JSON.stringify({ room: roomName }),
                });
                await getRooms();
              }}
              onClick={() => router.push('/room/' + roomName)}
            >
              <span className="bg-[#3e3e3e] text-white rounded-full border border-[#1e1e1e] px-2 self-start select-none">{roomName}</span>
              <div className="relative">
                {participants.map(({ sid, identity, metadata }, index) => (
                  <button
                    className={`absolute w-12 h-12 rounded-full overflow-hidden object-contain cursor-pointer text-center top-4 border bg-[#4e4e4e] border-[#0e0e0e] focus:border-blue-500 focus:border-2`}
                    style={{ backgroundImage: `url(${metadata})`, left: 16 + 48 * index }}
                    key={sid}
                    title={identity}
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserSelect(identity === userSelect ? '' : identity);
                    }}
                  >
                    {identity}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onAccept={() => {
          if (roomName.trim()) {
            createRoom(roomName);
            setOpen(false);
            setRoomName('');
          }
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (roomName.trim()) {
              createRoom(roomName);
              setOpen(false);
              setRoomName('');
            }
          }}
        >
          <label htmlFor="input" className="block">
            Room name
          </label>
          <input type="text" id="input" className="w-full border border-black mt-3 text-xl px-4 py-1" value={roomName} onChange={(e) => setRoomName(e.target.value)} autoFocus />
        </form>
      </Modal>
      <Modal
        open={!userName.trim() && !edit}
        onAccept={() => {
          localStorage.setItem('username', text);
          setUserName(text);
        }}
        onCancel={() => {}}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            localStorage.setItem('username', text);
            setUserName(text);
          }}
        >
          <label htmlFor="username" className="block">
            Enter your name
          </label>
          <input type="text" id="username" className="w-full border border-black mt-3 text-xl px-4 py-1" value={text} onChange={(e) => setText(e.target.value)} autoFocus />
        </form>
      </Modal>
    </main>
  );
}
