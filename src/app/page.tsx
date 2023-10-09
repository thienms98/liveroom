'use client';

import { useMainContext } from '@/components/Context';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
export interface Room {
  roomname: string;
  position: {
    top: number;
    left: number;
    zIndex: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const { users, updateUsers } = useMainContext();
  const [userSelect, setUserSelect] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  console.log(rooms);

  useEffect(() => {
    setUserName(localStorage.getItem('username') || '');
    fetch('http://localhost:3000/api/room')
      .then((res) => res.json())
      .then((data) => setRooms(data || []));
  }, []);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  }, [rooms]);

  const createRoom = async (value: string) => {
    await fetch('http://localhost:3000/api/room', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        room: value,
      }),
    });
    setRooms((prev) => {
      return [
        ...prev,
        {
          roomname: text || 'room' + prev.length,
          position: {
            top: Math.floor(Math.random() * 200),
            left: Math.floor(Math.random() * 500),
            zIndex: 1,
          },
          size: {
            width: 400,
            height: 250,
          },
          users: [],
        },
      ];
    });
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
          {rooms.map((room, index) => (
            <div
              key={room.roomname}
              className="border border-black bg-[#2e2e2e] rounded-lg transition-all flex flex-col"
              style={{
                // ...room.position,
                ...room.size,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!userSelect) {
                  router.push('/room/' + room.roomname);
                  return;
                }
                const pos = users.findIndex((user) => user.username === userSelect);
                if (pos === -1) return;
                const arr = [...users];
                arr[pos].room = room.roomname;
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
              <span>{room.roomname}</span>
              <div className="relative">
                {users
                  .filter((user) => user.room && user.room === room.roomname)
                  .map(({ username, image }, index) => (
                    <div
                      className={`absolute w-12 h-12 rounded-full overflow-hidden object-contain cursor-pointer top-4 ${
                        username === userSelect ? 'border-2 border-blue-500' : ''
                      }`}
                      style={{ backgroundImage: `url(${image})`, left: 16 + 24 * index }}
                      key={index}
                      title={username}
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserSelect(username === userSelect ? '' : username);
                      }}
                    ></div>
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
                  ></div>
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
