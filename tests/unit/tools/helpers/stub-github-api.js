// Preloaded with `node --import` to replace fetch: the CLI never reaches the real GitHub API.
const headSha = process.env.STUB_HEAD_SHA;
const jobs = JSON.parse(process.env.STUB_JOBS ?? '[]');

globalThis.fetch = async (/** @type {URL | RequestInfo} */ url) => {
  const body = String(url).includes('/jobs') ? { jobs } : { head_sha: headSha };
  return new Response(JSON.stringify(body), { status: 200 });
};
