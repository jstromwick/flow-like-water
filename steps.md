# Streaming Audio Playground

A small Node/Express + React app for experimenting with sending audio from a server to a browser and observing how buffering, playback, and interruptions behave.

## 1. Define the first experiment

Start with the simplest useful path:

- The server exposes an audio stream endpoint.
- The browser starts and stops playback with buttons.
- The server sends a known audio file in chunks with a small delay between chunks.
- The browser displays connection, buffering, and playback state.
- We can change chunk size and delay to make buffering behavior visible.

This first version will use an MP4 container with AAC audio. It has broad support in current desktop Chrome, Firefox, and Safari, and it works with the native `<audio>` element without introducing segment management yet. The test file should be prepared with the metadata near the beginning so progressive playback can start before the entire file arrives.

## 2. Choose the project shape

Use one repository with two small applications:

```text
server/       Express API and streaming logic
client/       React browser application
public-audio/ Local test audio files
steps.md      This plan
```

Decisions for the initial project:

- Node.js with TypeScript.
- Express for the HTTP server.
- Vite for the React client.
- A root script or concurrently-style tool to run both applications together.
- No database or authentication for the first experiment.

Use TypeScript in both applications so stream lifecycles, configuration, and browser event state are explicit while the project is still small. Keep the runtime dependencies minimal; add media tooling only when an experiment requires it.

Keep the server and client loosely coupled so the same React client can later connect to a different streaming implementation.

## 3. Build the server

### 3.1 Basic server setup

- Initialize the Node project under `server/`.
- Add Express and a development runner.
- Add a health endpoint such as `GET /health`.
- Configure CORS for the local React development origin.
- Serve the client build later, but keep development mode split between Vite and Express.

### 3.2 Add a test audio source

- Add one short, legally usable local audio file under `public-audio/`.
- Record its MIME type and codec in the server configuration.
- Keep the first file short enough that experiments are quick to repeat.

### 3.3 Implement the stream endpoint

Create an endpoint such as:

```text
GET /api/audio/stream
```

The endpoint should:

- Set the correct `Content-Type`.
- Set `Cache-Control: no-store` while experimenting.
- Stream bytes without loading the whole file into memory.
- Respect client disconnects and stop reading when the response closes.
- Optionally delay each chunk so network behavior is reproducible.
- Expose chunk size and delay through development-only query parameters, for example:
  - `chunkBytes`
  - `delayMs`

The first implementation will use:

1. **Progressive file streaming**: easiest to understand; send a file progressively and let the browser buffer it.
2. **MediaSource streaming**: more explicit control over appending segments and buffering; requires correctly segmented media.
3. **Raw PCM over a custom transport**: useful for low-level audio experiments, but requires decoding, scheduling, and likely an `AudioWorklet`.

Implement progressive file streaming first. Add `MediaSource` as the next experiment when explicit buffering and segment control are useful. Leave raw PCM for a separate experiment rather than mixing it into the first milestone.

## 4. Build the React client

Create a small control surface with:

- Start and stop buttons.
- An audio player or Web Audio playback path.
- Current connection state: idle, connecting, streaming, ended, or error.
- Current playback state: paused, playing, buffering, or stopped.
- Buffer and timing information where the browser exposes it.
- Inputs for chunk size and artificial server delay.
- A scrolling event log for useful events and errors.

For the first version, test the simplest browser path:

```text
<audio controls src="http://localhost:PORT/api/audio/stream" />
```

Use the native `<audio>` element for the first client because it keeps the browser responsible for decoding and buffering. Move to `MediaSource` only for the later segmented-media experiment, where explicit append and buffer management are the point of the exercise. Keep playback cleanup explicit so stopping one stream does not leave an old source or event listener active.

## 5. Connect the applications

- Configure the client API base URL through an environment variable.
- Make the stream URL easy to change without editing components.
- Add a root development command that starts Express and Vite together.
- Document the expected local ports.
- Add a production build path where Express serves the built React files.

## 6. Verify the first milestone

Manual checks:

- The health endpoint responds successfully.
- The React page loads without console errors.
- Start begins playback.
- Stop ends playback and releases the connection.
- Refreshing the page does not leave a server-side stream running.
- A slow artificial delay produces visible buffering or a predictable stall.
- Changing chunk size changes request behavior without crashing the client.
- Closing the browser stops the server-side file read.
- The app reports malformed media or unsupported codec errors clearly.

Use browser DevTools to inspect:

- The streaming request and response headers.
- Transfer timing and whether the response remains open.
- Media events such as `loadstart`, `canplay`, `waiting`, `playing`, `stalled`, and `ended`.
- Console errors from codec or `MediaSource` support.

## 7. Add focused experiments

After the basic path works, add one experiment at a time:

### Experiment A: buffering controls

Compare different chunk sizes and delays. Record how long playback takes to begin and when `waiting` events occur.

### Experiment B: pause and resume

Determine whether pausing only pauses playback or also changes server delivery. Check whether the browser continues buffering while paused.

### Experiment C: reconnect behavior

Stop the server or interrupt the connection, then add a retry control. Decide whether retrying starts over or resumes from a known position.

### Experiment D: live segment generation

Replace the local file with a process that produces short media segments. Investigate segment boundaries, initialization segments, queueing, and timestamp continuity.

### Experiment E: raw PCM and Web Audio

Use a separate endpoint and client path for raw PCM. Define the sample rate, channel count, sample format, framing, and transport. Use an `AudioWorklet` for scheduling rather than trying to play arbitrary chunks directly through an `<audio>` element.

## 8. Reliability and cleanup

Before treating the playground as a reusable example:

- Validate query parameters and cap development-only values.
- Avoid logging audio contents or unbounded event data.
- Handle backpressure and response errors.
- Clean up file handles, timers, streams, event listeners, and `MediaSource` objects.
- Add a small server test for the health endpoint and stream headers.
- Add a browser smoke test for starting and stopping playback if the project gains Playwright.
- Add a short README later with setup and run commands once the structure settles.

## 9. Suggested implementation order

1. Create the root project structure and development scripts.
2. Add the Express health endpoint.
3. Add one local audio file and a basic stream endpoint.
4. Verify the stream directly in a browser before building controls.
5. Scaffold the React page and connect an `<audio>` element.
6. Add state reporting and the event log.
7. Add configurable chunk size and delay.
8. Test disconnects, buffering, and cleanup.
9. Add a `MediaSource` path as the next focused experiment.
10. Add one focused advanced experiment at a time.

## Resolved decisions

- **Language:** TypeScript for both server and client.
- **Browser matrix:** Current desktop Chrome, Firefox, and Safari. Mobile browsers can be added after the desktop flow is stable.
- **Initial media format:** MP4 with AAC audio, using a short test file prepared for progressive playback.
- **Initial server source:** A static local file streamed by Express. `ffmpeg` and upstream live sources are follow-up experiments, not prerequisites.
- **Initial priority:** Implementation simplicity and observability over low latency. We will measure latency later rather than optimize for it prematurely.
- **Initial browser API:** A native `<audio>` element. `MediaSource` comes next when the goal is explicit segment and buffer control; raw PCM with `AudioWorklet` remains a separate low-level experiment.
