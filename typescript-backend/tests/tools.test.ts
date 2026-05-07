import { describe, expect, it } from "vitest";
import { createInitialContext } from "../src/airline/types.js";
import { bookNewFlight, getMatchingFlights, getTripDetails } from "../src/airline/tools.js";

describe("airline tools", () => {
  it("hydrates disrupted itinerary from message context", async () => {
    const context = createInitialContext();

    const result = await (getTripDetails as any).invoke(
      { context },
      JSON.stringify({ message: "I am flying Paris to Austin via New York and my first leg is delayed." })
    );

    expect(result).toContain("Hydrated disrupted itinerary");
    expect(context.scenario).toBe("disrupted");
    expect(context.flight_number).toBe("PA441");
    expect(context.confirmation_number).toBe("IR-D204");
  });

  it("returns matching disrupted options and notes overnight support", async () => {
    const context = createInitialContext();
    context.scenario = "disrupted";
    context.flight_number = "PA441";

    const result = await (getMatchingFlights as any).invoke(
      { context },
      JSON.stringify({})
    );

    expect(result).toContain("Matching flights:");
    expect(result).toContain("NY950");
    expect(result).toContain("NY982");
    expect(result).toContain("Overnight hotel and meals are covered.");
  });

  it("rebooks to first disrupted option and updates itinerary context", async () => {
    const context = createInitialContext();
    context.scenario = "disrupted";
    context.flight_number = "PA441";

    const result = await (bookNewFlight as any).invoke(
      { context },
      JSON.stringify({})
    );

    expect(result).toContain("Rebooked to NY950");
    expect(context.flight_number).toBe("NY950");
    expect(context.confirmation_number).toBeTruthy();
    expect(context.seat_number).toBe("2A (front row)");
    expect(context.itinerary?.some((seg) => seg.flight_number === "NY950")).toBe(true);
  });
});
