'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import faker from '@faker-js/faker';

interface User {
  username: string;
  image: string;
  position?: {
    top: number;
    left: number;
    zIndex: number;
  };
  room: string;
}
interface Room {
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [userSelect, setUserSelect] = useState<string>('');

  const createRoom = () => {
    setRooms((prev) => {
      return [
        ...prev,
        {
          roomname: 'room' + prev.length,
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
    setUsers((prev) => [
      ...prev,
      {
        username: 'user' + prev.length,
        image: 'https://picsum.photos/id/' + prev.length + '/100',
        room: '',
      },
    ]);
  };
  console.log(userSelect);

  return (
    <main className="flex flex-col bg-[#111] min-h-screen">
      <div className="h-24 flex flex-row p-6 gap-3">
        <div
          className="h-full px-4 py-1 rounded-md border border-black bg-white text-black text-lg cursor-pointer hover:bg-white/95"
          onClick={createRoom}
        >
          Create room
        </div>
        <div
          className="h-full px-4 py-1 rounded-md border border-black bg-white text-black text-lg cursor-pointer hover:bg-white/95"
          onClick={createUser}
        >
          Create user
        </div>
      </div>
      <div
        className="flex-1 bg-[#1e1e1e] rounded-lg m-3 overflow-auto relative flex flex-row flex-wrap gap-3 p-3"
        ref={containerRef}
        onClick={() => {
          console.log('container');

          if (!userSelect) return;
          const pos = users.findIndex((user) => user.username === userSelect);
          if (pos === -1) return;
          setUsers((prev) => {
            const arr = [...prev];
            arr[pos].room = '';
            return arr;
          });
          setUserSelect('');
        }}
      >
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
              console.log(room.roomname);

              if (!userSelect) return;
              const pos = users.findIndex((user) => user.username === userSelect);
              if (pos === -1) return;
              setUsers((prev) => {
                const arr = [...prev];
                arr[pos].room = room.roomname;
                return arr;
              });
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
        <div className="flex flex-row flex-wrap gap-4">
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
    </main>
  );
}
