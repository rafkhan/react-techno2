"use client";

import _ from "lodash";
import { BufferLoader } from "./BufferLoader";

// const TICK = "TICK";
// const START_CLOCK = "START_CLOCK";
// // const SCHEDULE_TRACK = 'SCHEDULE_TRACK';
// // const REMOVE_TRACK = 'REMOVE_TRACK';
// const TOGGLE_TRACK = "TOGGLE_TRACK";

const BPM = 128;
const TIME_PER_BEAT = 60000 / BPM;

const SAMPLES = [
  "/sounds/kick.wav",
  "/sounds/claps.wav",
  "/sounds/hats.wav",
  "/sounds/bass.wav",
  "/sounds/synth.wav",
];

// type Action = {
//   type: string;
//   payload: {
//     trackNumber?: number;
//   };
// }


export class Clock {
  public audioContext: AudioContext;

  public tickTimer = 0;
  public currentTick = 0;
  public lastTick = 0;
  public nextTime = 0;
  public startTime = 0;
  public bufferList: AudioBuffer[] = [];
  public playingTracks = [2];
  private interval?: NodeJS.Timeout;
  private gainNode: GainNode;

  constructor() {
    // window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.AudioContext = window.AudioContext;
    this.audioContext = new AudioContext();
    //For Safari audioContext is disabled until there's a user click
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.05;
    this.gainNode.connect(this.audioContext.destination);
    this.tickTimer = this.audioContext.currentTime;
    
    // this.currentTime = this.audioContext.currentTime;
  }

  start() {
    this.startTime = this.audioContext.currentTime;
    this.tickTimer = this.audioContext.currentTime;

    this.interval = setInterval(() => {
      this.doTick();
    }, 8);
  }

  stop() {
    clearInterval(this.interval);
  }


  // public async clk(action: Action, currentTick: any, bufferList: any, startTime: any) {
  //   this.tickTimer = currentTick;
  //   this.bufferList = bufferList;
  //   this.startTime = startTime;

  //   switch (action.type) {
  //     case START_CLOCK:
  //       break;
  //     case TOGGLE_TRACK:
  //       return this.doTrackToggle(action.payload.trackNumber!);
  //     default:
  //       Clock.loadTracks(this.audioContext).then((bufferList) => {
  //         console.log('loaded', bufferList);
  //         this.bufferList = bufferList;
  //       });
  //   }
  // }

  doTick() {
    const currentTime = this.audioContext.currentTime;
    const currentTick = this.getTickNumber(currentTime);
    let lastTick;
    let nextTime = this.nextTime;

    // tick changed - fired once per tick
    if (currentTick > this.currentTick) {
      lastTick = this.currentTick;
      nextTime = this.getNextTime();

      this.scheduleMetronome(nextTime);

      // // TRIGGER LOOPS EVERY 4 BEATS / 1 BAR
      this.scheduleLoops(nextTime);
    } else {
      lastTick = this.lastTick;
      nextTime = this.nextTime;
    }

    this.tickTimer = currentTime;
    this.currentTick = currentTick;
    this.lastTick = lastTick;
    this.nextTime = nextTime;
  }

  scheduleLoops(nextTime: number) {
    // console.log(this);
    if (this.playingTracks.length > 0 && this.currentTick % 4 === 1) {
      this.playingTracks.forEach((trackNumber) => {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.bufferList[trackNumber];
        source.connect(this.audioContext.destination);
        source.start(nextTime);
      });
    }
  }

  public scheduleMetronome(nextTime: number) {
    const oscillator = this.audioContext.createOscillator();
    oscillator.frequency.value = 400;
    oscillator.type = "square";
    oscillator.connect(this.gainNode);
    oscillator.start(nextTime);
    oscillator.stop(nextTime + 0.075);
  }

  public getNextTime() {
    return (
      ((this.tickTimer * 1000) % ((this.currentTick + 1) * TIME_PER_BEAT)) /
        1000 +
        this.startTime
    );
  }

  public getTickNumber(ct: number) {
    const ctms = ct * 1000;
    return Math.floor(ctms / TIME_PER_BEAT);
  }

  public doTrackToggle(trackNumber: number) {
    let playingTracks;
    const trackIndex = _.indexOf(this.playingTracks, trackNumber);

    if (trackIndex > -1) {
      playingTracks = this.playingTracks;
      playingTracks.splice(trackIndex, 1);
    } else {
      playingTracks = _.uniq(_.concat(this.playingTracks, trackNumber));
    }

    this.playingTracks = playingTracks;
  }

  public startClock() {
    // return {
    //   type: START_CLOCK,
    //   payload: {
    //     currentTime: this.audioContext.currentTime,
    //     bufferList,
    //   },
    // };
    // this.currentTime = this.audioContext.currentTime;
  }

  public static async loadTracks(audioContext: AudioContext): Promise<AudioBuffer[]> {
    return new Promise((resolve) => {
      const bufferLoader = new BufferLoader(
        audioContext,
        SAMPLES,
        (buflist: AudioBuffer[] | PromiseLike<AudioBuffer[]>) => {
          resolve(buflist);
        }
      );

      bufferLoader.load();
      return bufferLoader.bufferList
    });
  }


  public startTrack(trackNumber: number) {
    this.doTrackToggle(trackNumber);
    console.log(trackNumber,  this.playingTracks);
  }
}

// export function initAudioWindow() {
//   window.AudioContext = window.AudioContext || window.webkitAudioContext;
//   const audioContext = new AudioContext();
//   //For Safari audioContext is disabled until there's a user click
//   if (audioContext.state === "suspended") {
//     audioContext.resume();
//   }

//   const gainNode = audioContext.createGain();
//   gainNode.gain.value = 0.05;
//   gainNode.connect(audioContext.destination);
//   return window.AudioContext;
// }

// export function getDefaultClockState(audioContext: any) {
//   return {
//     tickTimer: audioContext.currentTime,
//     currentTick: 0,
//     lastTick: 0,
//     nextTime: 0,
//     startTime: 0,
//     bufferList: [],
//     playingTracks: [2],
//   };
// }