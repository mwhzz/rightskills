import { saveAnalyticsAction, saveMetaPixelAction, savePageSeoAction, testMetaPixelAction } from "@/app/actions";
import { parseAnalytics } from "@/lib/analytics";
import { parseMeta } from "@/lib/meta";
import { parsePageSeo, parseSiteSeo, SEO_PAGES, SITE_ORIGIN } from "@/lib/seo";
import { getSettings } from "@/lib/queries";
import { requireAccess } from "@/lib/staff";

export const dynamic = "force-dynamic";

const fieldClass =
  "mt-1.5 h-11 w-full rounded-xl border border-[#eadfd4] bg-[#fffaf6] px-3 text-sm text-[#2a1810]";

const analyticsMessages: Record<string, string> = {
  gtm: "The Tag Manager ID should look like GTM-XXXXXXX. Copy it from the top of your Tag Manager workspace.",
  ga: "The Measurement ID should look like G-XXXXXXXXXX. Find it in Google Analytics under Admin > Data streams.",
  clarity: "The Clarity project ID is the short code in Settings > Overview, for example abcd1234ef.",
  storage: "Analytics settings were not saved. Check the database connection and pending migrations, then try again.",
};

const testMessages: Record<string, string> = {
  sent: "Meta accepted the server test event. Check Test events in Events Manager.",
  unconfigured: "Save both a Pixel ID and a Conversions API token before testing.",
  code: "Save a test event code from Events Manager before sending a test event.",
  token: "Meta rejected the saved token. Generate a new Conversions API token for this Pixel ID, save it, and test again.",
  rejected: "Meta rejected the event. Check that the token has access to this Pixel ID. The server log contains the Meta error code.",
  network: "The server could not reach Meta. Check the hosting server's outbound HTTPS connection and try again.",
  configuration: "The server could not read tracking settings. Check the database connection and migrations.",
};

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; meta?: string; metaTest?: string; analytics?: string }>;
}) {
  await requireAccess("settings");
  const { saved, meta, metaTest, analytics: analyticsError } = await searchParams;
  const settings = await getSettings({ fresh: true }).catch(() => null);
  if (!settings) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="font-heading text-3xl font-semibold text-[#2a1810]">SEO & Facebook tracking</h1>
        <p role="alert" className="mt-5 rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm text-[#2a1810]">
          Settings could not be loaded from the database. Check the server&apos;s database connection and apply pending database migrations before saving tracking settings.
        </p>
      </div>
    );
  }
  const savedSeo = parsePageSeo(settings?.pageSeo);
  const site = parseSiteSeo(settings?.pageSeo);
  const pixel = parseMeta(settings?.metaTracking);
  const analytics = parseAnalytics(settings?.analyticsTracking);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-[11px] font-medium tracking-[0.18em] text-[#a67c64] uppercase">
        Site
      </p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[#2a1810]">
        SEO
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[#7a5b4a]">
        This is what Google uses to list the site. The title and description are
        the two lines in the search result. A ticked page is added to the sitemap.
        Course pages are set on the course itself.
      </p>

      {saved === "1" ? (
        <p className="mt-5 rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm text-[#2a1810]">
          Saved. Submit the sitemap in Google Search Console if you have not already.
        </p>
      ) : null}

      {saved === "pixel" ? (
        <p className="mt-5 rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm text-[#2a1810]">
          Facebook tracking saved. The token stays on the server.
        </p>
      ) : null}
      {metaTest && testMessages[metaTest] ? (
        <p role="status" className="mt-5 rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm text-[#2a1810]">
          {testMessages[metaTest]}
        </p>
      ) : null}
      {meta === "pixel" ? (
        <p className="mt-5 rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm text-[#2a1810]">
          The pixel ID should be the number from Events Manager.
        </p>
      ) : null}
      {meta === "token" ? (
        <p className="mt-5 rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm text-[#2a1810]">
          Paste only the access token from Events Manager, without quotes or spaces. Tokens over 4096 characters are not supported.
        </p>
      ) : null}
      {meta === "storage" ? (
        <p role="alert" className="mt-5 rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm text-[#2a1810]">
          Tracking settings were not saved. Check the database connection and pending migrations, then try again.
        </p>
      ) : null}

      <form action={saveMetaPixelAction} className="mt-6 rounded-[1.5rem] bg-card p-4 shadow-[0_18px_40px_-28px_rgba(80,40,10,0.45)] ring-1 ring-black/5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-[#2a1810]">Facebook Pixel</h2>
        <p className="mt-2 text-sm leading-6 text-[#7a5b4a]">
          The pixel runs on the public site. The access token is used on the server
          for page views, course views, checkout, registration, and paid orders.
          Leave the token blank to keep the one already saved.
        </p>
        <p role="status" className="mt-3 text-sm font-medium text-[#2a1810]">
          Pixel: {pixel.pixelId ? "configured" : "not configured"}. Server token: {pixel.accessToken ? "saved" : "not saved"}.
        </p>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-[#8a6856]">Pixel ID</span>
          <input
            name="pixelId"
            defaultValue={pixel.pixelId}
            inputMode="numeric"
            maxLength={20}
            placeholder="123456789012345"
            className={fieldClass}
          />
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-[#8a6856]">Conversions API token</span>
          <input
            name="accessToken"
            type="password"
            autoComplete="off"
            maxLength={4096}
            placeholder={pixel.accessToken ? "Saved. Paste a new token to replace it." : "Paste the token from Events Manager"}
            className={fieldClass}
          />
          <span className="mt-1 block text-[11px] text-[#a67c64]">
            {pixel.accessToken
              ? "A token is saved in the database. This field stays empty for security; leave it empty to keep the saved token."
              : "No server token is saved yet."}
          </span>
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-[#8a6856]">Test event code</span>
          <input
            name="testEventCode"
            defaultValue={pixel.testEventCode}
            maxLength={32}
            placeholder="Optional, from the Test events tab"
            className={fieldClass}
          />
          <span className="mt-1 block text-[11px] text-[#a67c64]">
            Remove this after testing, or live events stay in the test tab.
          </span>
        </label>
        {pixel.accessToken ? (
          <label className="mt-4 flex items-center gap-3 text-sm text-[#2a1810]">
            <input type="checkbox" name="clearToken" value="1" className="size-4 accent-[#2a1810]" />
            Remove the saved token
          </label>
        ) : null}
        <button
          type="submit"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#2a1810] px-5 text-sm font-medium text-[#fff6ee]"
        >
          Save Facebook tracking
        </button>
      </form>

      <form action={testMetaPixelAction} className="mt-4">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#eadfd4] px-5 text-sm font-medium text-[#2a1810]"
        >
          Send server test event
        </button>
        <p className="mt-2 text-xs leading-5 text-[#7a5b4a]">
          Save your tracking settings and test event code first. This checks the saved token with Meta.
        </p>
      </form>

      {saved === "analytics" ? (
        <p className="mt-6 rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm text-[#2a1810]">
          Analytics saved. Tags load on the public site within a minute. Admin pages are never tracked.
        </p>
      ) : null}
      {analyticsError && analyticsMessages[analyticsError] ? (
        <p role="alert" className="mt-6 rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm text-[#2a1810]">
          {analyticsMessages[analyticsError]}
        </p>
      ) : null}

      <form action={saveAnalyticsAction} className="mt-6 rounded-[1.5rem] bg-card p-4 shadow-[0_18px_40px_-28px_rgba(80,40,10,0.45)] ring-1 ring-black/5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-[#2a1810]">Google & Microsoft Clarity</h2>
        <p className="mt-2 text-sm leading-6 text-[#7a5b4a]">
          These load on every public page. Course views and checkouts are also sent
          as view_item and begin_checkout ecommerce events. Leave a field blank to turn it off.
        </p>
        <p role="status" className="mt-3 text-sm font-medium text-[#2a1810]">
          Tag Manager: {analytics.gtmId ? "on" : "off"}. Google Analytics: {analytics.gaId ? "on" : "off"}. Clarity: {analytics.clarityId ? "on" : "off"}.
        </p>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-[#8a6856]">Google Tag Manager container ID</span>
          <input
            name="gtmId"
            defaultValue={analytics.gtmId}
            maxLength={20}
            autoCapitalize="characters"
            placeholder="GTM-XXXXXXX"
            className={fieldClass}
          />
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-[#8a6856]">Google Analytics 4 Measurement ID</span>
          <input
            name="gaId"
            defaultValue={analytics.gaId}
            maxLength={20}
            autoCapitalize="characters"
            placeholder="G-XXXXXXXXXX"
            className={fieldClass}
          />
          <span className="mt-1 block text-[11px] text-[#a67c64]">
            Optional. If your GA4 tag is already set up inside Tag Manager, leave this blank, or every visit is counted twice.
          </span>
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-[#8a6856]">Microsoft Clarity project ID</span>
          <input
            name="clarityId"
            defaultValue={analytics.clarityId}
            maxLength={20}
            placeholder="abcd1234ef"
            className={fieldClass}
          />
          <span className="mt-1 block text-[11px] text-[#a67c64]">
            In Clarity, open Settings &gt; Overview and copy the Project ID.
          </span>
        </label>
        <button
          type="submit"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#2a1810] px-5 text-sm font-medium text-[#fff6ee]"
        >
          Save analytics
        </button>
      </form>

      <form action={savePageSeoAction} className="mt-6 flex flex-col gap-4">
        <section className="rounded-[1.5rem] bg-[#2a1810] p-4 text-[#fff6ee] sm:p-6">
          <h2 className="font-heading text-lg font-semibold">Google Search Console</h2>
          <p className="mt-2 text-sm leading-6 text-[#f0d2c0]">
            Sitemap to submit: {SITE_ORIGIN}/sitemap.xml
          </p>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-[#e7cbb8]">
              Verification code
            </span>
            <input
              name="googleVerification"
              defaultValue={site.googleVerification}
              maxLength={80}
              placeholder="Paste the code only, not the full meta tag"
              className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-[#fff6ee] placeholder:text-[#c9a08c]"
            />
          </label>
          <p className="mt-2 text-[11px] leading-5 text-[#e7cbb8]">
            In Search Console, choose the HTML tag method and paste only the
            content value. Admin, account, and lesson pages stay out of Google.
          </p>
        </section>

        {SEO_PAGES.map((page) => {
          const current = savedSeo[page.key];
          const index = current?.index ?? page.index;
          return (
            <section
              key={page.key}
              className="rounded-[1.5rem] bg-card p-4 shadow-[0_18px_40px_-28px_rgba(80,40,10,0.45)] ring-1 ring-black/5 sm:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold text-[#2a1810]">
                  {page.label}
                </h2>
                <p className="text-xs text-[#a67c64]">{page.path}</p>
              </div>
              <label className="mt-4 block">
                <span className="text-xs font-medium text-[#8a6856]">Title</span>
                <input
                  name={`title-${page.key}`}
                  defaultValue={current?.title || page.title}
                  maxLength={120}
                  className={fieldClass}
                />
                <span className="mt-1 block text-[11px] text-[#a67c64]">
                  About 60 characters. This is the exact title in Google.
                </span>
              </label>
              <label className="mt-4 block">
                <span className="text-xs font-medium text-[#8a6856]">Description</span>
                <textarea
                  name={`description-${page.key}`}
                  defaultValue={current?.description || page.description}
                  maxLength={320}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-[#eadfd4] bg-[#fffaf6] px-3 py-2 text-sm leading-6 text-[#2a1810]"
                />
                <span className="mt-1 block text-[11px] text-[#a67c64]">
                  About 160 characters. Shown under the title.
                </span>
              </label>
              <label className="mt-4 block">
                <span className="text-xs font-medium text-[#8a6856]">Canonical URL</span>
                <input
                  name={`canonical-${page.key}`}
                  defaultValue={current?.canonical || ""}
                  maxLength={300}
                  placeholder={`${SITE_ORIGIN}${page.path === "/" ? "/" : page.path}`}
                  className={fieldClass}
                />
                <span className="mt-1 block text-[11px] text-[#a67c64]">
                  Leave blank to use this page&apos;s own address. Set it only if
                  Google should treat another URL as the original.
                </span>
              </label>
              <input type="hidden" name={`index-${page.key}`} value="0" />
              <label className="mt-4 flex items-start gap-3 text-sm text-[#2a1810]">
                <input
                  type="checkbox"
                  name={`index-${page.key}`}
                  value="1"
                  defaultChecked={index}
                  className="mt-0.5 size-4 accent-[#2a1810]"
                />
                <span>
                  Show this page in Google
                  <span className="mt-0.5 block text-[11px] leading-5 text-[#a67c64]">
                    {page.index
                      ? "Included in the sitemap while this is ticked."
                      : "Off by default. Cart, checkout, and login pages are not useful in search."}
                  </span>
                </span>
              </label>
            </section>
          );
        })}
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center self-start rounded-full bg-[#2a1810] px-5 text-sm font-medium text-[#fff6ee]"
        >
          Save SEO
        </button>
      </form>
    </div>
  );
}
