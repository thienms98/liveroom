// import { NextRequest, NextResponse } from "next/server";
// import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
// import { User } from "@/app/page";


// export async function POST(req:NextRequest){
//   const {room, users}: {room:string, users: User[]} = await req.json();

//   if (!room) {
//     return NextResponse.json(
//       { error: 'Missing "room" query parameter' },
//       { status: 400 }
//     );
//   } else if (!users || users.length === 0) {
//     return NextResponse.json(
//       { error: 'Missing "username" query parameter' },
//       { status: 400 }
//     );
//   }

//   const apiKey = process.env.LIVEKIT_API_KEY;
//   const apiSecret = process.env.LIVEKIT_API_SECRET;
//   const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

//   if (!apiKey || !apiSecret || !wsUrl) {
//     return NextResponse.json(
//       { error: "Server misconfigured" },
//       { status: 500 }
//     );
//   }
  
//   users.forEach((user) => {
//     const at = new AccessToken(apiKey, apiSecret, { identity: user.username });
//     at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
//     const liveRoom = new RoomServiceClient('http://localhost:3000', apiKey, apiSecret);
//     liveRoom
//   })
  

//   return NextResponse.json({ token: at.toJwt() });
// }