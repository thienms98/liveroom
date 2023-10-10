'use client';

import { useMainContext } from '@/components/Context';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Room, ParticipantInfo } from 'livekit-server-sdk';

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
  const { users, updateUsers } = useMainContext();
  const [userSelect, setUserSelect] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserName(localStorage.getItem('username') || '');
    fetch('/api/room')
      .then((res) => res.json())
      .then((data) => setRooms(data || []));
  }, []);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  }, [rooms]);

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

  const createUser = () => {
    updateUsers([
      ...users,
      {
        username: 'user' + users.length,
        image: 'https://picsum.photos/id/' + users.length + '/100',
        room: '',
      },
    ]);
  };

  return (
    <main className="flex flex-col bg-[#111] min-h-screen">
      <div className="h-24 flex flex-row p-6 gap-3">
        <div
          className="h-full px-4 py-1 rounded-md border border-black bg-white text-black text-lg cursor-pointer hover:bg-white/95"
          onClick={() => setOpen(true)}
        >
          Create room
        </div>
        <div
          className="h-full px-4 py-1 rounded-md border border-black bg-white text-black text-lg cursor-pointer hover:bg-white/95"
          onClick={createUser}
        >
          Create user
        </div>
        <div>{userName}</div>
      </div>
      <div
        className="flex-1 bg-[#1e1e1e] rounded-lg m-3 overflow-auto relative flex flex-col gap-4 p-4"
        ref={containerRef}
        onClick={() => {
          if (!userSelect) return;
          const pos = users.findIndex((user) => user.username === userSelect);
          if (pos === -1) return;

          const arr = [...users];
          arr[pos].room = '';
          updateUsers(arr);
          setUserSelect('');
        }}
      >
        <div className="flex flex-row flex-wrap gap-4">
          {rooms.map(({ roomName, room, participants }, index) => (
            <div
              key={roomName}
              className="border border-black bg-[#2e2e2e] rounded-lg transition-all flex flex-col"
              style={{
                // ...room.position,
                // ...room.size,
                width: 300,
                height: 250,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!userSelect) {
                  router.push('/room/' + roomName);
                  return;
                }
                const pos = users.findIndex((user) => user.username === userSelect);
                if (pos === -1) return;
                const arr = [...users];
                arr[pos].room = roomName;
                updateUsers(arr);
                setUserSelect('');
              }}
              // draggable
              // onMouseDown={(e) => {
              //   setMovingRoom(index);
              //   console.log(e);
              // }}
              // onMouseUp={(e) => setMovingRoom(-1)}
            >
              <span>{roomName}</span>
              <div className="relative">
                {participants.map(({ sid, identity, metadata }) => (
                  <div
                    className={`absolute w-12 h-12 rounded-full overflow-hidden object-contain cursor-pointer text-center top-4 ${
                      identity === userSelect ? 'border-2 border-blue-500' : ''
                    }`}
                    style={{ backgroundImage: `url(${metadata})`, left: 16 + 24 * index }}
                    key={sid}
                    title={identity}
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserSelect(identity === userSelect ? '' : identity);
                    }}
                  >
                    {identity}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-row flex-wrap ">
          {users
            .filter((user) => !user.room)
            .map(
              ({ username, image, room }, index) =>
                !room && (
                  <div
                    className={`w-12 h-12 rounded-full overflow-hidden object-contain cursor-pointer ${
                      username === userSelect ? 'border-2 border-blue-500' : ''
                    }`}
                    style={{ backgroundImage: `url(${image})` }}
                    key={index}
                    title={username}
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserSelect(username === userSelect ? '' : username);
                    }}
                  >
                    {}
                  </div>
                ),
            )}
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
          }}
        >
          <label htmlFor="input" className="block">
            Room name
          </label>
          <input
            type="text"
            id="input"
            className="w-full border border-black mt-3 text-xl px-4 py-1"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
        </form>
      </Modal>
      <Modal
        open={!userName.trim()}
        onAccept={() => {
          localStorage.setItem('username', text);
          setUserName(text);
        }}
        onCancel={() => {}}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label htmlFor="username" className="block">
            Your name
          </label>
          <input
            type="text"
            id="username"
            className="w-full border border-black mt-3 text-xl px-4 py-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </form>
      </Modal>
    </main>
  );
}
