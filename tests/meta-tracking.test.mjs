import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));

// Exercise the actual modules without a live database or sending ad events.
function loadModule(file, mocks, globals = {}) {
  const filename = path.join(testDirectory, "..", file);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name === "node:crypto") return crypto;
      throw new Error(`Unexpected import: ${name}`);
    },
    URL, URLSearchParams, Headers, Response, AbortSignal,
    console: { error() {} },
    ...globals,
  }, { filename });
  return exports;
}

const originalConfig = { pixelId: "123456789012345", accessToken: "EAA" + "x".repeat(1200), testEventCode: "TEST123" };

function serverHarness() {
  let config = { ...originalConfig };
  let dbFailure = false;
  let response = () => Response.json({ events_received: 1 });
  const requests = [];
  const logs = [];
  const meta = loadModule("src/lib/meta.ts", {
    "next/headers": { headers: async () => new Headers({
      "x-forwarded-for": "203.0.113.8, 192.0.2.1",
      "user-agent": "Test browser",
      cookie: "session=x;_fbp=fb.1.123.456; _fbc=%broken",
    }) },
    "@/lib/db": { prisma: { setting: { findUnique: async () => {
      if (dbFailure) throw new Error("database unavailable");
      return { metaTracking: JSON.stringify(config) };
    } } } },
    "@/lib/seo": { SITE_ORIGIN: "https://example.com" },
  }, {
    fetch: async (url, options) => { requests.push({ url, options }); return response(); },
    console: { error: (...args) => logs.push(args) },
  });
  return { meta, requests, logs, setConfig: (value) => { config = value; }, failDb: () => { dbFailure = true; }, setResponse: (value) => { response = value; } };
}

test("long tokens survive validation and JSON parsing without truncation", () => {
  const { meta } = serverHarness();
  assert.equal(meta.cleanToken(` ${originalConfig.accessToken} `), originalConfig.accessToken);
  assert.equal(meta.parseMeta(JSON.stringify(originalConfig)).accessToken, originalConfig.accessToken);
  assert.equal(meta.cleanToken("x".repeat(4097)), "");
  assert.equal(meta.cleanToken('"quoted-token"'), "");
  assert.equal(meta.cleanToken("token with spaces"), "");
  assert.equal(meta.cleanPixelId("12345invalid"), "");
  assert.equal(meta.parseMeta("null").pixelId, "");
});

test("CAPI sends matching IDs, complete tokens and hashed customer information", async () => {
  const { meta, requests } = serverHarness();
  const result = await meta.trackMetaEvent({
    eventName: "ViewContent", eventId: "shared-event-id", url: "https://example.com/courses/test",
    user: { email: " Student@Example.com ", phone: "01712345678" }, contentIds: ["course-1"], value: 500,
  });
  assert.equal(result.status, "sent");
  const { url, options } = requests[0];
  assert.equal(url.includes(originalConfig.accessToken), false);
  assert.equal(options.headers.authorization, `Bearer ${originalConfig.accessToken}`);
  const payload = JSON.parse(options.body);
  assert.equal(payload.test_event_code, "TEST123");
  const event = payload.data[0];
  assert.equal(event.event_id, "shared-event-id");
  assert.equal(event.user_data.client_ip_address, "203.0.113.8");
  assert.equal(event.user_data.fbp, "fb.1.123.456");
  assert.equal(event.user_data.fbc, undefined); // Malformed cookies cannot drop events.
  const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
  assert.equal(event.user_data.em, hash("student@example.com"));
  assert.equal(event.user_data.ph, hash("8801712345678"));
  assert.equal(event.custom_data.currency, "BDT");
});

test("Meta rejection, network errors, missing config and database errors have distinct results", async () => {
  const h = serverHarness();
  const input = { eventName: "PageView", eventId: "event-1" };
  h.setResponse(() => Response.json({ error: { code: 190, message: originalConfig.accessToken } }, { status: 400 }));
  const rejected = await h.meta.trackMetaEvent(input);
  assert.equal(rejected.status, "failed");
  assert.equal(rejected.code, 190);
  assert.equal(JSON.stringify(h.logs).includes(originalConfig.accessToken), false);
  h.setResponse(() => Response.json({ events_received: 0 }));
  assert.equal((await h.meta.trackMetaEvent(input)).status, "failed");
  h.setResponse(() => { throw new Error("network failure"); });
  assert.equal((await h.meta.trackMetaEvent(input)).reason, "network");
  h.setConfig({ pixelId: originalConfig.pixelId });
  const before = h.requests.length;
  assert.equal((await h.meta.trackMetaEvent(input)).reason, "unconfigured");
  assert.equal(h.requests.length, before);
  h.failDb();
  assert.equal((await h.meta.trackMetaEvent(input)).reason, "configuration");
});

function actionHarness(options = {}) {
  const { meta } = serverHarness();
  let config = { ...originalConfig };
  let writeFailure = false;
  let trackResult = { status: "sent", eventsReceived: 1 };
  const events = [];
  const writes = [];
  const mocks = {
    "next/navigation": { redirect: (url) => { throw new Error(`REDIRECT:${url}`); } },
    "next/cache": { revalidatePath() {} }, "next/headers": {}, bcryptjs: {}, "@prisma/client": {},
    "@/lib/db": { prisma: { ...options.prisma, setting: { update: async ({ data }) => {
      if (writeFailure) throw new Error("database write failed");
      config = JSON.parse(data.metaTracking); writes.push(config);
    } } } },
    "@/lib/staff": { requireAccess: async (access) => {
      assert.equal(access, options.access ?? "settings");
      if (options.denied) throw new Error("Forbidden");
    } },
    "@/lib/audit": { logStaff: async () => {} },
    "@/lib/queries": { getSettings: async (options) => {
      assert.equal(options?.fresh, true, "saving must bypass stale worker caches");
      return { metaTracking: JSON.stringify(config) };
    }, clearPublicCache() {}, ...options.queries },
    "@/lib/meta": { ...meta, trackMetaEvent: async (event) => {
      options.onEvent?.(event);
      events.push(event); return trackResult;
    } },
    "@/lib/courses": { categories: [], levels: [] },
    "@/lib/seo": { SITE_ORIGIN: "https://example.com" },
  };
  for (const name of ["i18n/locale", "auth", "session", "promo", "uploads", "slug", "home-banners", "home-offers", "home-just-added", "video", "student-profile", "reviews"]) {
    mocks[`@/lib/${name}`] = {};
  }
  mocks["@/lib/auth"] = options.auth ?? {};
  mocks["@/lib/session"] = options.session ?? {};
  mocks["@/lib/promo"] = options.promo ?? {};
  const actions = loadModule("src/app/actions.ts", mocks, { crypto: crypto.webcrypto });
  return {
    actions, writes, events, config: () => config,
    failWrite: () => { writeFailure = true; },
    setConfig: (value) => { config = value; },
    setTrackResult: (value) => { trackResult = value; },
  };
}

test("admin saves full tokens, preserves a blank token and supports explicit removal", async () => {
  const h = actionHarness();
  const form = new FormData();
  form.set("pixelId", originalConfig.pixelId);
  const newToken = "EAA" + "y".repeat(1500);
  form.set("accessToken", newToken);
  await assert.rejects(h.actions.saveMetaPixelAction(form), /REDIRECT:.*saved=pixel/);
  assert.equal(h.config().accessToken, newToken);
  form.set("accessToken", "");
  await assert.rejects(h.actions.saveMetaPixelAction(form), /REDIRECT:.*saved=pixel/);
  assert.equal(h.config().accessToken, newToken);
  form.set("clearToken", "1");
  await assert.rejects(h.actions.saveMetaPixelAction(form), /REDIRECT:.*saved=pixel/);
  assert.equal(h.config().accessToken, "");
  form.set("accessToken", "invalid token");
  await assert.rejects(h.actions.saveMetaPixelAction(form), /REDIRECT:.*meta=token/);
  assert.equal(h.writes.length, 3);
});

test("a database write failure cannot produce a saved confirmation", async () => {
  const h = actionHarness();
  h.failWrite();
  const form = new FormData();
  form.set("pixelId", originalConfig.pixelId);
  form.set("accessToken", "new-token");
  await assert.rejects(h.actions.saveMetaPixelAction(form), /REDIRECT:.*meta=storage/);
  assert.equal(h.writes.length, 0);
  assert.equal(h.config().accessToken, originalConfig.accessToken);
});

test("admin test requires a test code and distinguishes accepted events from expired tokens", async () => {
  const h = actionHarness();
  h.setConfig({ ...originalConfig, testEventCode: "" });
  await assert.rejects(h.actions.testMetaPixelAction(), /REDIRECT:.*metaTest=code/);
  assert.equal(h.events.length, 0);
  h.setConfig(originalConfig);
  await assert.rejects(h.actions.testMetaPixelAction(), /REDIRECT:.*metaTest=sent/);
  assert.equal(h.events[0].eventName, "PageView");
  h.setTrackResult({ status: "failed", reason: "rejected", code: 190 });
  await assert.rejects(h.actions.testMetaPixelAction(), /REDIRECT:.*metaTest=token/);
});

test("public endpoint reports rejection instead of success and rejects browser Purchase events", async () => {
  let calls = 0;
  const route = loadModule("src/app/api/meta/route.ts", {
    "next/server": { NextResponse: Response }, "@/lib/auth": { getSession: async () => null },
    "@/lib/db": {}, "@/lib/meta": { trackMetaEvent: async () => { calls++; return { status: "failed", reason: "rejected", code: 190 }; } },
  });
  const response = await route.POST({ json: async () => ({ event: "PageView", eventId: "evt-1" }) });
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { ok: false, status: "failed" });
  const invalid = await route.POST({ json: async () => ({ event: "Purchase", eventId: "evt-2" }) });
  assert.equal(invalid.status, 400);
  assert.equal(calls, 1);
});

function browserHarness() {
  const effects = [];
  const timers = new Map();
  const requests = [];
  let now = 0;
  let nextTimer = 0;
  const window = {
    location: { href: "http://example.com/courses/test" },
    setTimeout: (fn, delay) => { const id = ++nextTimer; timers.set(id, { fn, at: now + delay }); return id; },
    clearTimeout: (id) => timers.delete(id),
  };
  const components = loadModule("src/components/meta-pixel.tsx", {
    react: { useEffect: (fn) => effects.push(fn) },
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }) },
    "next/navigation": { usePathname: () => "/courses/test" }, "next/script": { default: () => null },
  }, {
    window, document: { cookie: "_fbp=fb.1.123.456;_fbc=%broken" }, crypto: undefined,
    fetch: async (url, options) => { requests.push(JSON.parse(options.body)); return Response.json({ ok: true }); },
  });
  function advance(ms) {
    const end = now + ms;
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      const [id, timer] = next;
      timers.delete(id); now = timer.at; timer.fn();
    }
    now = end;
  }
  return { components, effects, window, requests, advance };
}

test("Pixel queues one PageView under Strict Mode without randomUUID and shares its CAPI ID", () => {
  const h = browserHarness();
  const script = h.components.MetaPixel({ pixelId: originalConfig.pixelId });
  assert.equal(script.props.src, "https://connect.facebook.net/en_US/fbevents.js");
  const effect = h.effects[0];
  effect()(); // Strict Mode runs setup, cleanup, setup.
  effect();
  h.advance(0);
  const queue = h.window.fbq.queue;
  assert.equal(queue.filter((args) => args[0] === "init").length, 1);
  const pageViews = queue.filter((args) => args[1] === "PageView");
  assert.equal(pageViews.length, 1);
  h.window.location.href = "http://example.com/cart";
  h.advance(400);
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].eventId, pageViews[0][3].eventID);
  assert.equal(h.requests[0].url, "http://example.com/courses/test");
  assert.equal(h.requests[0].fbc, "");
});

test("course event waits for Pixel initialization and sends matching browser/server IDs", () => {
  const h = browserHarness();
  h.components.MetaEvent({ event: "ViewContent", eventId: "course-view-1", params: { content_ids: ["course-1"] } });
  h.effects[0]();
  h.advance(0); // The page's effect can run before the parent's Pixel effect.
  h.components.MetaPixel({ pixelId: originalConfig.pixelId });
  h.effects[1]();
  h.advance(550);
  const event = h.window.fbq.queue.find((args) => args[1] === "ViewContent");
  assert.equal(event[3].eventID, "course-view-1");
  assert.equal(h.requests.find((request) => request.event === "ViewContent").eventId, "course-view-1");
});

function orderHarness(status = "pending", options = {}) {
  const order = {
    id: "order-db-1", orderId: "RS-ORDER-1", userId: "customer-1", totalBdt: 600,
    user: { id: "customer-1", name: "Customer", phone: "01712345678", email: "customer@example.com", role: "student" },
    items: [{ courseId: "course-db-1", course: { slug: "course-1", title: "Course One" } }],
  };
  const state = { status, enrollmentWrites: 0, studentIncrements: 0, committed: false };
  const snapshot = () => ({ ...order, status: state.status });
  let transactionQueue = Promise.resolve();
  const prisma = {
    order: {
      findUnique: async () => options.missing ? null : snapshot(),
      findFirst: async () => {
        const result = snapshot();
        if (options.paymentRace) state.status = "paid";
        return result;
      },
      updateMany: async ({ where, data }) => {
        const filter = where.status;
        const matches = !filter || (typeof filter === "string" ? state.status === filter
          : filter.in ? filter.in.includes(state.status) : state.status !== filter.not);
        if (where.id !== order.id || !matches) return { count: 0 };
        state.status = data.status;
        return { count: 1 };
      },
    },
    enrollment: { upsert: async () => {
      if (options.failEnrollment) throw new Error("Enrollment failed");
      state.enrollmentWrites++;
    } },
    course: {
      update: async () => { state.studentIncrements++; },
      findMany: async () => [{ id: "course-db-1", slug: "course-1", title: "Course One", priceBdt: 600 }],
    },
    user: { findUnique: async () => order.user },
    $transaction: (run) => {
      const result = transactionQueue.then(async () => {
        const before = { ...state };
        try {
          const confirmed = await run(prisma);
          if (confirmed) state.committed = true;
          return confirmed;
        } catch (error) { Object.assign(state, before); throw error; }
      });
      transactionQueue = result.catch(() => {});
      return result;
    },
  };
  const harness = actionHarness({
    access: "orders", prisma, denied: options.denied,
    auth: { requireUser: async () => order.user, getSession: async () => order.user, normalizePhone: value => value },
    queries: { getSettings: async () => ({ bkashNumber: "01712345678" }), getOwnedSlugsForUser: async () => [] },
    session: { getCart: async () => ["course-1"], setCartCookie: async () => {} },
    promo: { placeOrderWithPromo: async () => ({ orderId: order.orderId, totalBdt: order.totalBdt }) },
    onEvent: event => {
      if (event.eventName === "Purchase") {
        assert.equal(state.committed, true, "Purchase must follow a committed confirmation");
        assert.equal(state.status, "paid");
      }
    },
  });
  const form = new FormData();
  form.set("id", order.id);
  form.set("orderId", order.orderId);
  form.set("trxId", "TEST-TRX-123");
  form.set("payerNumber", order.user.phone);
  return { ...harness, state, form };
}

test("checkout and payment submission do not send Purchase; staff confirmation does", async () => {
  const h = orderHarness();
  await assert.rejects(h.actions.checkoutAction(h.form), /REDIRECT:.*checkout\/success/);
  assert.deepEqual(h.events.map(event => event.eventName), ["InitiateCheckout"]);
  await assert.rejects(h.actions.submitTrxAction(h.form), /REDIRECT:.*submitted=1/);
  assert.equal(h.state.status, "awaiting_review");
  assert.equal(h.events.some(event => event.eventName === "Purchase"), false);
  await assert.rejects(h.actions.approveOrderAction(h.form), /REDIRECT:.*admin\/orders/);
  const purchase = h.events.find(event => event.eventName === "Purchase");
  assert.equal(purchase.eventId, "purchase_RS-ORDER-1");
  assert.equal(purchase.actionSource, "phone_call");
  assert.equal(purchase.value, 600);
  assert.equal(purchase.user.phone, "01712345678");
  assert.equal(h.state.enrollmentWrites, 1);
});

test("repeat and concurrent confirmations send one Purchase and unlock courses once", async () => {
  const h = orderHarness();
  const results = await Promise.allSettled([
    h.actions.approveOrderAction(h.form), h.actions.approveOrderAction(h.form),
  ]);
  for (const result of results) assert.match(result.reason.message, /REDIRECT:.*admin\/orders/);
  await assert.rejects(h.actions.approveOrderAction(h.form), /REDIRECT:.*admin\/orders/);
  assert.equal(h.events.length, 1);
  assert.equal(h.state.enrollmentWrites, 1);
  assert.equal(h.state.studentIncrements, 1);
});

test("paid, rejected, missing and unauthorized orders cannot trigger Purchase", async () => {
  for (const [status, options] of [["paid", {}], ["rejected", {}], ["pending", { missing: true }], ["pending", { denied: true }]]) {
    const h = orderHarness(status, options);
    await assert.rejects(h.actions.approveOrderAction(h.form));
    assert.equal(h.events.length, 0);
    assert.equal(h.state.enrollmentWrites, 0);
  }
});

test("failed confirmation rolls back the order and sends no Purchase", async () => {
  const h = orderHarness("pending", { failEnrollment: true });
  await assert.rejects(h.actions.approveOrderAction(h.form), /Enrollment failed/);
  assert.equal(h.state.status, "pending");
  assert.equal(h.events.length, 0);
});

test("stale reject and payment submissions cannot reopen a confirmed order", async () => {
  const paid = orderHarness("paid");
  await assert.rejects(paid.actions.rejectOrderAction(paid.form), /REDIRECT/);
  assert.equal(paid.state.status, "paid");
  const race = orderHarness("pending", { paymentRace: true });
  await assert.rejects(race.actions.submitTrxAction(race.form), /REDIRECT/);
  assert.equal(race.state.status, "paid");
  await assert.rejects(race.actions.approveOrderAction(race.form), /REDIRECT/);
  assert.equal(race.events.length, 0);
});

test("phone-confirmed Purchase uses customer hashes without the staff browser identity", async () => {
  const { meta, requests } = serverHarness();
  await meta.trackMetaEvent({ eventName: "Purchase", eventId: "purchase_order1",
    actionSource: "phone_call", user: { phone: "01712345678", email: "customer@example.com" }, value: 600 });
  const event = JSON.parse(requests[0].options.body).data[0];
  assert.equal(event.action_source, "phone_call");
  assert.equal(event.user_data.ph.length, 64);
  for (const key of ["client_ip_address", "client_user_agent", "fbp", "fbc"]) assert.equal(event.user_data[key], undefined);
});
