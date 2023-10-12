import { AccessToken, TrackSource } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import {cookies} from 'next/headers'

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username");
  if (!room) {
    return NextResponse.json(
      { error: 'Missing "room" query parameter' },
      { status: 400 }
    );
  } else if (!username) {
    return NextResponse.json(
      { error: 'Missing "username" query parameter' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const at = new AccessToken(apiKey, apiSecret, { identity: username });
  cookies().set('token', at.toJwt())
  const isAllowed = username.includes('dev')
  at.addGrant({ 
    room,  // room name
    roomJoin: true,  // allow to join room
    canSubscribe: isAllowed,  // allow to subcribe to other track's resouces
    canPublish: isAllowed,  // resouces allowed to publish
    canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO], // resouces can be published
    roomAdmin: isAllowed,
    roomCreate: isAllowed,
    ingressAdmin: isAllowed
  });

  return NextResponse.json({ token: at.toJwt() });
}