import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("mobile navigation styles", () => {
  it("does not hide the sidebar section links at the tablet breakpoint", () => {
    const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
    const mobileRules = css.split("@media(max-width:800px)")[1]?.split("@media(max-width:520px)")[0] ?? "";
    expect(mobileRules).not.toMatch(/\.sidebar\s+\.nav-item\s*,[^}]*display:none/);
    expect(mobileRules).toContain(".sidebar .nav-item{display:inline-flex;min-height:44px");
    expect(mobileRules).toContain(".sidebar .nav-item:focus-visible");
  });
});
