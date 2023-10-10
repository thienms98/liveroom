import { NextRequest, NextResponse } from "next/server";
import { AccessToken, Room, RoomServiceClient } from "livekit-server-sdk";


const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
const livekitHost = 'wss://liveroom-d65fdh81.livekit.cloud'

export async function GET(){
  // try{
    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }
    const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

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

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }
  const opts = {
    name: roomName,
    emptyTimeout: 3 * 60, // 3 minutes
    maxParticipants: 20,
  };
  const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
  
  const room = await roomService.createRoom(opts)
  if(!room) return NextResponse.json({},{status: 500})
  console.log('room created', room);
  return NextResponse.json({success: true, room}, {status: 200})

}