function _addWebGPUTrialToken(tokenContents) {
    const tokenElement = document.createElement('meta');
    tokenElement.httpEquiv = 'origin-trial';
    tokenElement.content = tokenContents;
    document.head.appendChild(tokenElement);
}
// local http server should start on port 3080
// http://localhost:3000
const TRAIL_TOKEN_3000 = 'Aotk4lKyJjKvozg4JQVI4jGolGC06ZvTfZvwadeZiFeSA0v7WAcM4B5aheEG632PcQTxLQDazEEFfF1k5Sr7agIAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjkxNzExOTk5fQ=='

// local http server should start on port 3080
// http://localhost:3080
const TRAIL_TOKEN_3080 = 'An8Qon9qqncU28/69nyiLr1Go9BSfDQqtLZ85R5WNOvKfsVT3qMZjVGJAjSEe1JxrS8tN46ngmOl/8QWXYTzmgQAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwODAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjkxNzExOTk5fQ=='

// local http server should start on port 8080
const TRAIL_TOKEN_8080 = 'AvMV7+QuKgPxuDvjlFx3+twwSmQTXtOiBWJxkIz/C0SdqdDbaYdk6fYULy2nZgs6uu0+ymOmQnAoJDI5JKFfNAoAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjgwODAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjkxNzExOTk5fQ=='

export default function addWebGPUTrialToken() {
    // _addWebGPUTrialToken(TRAIL_TOKEN_3000)
    _addWebGPUTrialToken(TRAIL_TOKEN_3080)
    // _addWebGPUTrialToken(TRAIL_TOKEN_8080)
}