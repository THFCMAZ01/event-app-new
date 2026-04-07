const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in the environment variables!');
}

// Optional JWT Middleware that allows unauthenticated access to specified routes
export const jwtMiddleware = (req, res, next) => {
  const exemptRoutes = ['/signup', '/login'];
  
  if (exemptRoutes.includes(req.path)) {
    return next();  // Skip JWT check for these routes
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token missing or malformed' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;  // Attach user to request object
    next();  // Proceed
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};