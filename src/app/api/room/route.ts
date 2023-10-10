import { NextRequest, NextResponse } from "next/server";
import { AccessToken, Room, RoomServiceClient } from "livekit-server-sdk";


const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
const livekitHost = 'wss://liveroom-d65fdh81.livekit.cloud'

const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

export async function GET(){
    const rooms:Room[] = await roomService.listRooms()
    let result = []
    for(const room of rooms){
      const participants = await roomService.listParticipants(room.name);
      result.push({roomName: room.name, room, participants})
    }
    console.log('rooms ', {...result})
    return NextResponse.json(result);
  // }
  // catch(err){
  //   console.error(err);
  //   return NextResponse.json({},{status: 500})
  // }
  // return NextResponse.json([])
}

export async function POST(req: NextRequest){
  const {room: roomName} = await req.json()
  const opts = {
    name: roomName,
    emptyTimeout: 3 * 60, // 3 minutes
    maxParticipants: 20,
  };
  
  const room = await roomService.createRoom(opts)
  if(!room) return NextResponse.json({},{status: 500})
  console.log('room created', room);
  return NextResponse.json({success: true, room}, {status: 200})
}

export function PUT(req:NextRequest){
  // const 
}

export async function DELETE(req:NextRequest){
  const {room } = await req.json();
  await roomService.deleteRoom(room)
  console.log('room deleted');
  return NextResponse.json({success: true})
}