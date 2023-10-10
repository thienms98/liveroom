import { Room, RoomServiceClient } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
const host = 'wss://liveroom-d65fdh81.livekit.cloud'

export async function DELETE(req:NextRequest){
  const {room, identity} = await req.json();
  const roomService = new RoomServiceClient(host, apiKey, apiSecret);
  await roomService.removeParticipant(room, identity)
  return NextResponse.json({success: true})
}