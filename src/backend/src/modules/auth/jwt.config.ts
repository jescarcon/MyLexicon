export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET is missing'); })(),
    expiresIn: process.env.JWT_EXPIRES_IN ?? (() => { throw new Error('JWT_EXPIRES_IN is missing'); })(),
  },
});
