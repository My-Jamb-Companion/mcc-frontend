import {describe, expect, it} from "vitest";
import {timeFraction, timerAnnouncement, timerCue, timerMood} from "./timerCues";

describe("timerCue", () => {
  it("is silent on the first reading and when time does not go down", () => {
    expect(timerCue(null, 5, 600)).toBeNull();
    expect(timerCue(5, 5, 600)).toBeNull();
    expect(timerCue(5, 600, 600)).toBeNull();
  });

  it("ticks once a second in the last ten, sharper in the last three", () => {
    expect(timerCue(11, 10, 600)).toBe("tick");
    expect(timerCue(5, 4, 600)).toBe("tick");
    expect(timerCue(4, 3, 600)).toBe("tickLast");
    expect(timerCue(2, 1, 600)).toBe("tickLast");
  });

  it("sounds the alarm once, when the clock reaches zero", () => {
    expect(timerCue(1, 0, 600)).toBe("timeup");
    expect(timerCue(0, 0, 600)).toBeNull();
  });

  it("warns at one minute only on a countdown longer than two minutes", () => {
    expect(timerCue(61, 60, 600)).toBe("warning");
    expect(timerCue(61, 60, 120)).toBeNull();
  });

  it("is silent through the rest of the countdown", () => {
    expect(timerCue(300, 299, 600)).toBeNull();
  });

  it("still ticks if the page was throttled and jumped several seconds", () => {
    expect(timerCue(14, 9, 600)).toBe("tick");
    expect(timerCue(3, 0, 600)).toBe("timeup");
  });
});

describe("timer look and announcements", () => {
  it("shows how much is left as a fraction, kept between 0 and 1", () => {
    expect(timeFraction(150, 600)).toBe(0.25);
    expect(timeFraction(-5, 600)).toBe(0);
    expect(timeFraction(900, 600)).toBe(1);
    expect(timeFraction(5, 0)).toBe(0);
  });

  it("is calm, then in a hurry in the last quarter, then urgent in the last ten seconds", () => {
    expect(timerMood(400, 600)).toBe("calm");
    expect(timerMood(150, 600)).toBe("hurry");
    expect(timerMood(10, 600)).toBe("urgent");
    expect(timerMood(0, 600)).toBe("urgent");
  });

  it("announces only at milestones", () => {
    expect(timerAnnouncement(0, 600)).toBe("Time is up.");
    expect(timerAnnouncement(10, 600)).toBe("10 seconds left.");
    expect(timerAnnouncement(30, 600)).toBe("30 seconds left.");
    expect(timerAnnouncement(60, 600)).toBe("One minute left.");
    expect(timerAnnouncement(45, 600)).toBeNull();
    expect(timerAnnouncement(60, 100)).toBeNull();
  });
});
