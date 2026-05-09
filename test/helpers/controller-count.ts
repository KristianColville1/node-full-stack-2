/**
 * Counts endpoint configs on a controller (keys that are objects with a .handler).
 * Used by counter tests to fail when endpoints are added/removed without updating tests.
 */
export function countControllerEndpoints(controller: Record<string, unknown>): number {
  return Object.keys(controller).filter((k) => {
    const v = controller[k];
    return typeof v === "object" && v !== null && "handler" in (v as object);
  }).length;
}

export function assertControllerEndpointCount(
  actual: number,
  expected: number,
  controllerName: string,
  assert: { strictEqual: (a: number, b: number, msg?: string) => void },
): void {
  if (actual < expected) {
    assert.strictEqual(
      actual,
      expected,
      `${controllerName}: controller has fewer endpoints (${actual}) than EXPECTED_ENDPOINT_COUNT (${expected}). ` +
        `Update EXPECTED_ENDPOINT_COUNT to ${actual} and remove or update tests.`,
    );
  } else if (actual > expected) {
    assert.strictEqual(
      actual,
      expected,
      `${controllerName}: controller has more endpoints (${actual}) than EXPECTED_ENDPOINT_COUNT (${expected}). ` +
        `Add a test for each new endpoint and set EXPECTED_ENDPOINT_COUNT to ${actual}.`,
    );
  }
}
