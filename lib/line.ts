// syncra-app/lib/line.ts

export const LINE_OAUTH_URL = "https://access.line.me/oauth2/v2.1/authorize";
export const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
export const LINE_PROFILE_URL = "https://api.line.me/v2/profile";
export const LINE_MESSAGING_URL = "https://api.line.me/v2/bot/message/push";

// 1. Exchange Auth Code for User Access Token
export async function getLineToken(code: string, redirectUri: string, channelId: string, channelSecret: string) {
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);
  params.append('client_id', channelId);
  params.append('client_secret', channelSecret);

  const res = await fetch(LINE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  return await res.json();
}

// 2. Get User Profile (Name, UserId, Picture)
export async function getLineProfile(accessToken: string) {
  const res = await fetch(LINE_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return await res.json();
}

// 3. Send Push Message (The "Thank You" DM)
export async function sendLineMessage(botAccessToken: string, userId: string, text: string) {
  const res = await fetch(LINE_MESSAGING_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${botAccessToken}`
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: 'text', text: text }]
    })
  });
  return res.ok;
}