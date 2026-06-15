const AUTH_BACKEND_URL = 'http://localhost:8080';

// Include credentials only when frontend and backend are on different origins
const CREDENTIALS_INCLUDE = location.origin !== AUTH_BACKEND_URL;
