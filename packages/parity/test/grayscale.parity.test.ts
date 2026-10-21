import jsfeat from "jsfeat";
import { grayscale } from "pixelvision";
import type { ChannelOrder } from "pixelvision";
import { describe, it } from "vitest";
import { expectIdentical, standardFixtures } from "../src";

const codes: Record<ChannelOrder, number> = {
  rgba: jsfeat.COLOR_RGBA2GRAY,
  rgb: jsfeat.COLOR_RGB2GRAY,
  bgra: jsfeat.COLOR_BGRA2GRAY,
  bgr: jsfeat.COLOR_BGR2GRAY,
};

describe("grayscale matches jsfeat.imgproc.grayscale", () => {
  for (const order of Object.keys(codes) as ChannelOrder[]) {
    for (const fixture of standardFixtures) {
      it(`${order}: ${fixture.name}`, () => {
        const reference = new jsfeat.matrix_t(fixture.width, fixture.height, jsfeat.U8C1_t);
        jsfeat.imgproc.grayscale(
          fixture.data,
          fixture.width,
          fixture.height,
          reference,
          codes[order],
        );

        const result = grayscale(fixture, { order });

        expectIdentical(result.data, reference.data, fixture.width * fixture.height);
      });
    }
  }
});
