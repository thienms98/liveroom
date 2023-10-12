import { Room, RoomServiceClient, TokenVerifier } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const host = process.env.NEXT_PUBLIC_LIVEKIT_URL;

export async function GET(req:NextRequest){
  if(!host) return NextResponse.json({message: 'misconfig'})
  const room = req.nextUrl.searchParams.get('room');
  const identity = req.nextUrl.searchParams.get('username');
  
  if(!room || !identity) return NextResponse.json({message: 'room or username is required'}, {status: 500})

  const roomService = new RoomServiceClient(host, apiKey, apiSecret);
  const user = await roomService.getParticipant(room, identity)
  console.log(user)
  return NextResponse.json({},{status: 200})
}

export async function PUT(req:NextRequest){
  if(!host || !apiKey || !apiSecret) return NextResponse.json({message: 'misconfig'})

  const {data: {room, identity, permission}} = await req.json();
  
  const verifier = new TokenVerifier(apiKey, apiSecret)
  const token = req.headers.get('Cookie')?.slice(6);

  if(!token) return NextResponse.json({},{status: 401})
  const data = verifier.verify(token) as {sub:string}

  if(data.sub.includes('admin')){
    const roomService = new RoomServiceClient(host, apiKey, apiSecret);
    await roomService.updateParticipant(room, identity, undefined, permission)
    return NextResponse.json({success: true})
  }
  else return NextResponse.json({message: 'yuuu don\'t have permission'})
}

export async function DELETE(req:NextRequest){
  if(!host || !apiKey || !apiSecret) return NextResponse.json({message: 'misconfig'})
  
  const {room, identity} = await req.json();
  const verifier = new TokenVerifier(apiKey, apiSecret)
  const token = req.headers.get('Cookie')?.slice(6);

  if(!token) return NextResponse.json({},{status: 401})
  const data = verifier.verify(token) as {sub:string}

  if(data.sub.includes('admin')){
    const roomService = new RoomServiceClient(host, apiKey, apiSecret);
    await roomService.removeParticipant(room, identity)
    return NextResponse.json({success: true})
  }
  else return NextResponse.json({message: 'yuuu don\'t have permission'})
}