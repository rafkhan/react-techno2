"use client";

import { useState } from "react";
import { Clock } from "./clock";
// import { getDefaultClockState, initAudioWindow } from "./clock";

export function Main() {
  const [clock, setClock] = useState<Clock | undefined>();

  return (
    <div>
      <button
        onClick={async () => {
          const c = new Clock();
          const bufferList = await Clock.loadTracks(c.audioContext);
          c.bufferList = bufferList;
          console.log(bufferList);
          c.start();
          setClock(c);
        }}
      >
        START
      </button>
      {clock && (
        <>
          <div>
            Tick: <strong>{clock.currentTick}</strong>
          </div>
          <div>
            Bar Beat: <strong>{((clock.currentTick - 2) % 4) + 1}</strong>
          </div>
          <div>
            Current Time: <strong>{clock.tickTimer}</strong>
          </div>
          <div>
            Next Beat Time: <strong>{clock.nextTime}</strong>
          </div>
          <div>
            Next Time ahead:{" "}
            <strong>
              {clock.tickTimer < clock.nextTime ? "true" : "false"}
            </strong>
          </div>
          <div>
            Loop Schedule Queue:{" "}
            <strong>{JSON.stringify(clock.playingTracks)}</strong>
          </div>

          <button onClick={() => clock.startTrack(0)}>[DRUM KICK] </button>
          <button onClick={() => clock.startTrack(1)}>[DRUM CLAP] </button>
          <button onClick={() => clock.startTrack(2)}>[DRUM HI HAT] </button>
          <button onClick={() => clock.startTrack(3)}>[SYNTH BASS] </button>
          <button onClick={() => clock.startTrack(4)}>[SYNTH LEAD] </button>
        </>
      )}
    </div>
  );
}
