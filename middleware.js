export const config = {
  matcher: ['/(.*)'], // Protect all routes
};

export default function middleware(request) {

  const authHeader = request.headers.get('authorization');

  const USER = process.env.BASIC_AUTH_USER || 'user';
  const PASS = process.env.BASIC_AUTH_PASS || '42';

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic') {
      const [user, pass] = atob(encoded).split(':');
      if (user === USER && pass === PASS) {
        return new Response(null, { status: 200 }); // Allow access
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
