const VERSION_PATTERN = /^(dev|[0-9a-f]{40})$/;

/**
 * Resolves the build version from the `KULKI_VERSION` value.
 *
 * @param {string | undefined} raw value of `KULKI_VERSION`; unset or empty means `dev`
 * @returns {string} `dev` or a 40-character lowercase hexadecimal commit id
 */
export function resolveVersion(raw) {
  const version = raw === undefined || raw === '' ? 'dev' : raw;
  if (!VERSION_PATTERN.test(version)) {
    throw new Error(
      `Invalid KULKI_VERSION "${version}": expected "dev" or 40 characters of 0-9a-f`,
    );
  }
  return version;
}
