// @vitest-environment jsdom
import {cleanup, render, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {TurnstileWidget} from "./TurnstileWidget";

const api = {render: vi.fn(), reset: vi.fn(), remove: vi.fn()};

beforeEach(() => {
  api.render.mockReset().mockReturnValue("widget-1");
  api.reset.mockReset();
  api.remove.mockReset();
  window.turnstile = api; // already loaded, so no script is added
});

afterEach(() => {
  cleanup();
  delete window.turnstile;
});

describe("TurnstileWidget", () => {
  it("renders nothing and never calls back without a site key", () => {
    const onToken = vi.fn();
    const {container} = render(<TurnstileWidget onToken={onToken} />);
    expect(container.firstChild).toBeNull();
    expect(api.render).not.toHaveBeenCalled();
    expect(onToken).not.toHaveBeenCalled();
  });

  it("renders the widget for the sign-up action and passes its token on", async () => {
    const onToken = vi.fn();
    render(<TurnstileWidget siteKey="site-key" onToken={onToken} />);
    await waitFor(() => expect(api.render).toHaveBeenCalledTimes(1));
    const options = api.render.mock.calls[0][1];
    expect(options).toMatchObject({sitekey: "site-key", action: "signup"});

    options.callback("fresh-token");
    expect(onToken).toHaveBeenLastCalledWith("fresh-token");
    options["expired-callback"]();
    expect(onToken).toHaveBeenLastCalledWith(null);
    options["error-callback"]();
    expect(onToken).toHaveBeenLastCalledWith(null);
  });

  it("throws the token away and asks for a new one when reset", async () => {
    const onToken = vi.fn();
    const {rerender} = render(<TurnstileWidget siteKey="site-key" onToken={onToken} resetSignal={0} />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    rerender(<TurnstileWidget siteKey="site-key" onToken={onToken} resetSignal={1} />);
    expect(api.reset).toHaveBeenCalledWith("widget-1");
    expect(onToken).toHaveBeenLastCalledWith(null);
  });

  it("removes the widget when it goes away", async () => {
    const {unmount} = render(<TurnstileWidget siteKey="site-key" onToken={() => {}} />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());
    unmount();
    expect(api.remove).toHaveBeenCalledWith("widget-1");
  });
});
