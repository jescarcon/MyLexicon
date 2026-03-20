
const isDeploy = import.meta.env.VITE_DEPLOY === 'true';

export const ENV = {
    API_URL: isDeploy 
        ? import.meta.env.VITE_API_URL_DEPLOY 
        : import.meta.env.VITE_API_URL_LOCAL,
    IS_DEPLOY: isDeploy
};