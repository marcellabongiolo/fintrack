// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  CartesianGrid: () => null,
  Legend: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("crypto", { randomUUID: () => "new-test-transaction" });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("FinTrack dashboard interactions", () => {
  it("keeps the dashboard usable if localStorage writes are blocked", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    try {
      render(<App />);
      expect(screen.getByRole("heading", { name: /Good morning, Jordan/ })).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Add transaction" }));
      expect(screen.getByRole("dialog", { name: "Add transaction" })).toBeTruthy();
    } finally { setItem.mockRestore(); }
  });

  it("marks the current sidebar section without implying navigation links", () => {
    render(<App />);
    expect(document.querySelector('[aria-current="page"]')?.textContent).toContain("Overview");
    expect(screen.queryByRole("link", { name: "Transactions" })).toBeNull();
  });

  it("opens a named dialog, focuses its first field and closes with Escape", () => {
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Add transaction" });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Add transaction" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect((screen.getByPlaceholderText("e.g. Grocery shopping") as HTMLInputElement)).toBe(document.activeElement);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps keyboard focus inside the transaction dialog", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add transaction" }));
    const first = screen.getByPlaceholderText("e.g. Grocery shopping");
    const save = screen.getByRole("button", { name: "Save transaction" });
    save.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(save);
  });

  it("filters transactions and reports an accessible empty state", () => {
    render(<App />);
    const search = screen.getByRole("textbox", { name: "Search transactions" });
    fireEvent.change(search, { target: { value: "not-a-real-transaction-12345" } });
    expect(screen.getByText("No transactions match your search.")).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Filter transactions" })).toBeTruthy();
  });

  it("adds a transaction through the accessible form", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add transaction" }));
    fireEvent.change(screen.getByPlaceholderText("e.g. Grocery shopping"), { target: { value: "Portfolio test expense" } });
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "25" } });
    fireEvent.click(screen.getByRole("button", { name: "Save transaction" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByText("Portfolio test expense")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Transaction added successfully.");
  });
});
