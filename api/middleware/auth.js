const { validateSession } = require('../session');

async function requireAuth(req, res, next) {
  const token = req.cookies?.kidcanvas_session;

  if (!token) {
    return res.status(401).json({ error: 'NOT_AUTHENTICATED' });
  }

  const user = await validateSession(token);

  if (!user) {
    res.clearCookie('kidcanvas_session');
    return res.status(401).json({ error: 'SESSION_EXPIRED' });
  }

  req.user = user;
  next();
}

module.exports = { requireAuth };
