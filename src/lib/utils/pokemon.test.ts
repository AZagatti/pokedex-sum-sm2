import { describe, expect, it } from "vitest";

import {
  capitalize,
  formatPokemonName,
  padDexNumber,
  typeColor,
} from "./pokemon";

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("bulbasaur")).toBe("Bulbasaur");
  });
});

describe("formatPokemonName", () => {
  it("joins hyphenated parts with a space and capitalizes each", () => {
    expect(formatPokemonName("mr-mime")).toBe("Mr Mime");
  });

  it("handles single-word names", () => {
    expect(formatPokemonName("pikachu")).toBe("Pikachu");
  });
});

describe("padDexNumber", () => {
  it("pads small numbers to 3 digits with a leading #", () => {
    expect(padDexNumber(1)).toBe("#001");
    expect(padDexNumber(25)).toBe("#025");
  });

  it("does not truncate numbers longer than 3 digits", () => {
    expect(padDexNumber(10_034)).toBe("#10034");
  });
});

describe("typeColor", () => {
  it("returns a css var for a known type", () => {
    expect(typeColor("fire")).toBe("var(--type-fire)");
  });

  it("falls back to normal for an unknown type", () => {
    expect(typeColor("unknown-type")).toBe("var(--type-normal)");
  });
});
