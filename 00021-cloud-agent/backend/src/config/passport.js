import passport from 'passport';
import { Strategy as GithubStrategy } from 'passport-github2';
import { env } from './env.js';

passport.use(new GithubStrategy({
  clientID: env.githubClientId,
  clientSecret: env.githubClientSecret,
  callbackURL: `${env.frontendOrigin}/api/v1/auth/github/callback`,
}, (accessToken, refreshToken, profile, done) => {
  done(null, { accessToken, profile });
}));

export { passport };
